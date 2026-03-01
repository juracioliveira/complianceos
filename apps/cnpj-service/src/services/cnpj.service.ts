import { db } from '../db/index.js';
import { eq, and, like, or, sql } from 'drizzle-orm';
import {
    rfbEmpresas, rfbEstabelecimentos, rfbSocios, rfbSimples,
    rfbCnaes, rfbNaturezas, rfbMotivos, rfbQualificacoes
} from '../db/schema.js';
import { cache } from '../cache/redis.js';

export async function getCnpjData(cnpj14: string) {
    const cacheKey = `cnpj:${cnpj14}`;
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
        return { ...cachedData as any, cached: true };
    }

    const cnpjBasico = cnpj14.substring(0, 8);
    const cnpjOrdem = cnpj14.substring(8, 12);
    const cnpjDv = cnpj14.substring(12, 14);

    const estabelecimento = await db.select({
        cnpjBasico: rfbEstabelecimentos.cnpjBasico,
        cnpjOrdem: rfbEstabelecimentos.cnpjOrdem,
        cnpjDv: rfbEstabelecimentos.cnpjDv,
        matrizFilial: rfbEstabelecimentos.matrizFilial,
        nomeFantasia: rfbEstabelecimentos.nomeFantasia,
        situacaoCadastral: rfbEstabelecimentos.situacaoCadastral,
        dataSituacao: rfbEstabelecimentos.dataSituacao,
        motivoSituacao: rfbEstabelecimentos.motivoSituacao,
        cnaeFiscal: rfbEstabelecimentos.cnaeFiscal,
        cnaeSecundarios: rfbEstabelecimentos.cnaeSecundarios,
        tipoLogradouro: rfbEstabelecimentos.tipoLogradouro,
        logradouro: rfbEstabelecimentos.logradouro,
        numero: rfbEstabelecimentos.numero,
        complemento: rfbEstabelecimentos.complemento,
        bairro: rfbEstabelecimentos.bairro,
        cep: rfbEstabelecimentos.cep,
        uf: rfbEstabelecimentos.uf,
        municipio: rfbEstabelecimentos.municipio,
        ddd1: rfbEstabelecimentos.ddd1,
        telefone1: rfbEstabelecimentos.telefone1,
        email: rfbEstabelecimentos.email,
        dataInicio: rfbEstabelecimentos.dataInicio,

        razaoSocial: rfbEmpresas.razaoSocial,
        naturezaJuridica: rfbEmpresas.naturezaJuridica,
        porte: rfbEmpresas.porte,
        capitalSocial: rfbEmpresas.capitalSocial,

        simples_opcaoSimples: rfbSimples.opcaoSimples,
        simples_dataOpcaoSimples: rfbSimples.dataOpcaoSimples,
        simples_opcaoMei: rfbSimples.opcaoMei,

        cnaeDescricao: rfbCnaes.descricao,
        natDescricao: rfbNaturezas.descricao,
    })
        .from(rfbEstabelecimentos)
        .innerJoin(rfbEmpresas, eq(rfbEstabelecimentos.cnpjBasico, rfbEmpresas.cnpjBasico))
        .leftJoin(rfbSimples, eq(rfbEstabelecimentos.cnpjBasico, rfbSimples.cnpjBasico))
        .leftJoin(rfbCnaes, eq(rfbEstabelecimentos.cnaeFiscal, rfbCnaes.codigo))
        .leftJoin(rfbNaturezas, eq(rfbEmpresas.naturezaJuridica, rfbNaturezas.codigo))
        .where(
            and(
                eq(rfbEstabelecimentos.cnpjBasico, cnpjBasico),
                eq(rfbEstabelecimentos.cnpjOrdem, cnpjOrdem),
                eq(rfbEstabelecimentos.cnpjDv, cnpjDv)
            )
        )
        .limit(1);

    if (estabelecimento.length === 0) {
        return null;
    }

    const est = estabelecimento[0]!;

    const socios = await db.select({
        nome: rfbSocios.nomeSocio,
        tipo: rfbSocios.tipoSocio,
        cpfCnpj: rfbSocios.cnpjCpfSocio,
        qualifCodigo: rfbSocios.qualifSocio,
        qualifDescricao: rfbQualificacoes.descricao,
        dataEntrada: rfbSocios.dataEntrada,
        faixaEtaria: rfbSocios.faixaEtaria,
    })
        .from(rfbSocios)
        .leftJoin(rfbQualificacoes, eq(rfbSocios.qualifSocio, rfbQualificacoes.codigo))
        .where(eq(rfbSocios.cnpjBasico, cnpjBasico));

    const filiaisCountQuery = await db.select({ count: sql<number>`count(*)` })
        .from(rfbEstabelecimentos)
        .where(eq(rfbEstabelecimentos.cnpjBasico, cnpjBasico));

    const count = filiaisCountQuery[0]?.count || 1;

    // Montar response payload
    const formatPorte = (porte: string | null) => {
        switch (porte) {
            case '01': return 'Micro Empresa';
            case '03': return 'Empresa de Pequeno Porte';
            case '05': return 'Demais';
            default: return 'Não Informado';
        }
    };

    const formatSitCadastral = (sit: string | null) => {
        switch (sit) {
            case '02': return 'ATIVA';
            case '03': return 'SUSPENSA';
            case '04': return 'INAPTA';
            case '08': return 'BAIXADA';
            default: return 'DESCONHECIDA';
        }
    };

    const payload = {
        cnpj: cnpj14,
        cnpj_formatado: `${cnpjBasico.substring(0, 2)}.${cnpjBasico.substring(2, 5)}.${cnpjBasico.substring(5, 8)}/${cnpjOrdem}-${cnpjDv}`,
        razao_social: est.razaoSocial,
        nome_fantasia: est.nomeFantasia,
        situacao_cadastral: {
            codigo: est.situacaoCadastral,
            descricao: formatSitCadastral(est.situacaoCadastral),
        },
        data_abertura: est.dataInicio,
        natureza_juridica: {
            codigo: est.naturezaJuridica,
            descricao: est.natDescricao,
        },
        porte: {
            codigo: est.porte,
            descricao: formatPorte(est.porte),
        },
        capital_social: est.capitalSocial ? Number(est.capitalSocial) : null,
        simples_nacional: {
            optante: est.simples_opcaoSimples === 'S',
            data_opcao: est.simples_dataOpcaoSimples,
            mei: est.simples_opcaoMei === 'S',
        },
        cnae_principal: {
            codigo: est.cnaeFiscal,
            descricao: est.cnaeDescricao,
        },
        cnaes_secundarios: est.cnaeSecundarios ? est.cnaeSecundarios.split(',').map(c => c.trim()).filter(Boolean) : [],
        matriz_filial: est.matrizFilial === '1' ? 'MATRIZ' : 'FILIAL',
        endereco: {
            logradouro: `${est.tipoLogradouro || ''} ${est.logradouro || ''}`.trim(),
            numero: est.numero,
            complemento: est.complemento,
            bairro: est.bairro,
            municipio: est.municipio, // Ideally should join with rfb_municipios to get name
            uf: est.uf,
            cep: est.cep,
        },
        contato: {
            telefone: `(${est.ddd1}) ${est.telefone1}`,
            email: est.email,
        },
        qsa: socios.map(s => ({
            nome: s.nome,
            tipo: s.tipo === '1' ? 'PJ' : s.tipo === '2' ? 'PF' : 'Estrangeiro',
            cpf_cnpj: s.cpfCnpj,
            qualificacao: s.qualifDescricao || s.qualifCodigo,
            data_entrada: s.dataEntrada,
            faixa_etaria: s.faixaEtaria,
        })),
        filiais_count: count,
    };

    await cache.set(cacheKey, payload, 86400);

    return { ...payload, cached: false };
}
