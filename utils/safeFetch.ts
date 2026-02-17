/*
 * Copyright (c) 2026, Stallone L. de Souza (@stallone-dev)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { z } from "@zod";
import { type Span, SpanStatusCode } from "@opentelemetry";
import { logger, tracer } from "~config/observability.ts";
import { MtrWrapperError } from "~config/errors.ts";
import { RawDownloadedFile } from "~util/rawDownloadedFile.ts";

/**
 * Executor HTTP resiliente com Observabilidade e Validação de Contrato.
 * @template TOutput - O tipo de retorno inferido pelo Zod.
 * @param url - URL completa de destino.
 * @param init - Configurações fetch (headers, method, body).
 * @param schema - Schema Zod (Runtime Type Check).
 * @param isBinary - Se true, trata a resposta como arquivo (Buffer) e ignora JSON parse.
 */
export async function safeFetch<TOutput>(
    url: string,
    init: RequestInit,
    schema: z.ZodSchema<TOutput>,
    isBinary = false,
): Promise<TOutput> {
    const method = init.method ?? "GET";

    return await tracer.startActiveSpan(`HTTP ${method}`, async (span) => {
        span.setAttributes({
            "http.url": url,
            "http.method": method,
            "http.target": new URL(url).pathname,
        });
        logger.debug(`Disparando requisição`, { method, url });

        try {
            const response = await fetch(url, init);
            span.setAttribute("http.status_code", response.status);

            const contentType = response.headers.get("content-type") || "";

            // CENÁRIO 1: HTTP Error 400/500
            if (!response.ok) {
                const errorBody = await tryParseErrorBody(response);

                logger.warn("Erro HTTP detectado na API", {
                    status: response.status,
                    url,
                    errorBody,
                });

                handleSpanError(span, errorBody);

                throw new MtrWrapperError(response.status, errorBody, url);
            }

            // CENÁRIO 2: Arquivo PDF
            if (isBinary) {
                if (contentType.includes("application/json")) {
                    // Lemos o JSON para entender o erro
                    const errorJson = await response.json().catch(() => ({ message: "Erro desconhecido em download" }));

                    logger.warn("API retornou JSON em endpoint de binário", { url, errorJson });

                    const msg = JSON.stringify(errorJson);
                    handleSpanError(span, { message: msg, name: "Erro desconhecido no binary" } as Error);

                    throw new MtrWrapperError(200, `Falha no Download: ${msg}`, url);
                }
                return handleBinaryResponse(response, span) as TOutput;
            }

            // CENÁRIO 3: HTML
            // Às vezes a API retorna uma página HTML de erro ou outras mensagens
            if (contentType.includes("text/html")) {
                const htmlText = await response.text();
                const snippet = htmlText.slice(0, 200);

                logger.error("Recebido HTML do endpoint", { url, snippet });
                handleSpanError(span, { message: "Recebido HTML do endpoint", name: "HTML inesperado" } as Error);

                throw new MtrWrapperError(
                    200,
                    `Conteúdo inesperado (HTML) recebido: ${snippet}...`,
                    url,
                );
            }

            // CENÁRIO 4: Sucesso JSON (Parse Seguro)
            let rawData: unknown;
            const responseText = await response.text();
            try {
                if (!responseText.trim()) throw new Error("Body vazio");
                rawData = JSON.parse(responseText);
            }
            catch (jsonError) {
                const snippet = responseText.slice(0, 500);
                const isHtml = responseText.trim().toLowerCase().startsWith("<");

                const reason = isHtml
                    ? "Recebido HTML em vez de JSON, provável Proxy/Getway da API"
                    : "Sintaxe JSON inválida";

                logger.error("Falha crítica no Parse JSON", {
                    url,
                    status: response.status,
                    reason,
                    error: jsonError,
                    snippet,
                });

                handleSpanError(span, jsonError);

                throw new MtrWrapperError(
                    response.status,
                    `Falha ao processar resposta: ${reason}. Conteúdo: "${snippet}..."`,
                    url,
                );
            }

            const validation = schema.safeParse(rawData);

            if (!validation.success) {
                logger.error("Violação de Schema", {
                    url,
                    errors: z.treeifyError(validation.error),
                });

                handleSpanError(span, validation.error);

                throw new Error(`Schema da API violado: ${validation.error.message}`);
            }

            // Sucesso Total
            span.setStatus({ code: SpanStatusCode.OK });
            return validation.data;
        }
        catch (error) {
            // CENÁRIO 5: Requisição Mal Feita / Erro de Rede
            handleSpanError(span, error);
            logger.fatal("Erro crítico de requisição/rede", {
                url,
                errors: error,
            });
            throw error;
        }
        finally {
            span.end();
        }
    });
}

// Helpers

async function tryParseErrorBody(response: Response): Promise<unknown> {
    const text = await response.text();
    try {
        // Tenta detectar JSON mesmo se o header estiver errado
        if (text.startsWith("{") || text.startsWith("[")) {
            return JSON.parse(text);
        }
        return text;
    }
    catch {
        return text;
    }
}

async function handleBinaryResponse(response: Response, span: Span): Promise<RawDownloadedFile> {
    const buffer = await response.arrayBuffer();

    const disposition = response.headers.get("content-disposition");
    let fileName = "arquivo_desconhecido";

    // Tenta extrair filename
    if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(/filename=["']?([^"';]+)["']?/);
        if (match && match[1]) {
            fileName = match[1];
        }
    }

    // Adiciona extensão se não tiver, baseado no content-type
    if (!fileName.includes(".") && response.headers.get("content-type")?.includes("pdf")) {
        fileName += ".pdf";
    }

    span.setAttribute("file.name", fileName);
    span.setAttribute("file.size", buffer.byteLength);

    return new RawDownloadedFile(
        buffer,
        fileName,
        response.headers.get("content-type") || "application/octet-stream",
    );
}

function handleSpanError(span: Span, error: unknown): void {
    if (error instanceof Error) {
        span.recordException(error);
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
    }
    else {
        span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
    }
}
