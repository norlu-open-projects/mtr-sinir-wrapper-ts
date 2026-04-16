/*
 * Copyright (c) 2025, Stallone L. de Souza (@stallone-dev)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { z } from "@zod";

export { type ConsultarMtrRequest, ConsultarMtrRequestSchema, type ConsultarMtrResponse, ConsultarMtrResponseSchema };

type ConsultarMtrResponse = z.infer<typeof ConsultarMtrResponseSchema>;
type ConsultarMtrRequest = z.infer<typeof ConsultarMtrRequestSchema>;

const ConsultarMtrResponseSchema = z.object({
    manNumero: z.string(),
    manData: z.number(),
    manResponsavel: z.string(),
    manDataExpedicao: z.number().or(z.null()),
    manNomeMotorista: z.string(),
    manPlacaVeiculo: z.string(),
    manObservacao: z.string().or(z.null()),
    manJustificativaCancelamento: z.string(),
    estado: z.object({
        estCodigo: z.number(),
        estAbreviacao: z.string(),
    }),

    parceiroGerador: z.object({
        parCodigo: z.number(),
        parDescricao: z.string(),
        parCnpj: z.string(),
    }),
    parceiroTransportador: z.object({
        parCodigo: z.number(),
        parDescricao: z.string(),
        parCnpj: z.string(),
    }),
    parceiroDestinador: z.object({
        parCodigo: z.number(),
        parDescricao: z.string(),
        parCnpj: z.string(),
    }),
    parceiroArmazenadorTemporario: z.object({
        parCodigo: z.number().or(z.null()),
        parDescricao: z.string(),
        parCnpj: z.string().or(z.null()),
    }),
    situacaoManifesto: z.object({
        simCodigo: z.number(),
        simDescricao: z.string(),
        simOrdem: z.number(),
        simDataRecebimento: z.string().optional(),
    }),
    manNumeroEstadual: z.string().or(z.null()),
    cdfNumero: z.number().or(z.null()),
    dataRecebimentoAT: z.string().optional(),
    listaManifestoResiduo: z.array(
        z.object({
            residuo: z.object({
                resCodigo: z.number(),
                resCodigoIbama: z.string(),
                resDescricao: z.string(),
            }),
            unidade: z.object({
                uniCodigo: z.number(),
                uniDescricao: z.string(),
                uniSigla: z.string(),
            }),
            tratamento: z.object({
                traCodigo: z.number(),
                traDescricao: z.string(),
            }),
            tipoEstado: z.object({
                tieCodigo: z.number(),
                tieDescricao: z.string(),
            }),
            tipoAcondicionamento: z.object({
                tiaCodigo: z.number(),
                tiaDescricao: z.string(),
            }),
            classe: z.object({
                claCodigo: z.number(),
                claDescricao: z.string(),
                claResolucao: z.string(),
            }),
            marQuantidade: z.number(),
            marQuantidadeRecebida: z.number().or(z.null()),
            marDensidade: z.number().or(z.null()),
            marJustificativa: z.string().or(z.null()),
            marObservacao: z.string().or(z.null()),
            marNumeroONU: z.string().or(z.null()),
            marClasseRisco: z.string().or(z.null()),
            marNomeEmbarque: z.string().or(z.null()),
            grupoEmbalagem: z.object({
                greCodigo: z.number(),
                greDescricao: z.string(),
            }).or(z.null()),
            marDescricaoInterna: z.string().or(z.null()),
            marCodigoInterno: z.string().or(z.null()),
        }),
    ).nonempty(),
});

const ConsultarMtrRequestSchema = z.string().min(12);
