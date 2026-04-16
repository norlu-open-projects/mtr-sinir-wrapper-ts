/*
 * Copyright (c) 2025, Stallone L. de Souza (@stallone-dev)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { WsMethodContext, WsResponseModel } from "~type/ws_config.type.ts";
import { join } from "@path";
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

    const mtrIds = Array.isArray(params.mtrId) ? params.mtrId : [params.mtrId];

    const results: ArrayBuffer[] = [];

    const downloadPromises = mtrIds.map(async (mtrId) => {
        const endpoint = `${ctx.baseUrl}/downloadManifesto/${mtrId}`;
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

        const buffer = await response.arrayBuffer();

        if (params.destinationFolder) {
            await Deno.writeFile(
                join(
                    params.destinationFolder,
                    createMTRFileName(mtrId),
                ),
                new Uint8Array(buffer),
            );
        }
        return buffer;
    });

    results.push(...await Promise.all(downloadPromises));

    const response_parsed: WsResponseModel<DownloadMtrResponse> = {
        erro: false,
        mensagem: "",
        totalRecords: results.length,
        objetoResposta: Array.isArray(params.mtrId) ? results : results[0],
    };

    const result = parseApiResponse(
        DownloadMtrResponseSchema,
        response_parsed,
        "",
    );

    return result;
}

function createMTRFileName(cdfId: string): string {
    const date = new Date();
    const monthRef = date.getUTCMonth() + 1;
    const dayRef = date.getUTCDate();

    const year = date.getUTCFullYear();
    const month = `${monthRef < 10 ? "0" : ""}${monthRef}`;
    const day = `${dayRef < 10 ? "0" : ""}${dayRef}`;

    return `${year}_${month}_${day}_MTR_${cdfId}.pdf`;
}
