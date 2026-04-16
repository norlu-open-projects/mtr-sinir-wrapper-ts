/*
 * Copyright (c) 2025, Stallone L. de Souza (@stallone-dev)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { z } from "@zod";

export { type DownloadCdfRequest, DownloadCdfRequestSchema, type DownloadCdfResponse, DownloadCdfResponseSchema };

type DownloadCdfResponse = z.infer<
    typeof DownloadCdfResponseSchema
>;
type DownloadCdfRequest = z.infer<
    typeof DownloadCdfRequestSchema
>;

const DownloadCdfResponseSchema = z.union([
    z.instanceof(ArrayBuffer).refine((e) => e.byteLength > 0, {
        message: "Nenhum byte recebido",
    }),
    z.array(z.instanceof(ArrayBuffer).refine((e) => e.byteLength > 0, {
        message: "Nenhum byte recebido",
    })),
]);

const DownloadCdfRequestSchema = z.object({
    cdfId: z.union([z.string().min(5), z.array(z.string().min(5)).nonempty()]),
    destinationFolder: z.string().min(1).optional(),
});
