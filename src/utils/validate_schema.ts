/*
 * Copyright (c) 2025, Stallone L. de Souza (@stallone-dev)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ZodSchema } from "@zod";
import type { WsResponseModel } from "~type/ws_config.type.ts";

export { parseApiInput, parseApiResponse };

function parseApiResponse<_>(
    schema: ZodSchema<_>,
    data: WsResponseModel<unknown>,
    endpoint: string,
): _ {
    if (data.erro) {
        const mensagem = JSON.stringify({ mensagem: data.mensagem });
        throw new Error(
            `Request recusada pela API: [${endpoint}]: \n${mensagem}]`,
        );
    }

    const parsed = schema.safeParse(data.objetoResposta);

    if (!parsed.success) {
        throw new Error(
            `Resposta inválida da API: [${endpoint}]: \n${parsed.error.message} \nDados recebidos: ${
                JSON.stringify(parsed.data)
            }`,
        );
    }

    return parsed.data;
}

function parseApiInput<_>(
    schema: ZodSchema<_>,
    data: unknown,
): string {
    const parsed = schema.safeParse(data);

    if (!parsed.success) {
        throw new Error(
            `Input inválido para API: ${parsed.error.message}. Input: ${JSON.stringify(data)}`,
        );
    }

    return JSON.stringify(parsed.data);
}
