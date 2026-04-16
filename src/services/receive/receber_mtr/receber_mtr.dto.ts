/*
 * Copyright (c) 2025, Stallone L. de Souza (@stallone-dev)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { z } from "@zod";

export {
    type ReceberLoteMtrRequest,
    ReceberLoteMtrRequestSchema,
    type ReceberLoteMtrResponse,
    ReceberLoteMtrResponseSchema,
    type SimpleReceiveInput,
    SimpleReceiveInputSchema,
};

type ReceberLoteMtrRequest = z.infer<typeof ReceberLoteMtrRequestSchema>;
type ReceberLoteMtrResponse = z.infer<typeof ReceberLoteMtrResponseSchema>;
type SimpleReceiveInput = z.infer<typeof SimpleReceiveInputSchema>;

const SimpleReceiveInputSchema = z.object({
    motorista: z.string().min(1),
    placa: z.string().min(1),
    quantidade: z.number().min(0),
    responsavel: z.string().optional(),
    observacoes: z.string().optional(),
    dataRecebimento: z.number().optional(),
    justificativa: z.string().optional(),
    resCodigoIbamaNovo: z.string().optional(),
    traCodigoNovo: z.number().optional(),
    uniCodigo: z.number().optional(),
    tieCodigo: z.number().optional(),
    tiaCodigo: z.number().optional(),
    claCodigo: z.number().optional(),
});

const ReceberLoteMtrResponseSchema = z.array(
    z.object({
        restResponseValido: z.boolean(),
        restResponseMensagem: z.string(),
        manNumero: z.string(),
        dataRecebimento: z.number(),
        nomeMotorista: z.string(),
        placaVeiculo: z.string(),
        nomeResponsavelRecebimento: z.string(),
        observacoes: z.string(),
        erroNacional: z.boolean(),
        mensagemErroNacional: z.string().or(z.null()),
        recebimentoManifestoCodigoNacional: z.string().or(z.null()),
        recebimentoManifestoCodigoEstadual: z.string().or(z.null()),
        listaManifestoResiduos: z.array(
            z.object({
                restResponseValido: z.boolean(),
                restResponseMensagem: z.string(),
                codigoGerado: z.string().or(z.null()),
                manCodigo: z.number().or(z.null()),
                resCodigo: z.string().or(z.null()),
                resCodigoIbama: z.string(),
                resCodigoIbamaNovo: z.string().or(z.null()),
                traCodigo: z.number(),
                traCodigoNovo: z.number().or(z.null()),
                uniCodigo: z.number(),
                tieCodigo: z.number(),
                tiaCodigo: z.number(),
                claCodigo: z.number(),
                marQuantidade: z.number(),
                marQuantidadeRecebida: z.number(),
                marDensidade: z.number().or(z.null()),
                marNumeroONU: z.string().or(z.null()),
                marClasseRisco: z.string().or(z.null()),
                marNomeEmbarque: z.string().or(z.null()),
                marGrupoEmbalagem: z.string().or(z.null()),
                greCodigo: z.number().or(z.null()),
                marJustificativa: z.string(),
                marCodigoInterno: z.string().or(z.null()),
                marDescricaoInterna: z.string().or(z.null()),
                observacoes: z.string().or(z.null()),
                marIdentificacaoOrigemPev: z.string().or(z.null()),
                marCepNumeroPev: z.string().or(z.null()),
                marLogradouroPev: z.string().or(z.null()),
                marNumeroPev: z.string().or(z.null()),
                marBairroPev: z.string().or(z.null()),
                marComplementoPev: z.string().or(z.null()),
                cidCodigoIbge: z.number().or(z.null()),
                cidCodigo: z.string().or(z.null()),
                uf: z.string().or(z.null()),
                listaRepresentacao: z.string().or(z.null()),
            }),
        ).nonempty(),
    }),
).nonempty();

const ReceberLoteMtrRequestSchema = z.array(
    z.object({
        manNumero: z.string(),
        dataRecebimento: z.number(),
        nomeMotorista: z.string().transform((e) => e.toUpperCase()),
        placaVeiculo: z.string().transform((e) => e.toUpperCase()),
        nomeResponsavelRecebimento: z.string(),
        observacoes: z.string(),
        listaManifestoResiduos: z.array(
            z.object({
                resCodigoIbama: z.string(),
                resCodigoIbamaNovo: z.string().optional(),
                marQuantidade: z.number(),
                marQuantidadeRecebida: z.number(),
                traCodigo: z.number(),
                traCodigoNovo: z.number().optional(),
                uniCodigo: z.number(),
                marJustificativa: z.string(),
                tieCodigo: z.number(),
                tiaCodigo: z.number(),
                claCodigo: z.number(),
                marDensidade: z.number().optional(),
                marNumeroONU: z.string().optional(),
                marClasseRisco: z.string().optional(),
                marNomeEmbarque: z.string().optional(),
                greCodigo: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
            }),
        ).nonempty(),
    }),
).nonempty();
