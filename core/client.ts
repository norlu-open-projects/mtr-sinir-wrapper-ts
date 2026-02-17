/*
 * Copyright (c) 2026, Stallone L. de Souza (@stallone-dev)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

// src/client.ts

import type { RoleType } from "~config/permissions.ts";
import type { ResolveAllowedKeys } from "~util/clientTypeBuilder.ts";
import { mergeRuntimePermissions } from "~util/permissionsBuilder.ts";
import type { AppContext } from "~type/appContext.ts";
import type { ProcedureDef } from "~type/procedureDefinition.ts";
import {
    ConsultDefs,
    CreateDefs,
    DownloadDefs,
    RecuseDefs as ValidateDefs, // Alias mantido conforme seu snippet
} from "./modules/contracts.ts";
import { createServiceGroup } from "~core/factory.ts";
import { v7 as uuidV7 } from "@uuid";

export class MtrClient<Roles extends RoleType[]> {
    public readonly consult: unknown;
    public readonly download: unknown;
    public readonly create: unknown;
    public readonly manage: unknown;

    private readonly ctx: AppContext;

    private constructor(config: { roles: Roles; baseUrl: string; token: string }) {
        this.ctx = {
            role: config.roles.join("_"), // String para log
            baseUrl: config.baseUrl ?? "",
            token: config.token,
            sessionId: uuidV7.generate(),
        };

        // Permissões
        const clientPermissions = mergeRuntimePermissions(config.roles);

        // Factory
        this.consult = createServiceGroup(ConsultDefs, this.ctx, clientPermissions.consult);
        this.download = createServiceGroup(DownloadDefs, this.ctx, clientPermissions.download);
        this.create = createServiceGroup(CreateDefs, this.ctx, clientPermissions.create);
        this.manage = createServiceGroup(ValidateDefs, this.ctx, clientPermissions.validate);
    }

    public static init<R extends RoleType[]>(
        config: { roles: R; baseUrl: string; token: string },
    ): WrappedClient<R> {
        return new MtrClient(config) as unknown as WrappedClient<R>;
    }
}

/**
 * Helper que transforma um objeto de definições em métodos
 */
type GenerateApi<Defs, AllowedKeys> = {
    [K in keyof Pick<Defs, AllowedKeys & keyof Defs>]: Defs[K] extends ProcedureDef<infer Input, infer Output>
        ? (input: Input) => Promise<Output>
        : never;
};

/**
 * Define exatamente quais métodos existem para os Roles informados.
 */
export type WrappedClient<R extends RoleType[]> = {
    readonly consult: GenerateApi<
        typeof ConsultDefs,
        ResolveAllowedKeys<R, "consult", typeof ConsultDefs>
    >;
    readonly download: GenerateApi<
        typeof DownloadDefs,
        ResolveAllowedKeys<R, "download", typeof DownloadDefs>
    >;
    readonly create: GenerateApi<
        typeof CreateDefs,
        ResolveAllowedKeys<R, "create", typeof CreateDefs>
    >;
    readonly validate: GenerateApi<
        typeof ValidateDefs,
        ResolveAllowedKeys<R, "validate", typeof ValidateDefs>
    >;
};
