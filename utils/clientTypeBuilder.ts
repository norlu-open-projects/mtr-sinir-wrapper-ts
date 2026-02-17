/*
 * Copyright (c) 2026, Stallone L. de Souza (@stallone-dev)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { RoleType, RUNTIME_PERMISSIONS } from "~config/permissions.ts";

type PermissionSchema = typeof RUNTIME_PERMISSIONS;

type PermissionScope = keyof PermissionSchema[RoleType];

/**
 * ResolveAllowedKeys
 * Calcula a união de chaves permitidas baseada em N roles.
 * @template Roles - Array (Tupla) contendo os Roles do usuário.
 * @template Scope - O nome do grupo de métodos.
 * @template AllDefs - O objeto contendo as definições dos métodos (Zod/Path).
 */
export type ResolveAllowedKeys<
    Roles extends readonly RoleType[],
    Scope extends PermissionScope,
    AllDefs extends Record<string, unknown>,
> = {
    // Mapeamos sobre cada Role fornecido no array
    [R in Roles[number]]: PermissionSchema[R][Scope] extends "*"
        // Verificando se há permissão geral
        ? keyof AllDefs
        // Capturando permissões específicas
        : PermissionSchema[R][Scope] extends readonly (infer MethodName)[] ? MethodName & keyof AllDefs
        : never;
}[Roles[number]];
