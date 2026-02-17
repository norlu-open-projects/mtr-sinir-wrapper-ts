# MTR SINIR/SIGOR WebService wrapper for TypeScript

[![jsr.io/@mtr-ws/mtr-ws-wrapper-ts](https://jsr.io/badges/@mtr-ws/mtr-ws-wrapper-ts)](https://jsr.io/@mtr-ws/mtr-ws-wrapper-ts)
[![jsr.io/@mtr-ws/mtr-ws-wrapper-ts score](https://jsr.io/badges/@mtr-ws/mtr-ws-wrapper-ts/score)](https://jsr.io/@mtr-ws/mtr-ws-wrapper-ts)

Wrapper `TrypeScript` para consumo das APIs do [MTR WebService - SINIR/SIGOR](https://cetesb.sp.gov.br/sigor-mtr/web-service/) para consumo de MTRs.
Baseado na versão: `SIGOR - 1.15.0 - 21/08/24`

Neste projeto está implementado:

|    Grupo de rotas     | Namespace              |
| :-------------------: | :--------------------- |
|   Consulta de dados   | `MtrWsClient.consult`  |
|  Recebimento de MTRs  | `MtrWsClient.receive`  |
| Download de MTRs/CDFs | `MtrWsClient.download` |

Também exporta os tipos utilizados na API através do `MtrWSType`:

|  Grupo de interfaces  | Namespace                     |
| :-------------------: | :---------------------------- |
|   Consulta de dados   | `MtrWSType.ConsultInterface`  |
|  Recebimento de MTRs  | `MtrWSType.ReceiveInterface`  |
| Download de MTRs/CDFs | `MtrWSType.DownloadInterface` |
|   Configs do client   | `MtrWSType.WsClientInterface` |

## Features

<details><summary><strong>Logger estruturado</strong></summary>

- Estruturação utilizando [LogTape](https://logtape.org/manual/start)
- Tag principal: `mtr-ws-wrapper-ts`
  <details><summary>Configuração sugerida</summary>

```ts
import { configure, getConsoleSink } from "@logtape/logtape";
import { getOpenTelemetrySink } from "@logtape/otel";
import { prettyFormatter } from "@logtape/pretty";

await configure({
    sinks: {
        console: getConsoleSink({ formatter: prettyFormatter }),
        otel: getOpenTelemetrySink(),
    },
    loggers: [
        {
            category: ["mtr-ws-wrapper-ts"],
            lowestLevel: "info",
            sinks: ["console"],
        },
        {
            category: [],
            lowestLevel: "debug",
            sinks: ["otel"],
        },
    ],
});
```

</details>
- Fruits
- Fish

</details>

## Instalação

Este pacote está distribuído exclusivamente através do [JavaScript Registry (JSR)](https://jsr.io/@mtr-ws/mtr-ws-wrapper-ts).

```bash
deno add        jsr:@mtr-ws/mtr-ws-wrapper-ts # for Deno
bunx jsr add        @mtr-ws/mtr-ws-wrapper-ts # for bun
npx  jsr add        @mtr-ws/mtr-ws-wrapper-ts # for npm
pnpm i          jsr:@mtr-ws/mtr-ws-wrapper-ts # for pnpm
yarn add        jsr:@mtr-ws/mtr-ws-wrapper-ts # for yarn
vlt install     jsr:@mtr-ws/mtr-ws-wrapper-ts # for vlt
```

## Aplicação

```ts
import { MtrWsClient, type MtrWsType } from "./mod.ts";

const clientConfig: MtrWsType.WsClientInterface<"GERADOR"> = {
    baseWebServer: "SINIR", // OR "SIGOR"
    role: "GERADOR", // OR "TRANSPORTADOR" | "DESTINADOR"
    cpf: "12345678900",
    senha: "MYPASS",
    unidade: "123456",
    persistentId: "MyID",
};

// Client para execução
const client = await MtrWsClient(clientConfig);

const residuos = await client.consult.listarResiduos();
const tratamentos = await client.consult.listarTratamentos();
const dadosMtr = await client.consult.consultarMtr("12312316546");
const classesPorResiduo = await client.consult.listarClassesPorResiduo("200301");
// [...]

// Capturar buffer do arquivo PDF
const arrayBufferPDFMTR = await client.download.downloadMtr({ mtrId: "12312316546" });
// Salvar arquivo PDF em diretório local
await client.download.downloadMtr({ mtrId: "12312316546", destinationFolder: "./myFolder" });
```
