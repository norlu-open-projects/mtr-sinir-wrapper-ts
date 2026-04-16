/*
 * Copyright (c) 2025, Stallone L. de Souza (@stallone-dev)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { WsMethodContext, WsResponseModel } from "~type/ws_config.type.ts";
import { parseApiInput, parseApiResponse } from "~util/validate_schema.ts";

import type { ConsultarMtrResponse } from "~service/consult/consultar_mtr/consultar_mtr.dto.ts";
import {
    type ReceberLoteMtrRequest,
    ReceberLoteMtrRequestSchema,
    type ReceberLoteMtrResponse,
    ReceberLoteMtrResponseSchema,
    SimpleReceiveInputSchema,
    type SimpleReceiveInput,
} from "~service/receive/receber_mtr/receber_mtr.dto.ts";

export { receberLoteMTRMethod, mapConsultToReceive };

function mapConsultToReceive(
    mtrConsult: ConsultarMtrResponse,
    receiveData: SimpleReceiveInput,
): ReceberLoteMtrRequest {
    const data = SimpleReceiveInputSchema.parse(receiveData);

    const residuo = mtrConsult.listaManifestoResiduo[0];

    const receiveObj: ReceberLoteMtrRequest = [{
        dataRecebimento: data.dataRecebimento ?? mtrConsult.manData,
        manNumero: mtrConsult.manNumero,
        nomeMotorista: data.motorista,
        placaVeiculo: data.placa,
        nomeResponsavelRecebimento: data.responsavel ?? mtrConsult.parceiroDestinador.parDescricao,
        observacoes: data.observacoes ?? mtrConsult.manObservacao ?? "Recebimento via API",
        listaManifestoResiduos: [{
            claCodigo: data.claCodigo ?? residuo.classe.claCodigo,
            tiaCodigo: data.tiaCodigo ?? residuo.tipoAcondicionamento.tiaCodigo,
            traCodigo: residuo.tratamento.traCodigo,
            tieCodigo: data.tieCodigo ?? residuo.tipoEstado.tieCodigo,
            uniCodigo: data.uniCodigo ?? residuo.unidade.uniCodigo,
            resCodigoIbama: residuo.residuo.resCodigoIbama,
            marQuantidade: residuo.marQuantidade,
            marQuantidadeRecebida: data.quantidade,
            marJustificativa: data.justificativa ?? "Recebimento conforme nota fiscal",
        }],
    }];

    if (data.resCodigoIbamaNovo) {
        receiveObj[0].listaManifestoResiduos[0].resCodigoIbamaNovo = data.resCodigoIbamaNovo;
    }

    if (data.traCodigoNovo) {
        receiveObj[0].listaManifestoResiduos[0].traCodigoNovo = data.traCodigoNovo;
    }

    return receiveObj;
}

async function receberLoteMTRMethod(
    ctx: WsMethodContext,
    params: ReceberLoteMtrRequest,
): Promise<ReceberLoteMtrResponse> {
    if (!ctx.baseUrl) throw new Error("Base URL ausente");
    if (!ctx.token) throw new Error("Token ausente");

    const input = parseApiInput(ReceberLoteMtrRequestSchema, params);

    const endpoint = `${ctx.baseUrl}/receberManifestoLote`;
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Authorization": ctx.token,
            "Content-Type": "application/json",
        },
        body: input,
    });

    if (!response.ok) {
        const _ = await response.text();
        throw new Error(`HTTP ${response.status} @ ${endpoint}: ${response.statusText}`);
    }

    const response_data = await response.json() as WsResponseModel<ReceberLoteMtrResponse>;
    const result = parseApiResponse(ReceberLoteMtrResponseSchema, response_data, endpoint);

    return result;
}
