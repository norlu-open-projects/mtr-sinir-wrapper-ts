/*
 * Copyright (c) 2026, Stallone L. de Souza (@stallone-dev)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { type RoleType, RUNTIME_PERMISSIONS } from "~config/permissions.ts";

export function mergeRuntimePermissions(roles: RoleType[]): {
    validate: string[] | "*";
    download: string[] | "*";
    consult: string[] | "*";
    create: string[] | "*";
} {
    const finalPermissions = {
        consult: [] as string[] | "*",
        create: [] as string[] | "*",
        validate: [] as string[] | "*",
        download: [] as string[] | "*",
    };

    const scopes = ["consult", "create", "validate", "download"] as const;

    for (const scope of scopes) {
        const allowedKeys = [];
        let allowAllMethodsOfScope = false;

        for (const role of roles) {
            const rule = RUNTIME_PERMISSIONS[role][scope];

            if (rule === "*") {
                allowAllMethodsOfScope = true;
                break;
            }

            if (Array.isArray(rule)) {
                allowedKeys.push(...rule);
            }
        }

        finalPermissions[scope] = allowAllMethodsOfScope ? "*" : [...new Set(allowedKeys)];
    }

    return finalPermissions;
}
