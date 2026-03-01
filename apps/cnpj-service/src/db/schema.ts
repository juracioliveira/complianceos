import { pgTable, text, char, numeric, date, timestamp, bigserial, integer, index, primaryKey } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Empresa (CNPJ básico — 8 dígitos)
export const rfbEmpresas = pgTable('rfb_empresas', {
    cnpjBasico: char('cnpj_basico', { length: 8 }).primaryKey(),
    razaoSocial: text('razao_social').notNull(),
    naturezaJuridica: char('natureza_juridica', { length: 4 }),
    qualifResponsavel: char('qualif_responsavel', { length: 2 }),
    capitalSocial: numeric('capital_social', { precision: 18, scale: 2 }),
    porte: char('porte', { length: 2 }), // 00=NI 01=ME 03=EPP 05=demais
    enteFederativo: text('ente_federativo'),
    atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow(),
}, (table) => {
    return {
        razaoSocialIdx: index('idx_rfb_empresas_rs_gin').on(table.razaoSocial),
    }
});

// Estabelecimento (CNPJ completo — 14 dígitos)
export const rfbEstabelecimentos = pgTable('rfb_estabelecimentos', {
    cnpjBasico: char('cnpj_basico', { length: 8 }).notNull(),
    cnpjOrdem: char('cnpj_ordem', { length: 4 }).notNull(),
    cnpjDv: char('cnpj_dv', { length: 2 }).notNull(),
    matrizFilial: char('matriz_filial', { length: 1 }), // 1=matriz 2=filial
    nomeFantasia: text('nome_fantasia'),
    situacaoCadastral: char('situacao_cadastral', { length: 2 }), // 02=ativa 03=suspensa 04=inapta 08=baixada
    dataSituacao: date('data_situacao'),
    motivoSituacao: char('motivo_situacao', { length: 2 }),
    cnaeFiscal: char('cnae_fiscal', { length: 7 }),
    cnaeSecundarios: text('cnae_secundarios'),
    tipoLogradouro: text('tipo_logradouro'),
    logradouro: text('logradouro'),
    numero: text('numero'),
    complemento: text('complemento'),
    bairro: text('bairro'),
    cep: char('cep', { length: 8 }),
    uf: char('uf', { length: 2 }),
    municipio: char('municipio', { length: 4 }),
    ddd1: char('ddd1', { length: 4 }),
    telefone1: char('telefone1', { length: 9 }),
    ddd2: char('ddd2', { length: 4 }),
    telefone2: char('telefone2', { length: 9 }),
    dddFax: char('ddd_fax', { length: 4 }),
    fax: char('fax', { length: 9 }),
    email: text('email'),
    situacaoEspecial: text('situacao_especial'),
    dataSituacaoEsp: date('data_situacao_esp'),
    dataInicio: date('data_inicio'),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.cnpjBasico, table.cnpjOrdem, table.cnpjDv] }),
        cnpjBasicoIdx: index('idx_rfb_estabelecimentos_basico').on(table.cnpjBasico),
        situacaoCadastralIdx: index('idx_rfb_estabelecimentos_situacao').on(table.situacaoCadastral),
        cnaeFiscalIdx: index('idx_rfb_estabelecimentos_cnae').on(table.cnaeFiscal),
        ufMunicipioIdx: index('idx_rfb_estabelecimentos_uf_mun').on(table.uf, table.municipio),
    };
});

// Sócios e Administradores (QSA)
export const rfbSocios = pgTable('rfb_socios', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    cnpjBasico: char('cnpj_basico', { length: 8 }).notNull(),
    tipoSocio: char('tipo_socio', { length: 1 }), // 1=PJ 2=PF 3=estrangeiro
    nomeSocio: text('nome_socio'),
    cnpjCpfSocio: text('cnpj_cpf_socio'),
    qualifSocio: char('qualif_socio', { length: 2 }),
    dataEntrada: date('data_entrada'),
    pais: char('pais', { length: 3 }),
    reprLegal: text('repr_legal'),
    nomeRepr: text('nome_repr'),
    qualifRepr: char('qualif_repr', { length: 2 }),
    faixaEtaria: char('faixa_etaria', { length: 1 }),
}, (table) => {
    return {
        cnpjBasicoIdx: index('idx_rfb_socios_basico').on(table.cnpjBasico),
        nomeSocioIdx: index('idx_rfb_socios_nome_gin').on(table.nomeSocio),
    };
});

// Simples Nacional / MEI
export const rfbSimples = pgTable('rfb_simples', {
    cnpjBasico: char('cnpj_basico', { length: 8 }).primaryKey(),
    opcaoSimples: char('opcao_simples', { length: 1 }),
    dataOpcaoSimples: date('data_opcao_simples'),
    dataExcSimples: date('data_exc_simples'),
    opcaoMei: char('opcao_mei', { length: 1 }),
    dataOpcaoMei: date('data_opcao_mei'),
    dataExcMei: date('data_exc_mei'),
});

// Tabelas de domínio (lookups)
export const rfbCnaes = pgTable('rfb_cnaes', {
    codigo: char('codigo', { length: 7 }).primaryKey(),
    descricao: text('descricao'),
});

export const rfbMunicipios = pgTable('rfb_municipios', {
    codigo: char('codigo', { length: 4 }).primaryKey(),
    descricao: text('descricao'),
});

export const rfbNaturezas = pgTable('rfb_naturezas', {
    codigo: char('codigo', { length: 4 }).primaryKey(),
    descricao: text('descricao'),
});

export const rfbQualificacoes = pgTable('rfb_qualificacoes', {
    codigo: char('codigo', { length: 2 }).primaryKey(),
    descricao: text('descricao'),
});

export const rfbMotivos = pgTable('rfb_motivos', {
    codigo: char('codigo', { length: 2 }).primaryKey(),
    descricao: text('descricao'),
});

export const rfbPaises = pgTable('rfb_paises', {
    codigo: char('codigo', { length: 3 }).primaryKey(),
    descricao: text('descricao'),
});

// Controle de sincronização
export const rfbSyncLog = pgTable('rfb_sync_log', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    competencia: char('competencia', { length: 7 }).notNull(), // ex: '2026-01'
    status: text('status').notNull(), // 'running' | 'success' | 'error'
    iniciadoEm: timestamp('iniciado_em', { withTimezone: true }).defaultNow(),
    concluidoEm: timestamp('concluido_em', { withTimezone: true }),
    arquivosOk: integer('arquivos_ok').default(0),
    erroMsg: text('erro_msg'),
});
