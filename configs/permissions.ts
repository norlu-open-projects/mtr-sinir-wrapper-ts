/*
 * Copyright (c) 2026, Stallone L. de Souza (@stallone-dev)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export const RUNTIME_PERMISSIONS = {
    GERADOR: {
        consult: "*",
        create: "*",
        validate: "*",
        download: "*",
    },
    TRANSPORTADOR: {
        consult: "*",
        create: [],
        validate: [],
        download: ["downloadMtr"],
    },
    RECEPTOR: {
        consult: "*",
        create: [],
        validate: "*",
        download: "*",
    },
} as const;

export type RoleType = keyof typeof RUNTIME_PERMISSIONS;
