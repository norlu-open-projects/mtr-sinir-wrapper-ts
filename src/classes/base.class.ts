/*
 * Copyright (c) 2025, Stallone L. de Souza (@stallone-dev)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { WsAuth } from "~service/main.service.ts";
import type { MetadataForInstrumentation } from "~util/instrumentation.ts";
import { WsBaseToBaseURL } from "~util/translate_base_to_url.ts";
import type { WsBaseURL, WsClientConfig, WsMethodContext, WsUserRole } from "~type/ws_config.type.ts";

import { createConsultMethods } from "~service/consult/consult.methods.ts";
import { createDownloadMethods } from "~service/download/download.methods.ts";

export { BaseMtrWsClient };

/** */
abstract class BaseMtrWsClient {
    public readonly consult;
    public readonly download;

    protected readonly token: string;
    protected readonly baseUrl: WsBaseURL;
    protected readonly role: WsUserRole;
    protected readonly sessionId: string;
    protected readonly userPersistentId: string;
    protected readonly _ctx: WsMethodContext;
    protected readonly _metaData: MetadataForInstrumentation;

    protected constructor(config: WsClientConfig, token: string) {
        this.token = token;
        this.baseUrl = WsBaseToBaseURL(config.baseWebServer);
        this.role = config.role;
        this.sessionId = "";
        this.userPersistentId = config.persistentId ?? "";
        this._ctx = { baseUrl: this.baseUrl, token };
        this._metaData = {
            sessionId: this.sessionId,
            userPersistentId: this.userPersistentId,
            userRole: this.role,
        };

        this.consult = createConsultMethods(this._ctx, this._metaData);
        this.download = createDownloadMethods(this._ctx, this._metaData);
    }

    public static async init<T extends BaseMtrWsClient>(
        this: new (params: WsClientConfig, token: string) => T,
        params: WsClientConfig,
    ): Promise<T> {
        const token = await WsAuth(
            WsBaseToBaseURL(params.baseWebServer),
            {
                cpfCnpj: String(params.cpf),
                senha: String(params.senha),
                unidade: String(params.unidade),
            },
            params.persistentId,
        );
        return new this(params, token);
    }
}
