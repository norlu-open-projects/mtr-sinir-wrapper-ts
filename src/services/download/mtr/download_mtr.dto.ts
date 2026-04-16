/*
 * Copyright (c) 2025, Stallone L. de Souza (@stallone-dev)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { z } from "@zod";

export { type DownloadMtrRequest, DownloadMtrRequestSchema, type DownloadMtrResponse, DownloadMtrResponseSchema };

type DownloadMtrResponse = z.infer<
    typeof DownloadMtrResponseSchema
>;
type DownloadMtrRequest = z.infer<
    typeof DownloadMtrRequestSchema
>;

const DownloadMtrResponseSchema = z.union([
    z.instanceof(ArrayBuffer).refine((e) => e.byteLength > 0, {
        message: "Nenhum byte recebido",
    }),
    z.array(z.instanceof(ArrayBuffer).refine((e) => e.byteLength > 0, {
        message: "Nenhum byte recebido",
    })),
]);

const DownloadMtrRequestSchema = z.object({
    mtrId: z.union([z.string().min(5), z.array(z.string().min(5)).nonempty()]),
    destinationFolder: z.string().min(1).optional(),
});
