/*
 * Copyright (c) 2026, Stallone L. de Souza (@stallone-dev)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Arquivo retornado pela API, com manipuladores para diferentes contextos
 */
export class RawDownloadedFile {
    constructor(
        private readonly _buffer: ArrayBuffer,
        public readonly fileName: string,
        public readonly contentType: string = "application/pdf",
    ) {}

    get byteSize(): number {
        return this._buffer.byteLength;
    }

    /**
     * Retorna os dados como ArrayBuffer.
     */
    public toArrayBuffer(): ArrayBuffer {
        return this._buffer;
    }

    /**
     * Retorna os dados como Uint8Array.
     */
    public toUint8Array(): Uint8Array {
        return new Uint8Array(this._buffer);
    }

    /**
     * Retorna os dados como um Blob.
     */
    public toBlob(): Blob {
        return new Blob([this._buffer], { type: this.contentType });
    }

    /**
     * Retorna o arquivo em Base64
     */
    public toBase64(): string {
        const uint8 = this.toUint8Array();
        let binary = "";
        const len = uint8.byteLength;

        // Processamento em chunks para evitar "Maximum call stack size exceeded"
        const CHUNK_SIZE = 0x8000; // 32KB
        for (let i = 0; i < len; i += CHUNK_SIZE) {
            binary += String.fromCharCode.apply(
                null,
                Array.from(uint8.subarray(i, Math.min(i + CHUNK_SIZE, len))),
            );
        }

        return btoa(binary);
    }

    /**
     * Salva o arquivo no disco local
     * @todo Somente no ambiente Deno ou NodeJs
     * @param path - Caminho completo ou relativo (ex: "./downloads/mtr.pdf")
     */
    public async saveToFile(path: string): Promise<void> {
        const data = this.toUint8Array();

        // Detecta Deno
        if (typeof Deno !== "undefined") {
            await Deno.writeFile(path, data);
            return;
        }

        // Detecta Node.js
        // @ts-ignore: Variável do NodeJS
        // deno-lint-ignore no-process-global no-undef
        if (typeof process !== "undefined" && process.versions?.node) {
            try {
                const fs = await import("node:fs/promises");
                await fs.writeFile(path, data);
                return;
            }
            catch (err) {
                throw new Error(`Falha ao carregar módulo fs do Node: ${err}`);
            }
        }

        // Fallback
        throw new Error(
            "O método .save() não é suportado neste ambiente (Browser/Edge).\nUse .toBlob() ou .toBase64() para manipular o arquivo.",
        );
    }
}
