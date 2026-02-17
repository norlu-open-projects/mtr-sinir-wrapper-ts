/*
 * Copyright (c) 2026, Stallone L. de Souza (@stallone-dev)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export class MtrWrapperError extends Error {
    constructor(
        public readonly statusCode: number,
        public readonly body: unknown,
        public readonly url: string,
        options?: ErrorOptions,
    ) {
        const summary = `HTTP ${statusCode}`;
        super(`MTR Wrapper Error: [${summary}] calling ${url}`, options);
        this.name = "MtrWrapperError";
    }

    toJSON(): {
        name: string;
        message: string;
        statusCode: number;
        url: string;
        body: unknown;
        stack: string | undefined;
        cause: unknown;
    } {
        return {
            name: this.name,
            message: this.message,
            statusCode: this.statusCode,
            url: this.url,
            body: this.body,
            stack: this.stack,
            cause: this.cause,
        };
    }
}
