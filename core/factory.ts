/*
 * Copyright (c) 2026, Stallone L. de Souza (@stallone-dev)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ProcedureDef } from "~type/procedureDefinition.ts";
import { type Span, SpanStatusCode } from "@opentelemetry";
import { safeFetch } from "~util/safeFetch.ts";
import { logger, tracer } from "~config/observability.ts";
import type { AppContext } from "~type/appContext.ts";

/**
 * Tipo auxiliar que mapeia as definições estáticas para funções executáveis.
 */
type ServiceGroup<T> = {
    [K in keyof T]: T[K] extends ProcedureDef<infer I, infer O> ? (input: I) => Promise<O>
        : never;
};

/**
 * Factory de Serviços Instrumentada.
 *
 * @param groupName - Nome do módulo (ex: "manage", "consult") para telemetria.
 * @param definitions - O contrato estático do módulo.
 * @param ctx - Contexto global da instância do cliente.
 * @param allowedMethods - Firewall de permissões em runtime.
 */
export function createServiceGroup<T extends Record<string, ProcedureDef<unknown, unknown>>>(
    groupName: string,
    definitions: T,
    ctx: AppContext,
    allowedMethods: string[] | "*",
): ServiceGroup<T> | undefined {
    // Se não houver métodos permitidos, remove o grupo da memória
    if (Array.isArray(allowedMethods) && allowedMethods.length === 0) {
        return undefined;
    }

    const service: Record<string, (input: unknown) => Promise<unknown>> = {};

    for (const [key, def] of Object.entries(definitions)) {
        const isAllowed = allowedMethods === "*" || allowedMethods.includes(key);
        if (!isAllowed) continue;

        // Implementação do método
        service[key] = async (input: unknown): Promise<unknown> => {
            const spanName = `${ctx.role}.${groupName}.${key}`;

            return await tracer.startActiveSpan(spanName, async (span: Span) => {
                try {
                    span.setAttributes({
                        "rpc.system": "mtr-sinir-wrapper",
                        "rpc.service": `${ctx.role}.${groupName}`,
                        "rpc.method": key,
                        "mtr.session_id": ctx.sessionId,
                    });

                    let urlPath: string;
                    try {
                        urlPath = def.path(input);
                        span.setAttribute("http.target", urlPath);
                    }
                    catch (error) {
                        logger.error("Erro de lógica ao construir URL", {
                            group: groupName,
                            method: key,
                            error,
                        });
                        throw new Error(`[ConfigError] Parâmetros inválidos para o método ${groupName}.${key}`);
                    }

                    // Log de Execução
                    logger.info(`Chamando {group}.{method}`, {
                        group: groupName,
                        method: key,
                        role: ctx.role,
                        sessionId: ctx.sessionId,
                    });

                    const fullUrl = `${ctx.baseUrl}${urlPath}`;

                    // Delegação para o SafeFetch
                    const result = await safeFetch(
                        fullUrl,
                        {
                            method: def.method,
                            headers: {
                                "Authorization": ctx.token,
                                "Content-Type": "application/json",
                                "X-Correlation-ID": ctx.sessionId,
                            },
                            body: def.method !== "GET" ? JSON.stringify(input) : null,
                        },
                        def.schema,
                        def.isBinary,
                    );

                    span.setStatus({ code: SpanStatusCode.OK });
                    return result;
                }
                catch (err) {
                    if (err instanceof Error) {
                        span.recordException(err);
                        span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
                    }
                    else {
                        // Fallback para erros não-padronizados (ex: throw "string")
                        span.setStatus({ code: SpanStatusCode.ERROR, message: String(err) });
                    }
                    throw err;
                }
                finally {
                    span.end();
                }
            });
        };
    }

    return service as ServiceGroup<T>;
}
