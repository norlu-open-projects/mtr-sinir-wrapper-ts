/*
 * Copyright (c) 2026, Stallone L. de Souza (@stallone-dev)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { z } from "@zod";

/**
 * Definição Genérica de um Procedimento do Endpoint
 * @template TInput - O tipo de dado de entrada.
 * @template TOutput - O tipo de dado de saída.
 */
export type ProcedureDef<TInput = unknown, TOutput = unknown> = {
    path: (input: TInput) => string;
    method: "GET" | "POST";
    schema: z.ZodSchema<TOutput>;

    // Indica que a resposta é um stream (pdf)
    isBinary?: boolean;
};
