/*
 * Copyright (c) 2025, Stallone L. de Souza (@stallone-dev)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { WsMethodContext } from "~type/ws_config.type.ts";
import { FnWithInstrumentation, type MetadataForInstrumentation } from "~util/instrumentation.ts";
import { mapConsultToReceive, receberLoteMTRMethod } from "./receber_mtr/receber_mtr.service.ts";

export { createReceiveMethods };

// deno-lint-ignore explicit-function-return-type
function createReceiveMethods(
    ctx: WsMethodContext,
    metaData: MetadataForInstrumentation,
) {
    function wrap<R>(
        fn: (ctx: WsMethodContext) => Promise<R>,
        spanName: string,
    ): () => Promise<R>;

    function wrap<P, R>(
        fn: (ctx: WsMethodContext, payload: P) => Promise<R>,
        spanName: string,
    ): (payload: P) => Promise<R>;

    function wrap<P, R>(
        fn: (ctx: WsMethodContext, payload?: P) => Promise<R>,
        spanName: string,
    ): () => Promise<R> {
        return (payload?: P) =>
            FnWithInstrumentation(
                () => fn(ctx, payload),
                { ...metaData, spanName },
                "receive",
                payload,
            );
    }

    return {
        receberLoteMtrs: wrap(receberLoteMTRMethod, `${metaData.userRole}.receberLoteMtrs`),
        mapConsultToReceive: mapConsultToReceive,
    };
}
