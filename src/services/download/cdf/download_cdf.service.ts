/*
 * Copyright (c) 2025, Stallone L. de Souza (@stallone-dev)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { WsMethodContext, WsResponseModel } from "~type/ws_config.type.ts";
import { parseApiInput, parseApiResponse } from "~util/validate_schema.ts";

import {
    type DownloadCdfRequest,
    DownloadCdfRequestSchema,
    type DownloadCdfResponse,
    DownloadCdfResponseSchema,
} from "~service/download/cdf/download_cdf.dto.ts";

export { downloadCDFMethod };

async function downloadCDFMethod(
    ctx: WsMethodContext,
    params: DownloadCdfRequest,
): Promise<DownloadCdfResponse> {
    if (!ctx.baseUrl) throw new Error("Base URL ausente");
    if (!ctx.token) throw new Error("Token ausente");

    parseApiInput(DownloadCdfRequestSchema, params);

    const endpoint = `${ctx.baseUrl}/downloadCertificado/${params.cdfId}`;
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

    const response_parsed: WsResponseModel<DownloadCdfResponse> = {
        erro: false,
        mensagem: "",
        totalRecords: 1,
        objetoResposta: await response.arrayBuffer(),
    };

    const result = parseApiResponse(
        DownloadCdfResponseSchema,
        response_parsed,
        endpoint,
    );

    return result;
}
