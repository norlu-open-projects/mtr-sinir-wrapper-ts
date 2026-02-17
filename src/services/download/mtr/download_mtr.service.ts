/*
 * Copyright (c) 2025, Stallone L. de Souza (@stallone-dev)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { WsMethodContext, WsResponseModel } from "~type/ws_config.type.ts";
import { parseApiInput, parseApiResponse } from "~util/validate_schema.ts";

import {
    type DownloadMtrRequest,
    DownloadMtrRequestSchema,
    type DownloadMtrResponse,
    DownloadMtrResponseSchema,
} from "~service/download/mtr/download_mtr.dto.ts";

export { downloadMTRMethod };

async function downloadMTRMethod(
    ctx: WsMethodContext,
    params: DownloadMtrRequest,
): Promise<DownloadMtrResponse> {
    if (!ctx.baseUrl) throw new Error("Base URL ausente");
    if (!ctx.token) throw new Error("Token ausente");

    parseApiInput(DownloadMtrRequestSchema, params);

    const endpoint = `${ctx.baseUrl}/downloadManifesto/${params.mtrId}`;
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Authorization": ctx.token,
            "Accept": "application/pdf",
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const _ = await response.text();
        throw new Error(
            `HTTP ${response.status} @ ${endpoint}: ${response.statusText}`,
        );
    }

    const response_parsed: WsResponseModel<DownloadMtrResponse> = {
        erro: false,
        mensagem: "",
        totalRecords: 1,
        objetoResposta: await response.arrayBuffer(),
    };

    const result = parseApiResponse(
        DownloadMtrResponseSchema,
        response_parsed,
        endpoint,
    );

    return result;
}
