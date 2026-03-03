CREATE TABLE IF NOT EXISTS "rfb_cnaes" (
	"codigo" char(7) PRIMARY KEY NOT NULL,
	"descricao" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rfb_empresas" (
	"cnpj_basico" char(8) PRIMARY KEY NOT NULL,
	"razao_social" text NOT NULL,
	"natureza_juridica" char(4),
	"qualif_responsavel" char(2),
	"capital_social" numeric(18, 2),
	"porte" char(2),
	"ente_federativo" text,
	"atualizado_em" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rfb_estabelecimentos" (
	"cnpj_basico" char(8) NOT NULL,
	"cnpj_ordem" char(4) NOT NULL,
	"cnpj_dv" char(2) NOT NULL,
	"matriz_filial" char(1),
	"nome_fantasia" text,
	"situacao_cadastral" char(2),
	"data_situacao" date,
	"motivo_situacao" char(2),
	"cnae_fiscal" char(7),
	"cnae_secundarios" text,
	"tipo_logradouro" text,
	"logradouro" text,
	"numero" text,
	"complemento" text,
	"bairro" text,
	"cep" char(8),
	"uf" char(2),
	"municipio" char(4),
	"ddd1" char(4),
	"telefone1" char(9),
	"ddd2" char(4),
	"telefone2" char(9),
	"ddd_fax" char(4),
	"fax" char(9),
	"email" text,
	"situacao_especial" text,
	"data_situacao_esp" date,
	"data_inicio" date,
	CONSTRAINT "rfb_estabelecimentos_cnpj_basico_cnpj_ordem_cnpj_dv_pk" PRIMARY KEY("cnpj_basico","cnpj_ordem","cnpj_dv")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rfb_motivos" (
	"codigo" char(2) PRIMARY KEY NOT NULL,
	"descricao" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rfb_municipios" (
	"codigo" char(4) PRIMARY KEY NOT NULL,
	"descricao" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rfb_naturezas" (
	"codigo" char(4) PRIMARY KEY NOT NULL,
	"descricao" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rfb_paises" (
	"codigo" char(3) PRIMARY KEY NOT NULL,
	"descricao" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rfb_qualificacoes" (
	"codigo" char(2) PRIMARY KEY NOT NULL,
	"descricao" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rfb_simples" (
	"cnpj_basico" char(8) PRIMARY KEY NOT NULL,
	"opcao_simples" char(1),
	"data_opcao_simples" date,
	"data_exc_simples" date,
	"opcao_mei" char(1),
	"data_opcao_mei" date,
	"data_exc_mei" date
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rfb_socios" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"cnpj_basico" char(8) NOT NULL,
	"tipo_socio" char(1),
	"nome_socio" text,
	"cnpj_cpf_socio" text,
	"qualif_socio" char(2),
	"data_entrada" date,
	"pais" char(3),
	"repr_legal" text,
	"nome_repr" text,
	"qualif_repr" char(2),
	"faixa_etaria" char(1)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rfb_sync_log" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"competencia" char(7) NOT NULL,
	"status" text NOT NULL,
	"iniciado_em" timestamp with time zone DEFAULT now(),
	"concluido_em" timestamp with time zone,
	"arquivos_ok" integer DEFAULT 0,
	"erro_msg" text
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_rfb_empresas_rs_gin" ON "rfb_empresas" ("razao_social");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_rfb_estabelecimentos_basico" ON "rfb_estabelecimentos" ("cnpj_basico");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_rfb_estabelecimentos_situacao" ON "rfb_estabelecimentos" ("situacao_cadastral");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_rfb_estabelecimentos_cnae" ON "rfb_estabelecimentos" ("cnae_fiscal");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_rfb_estabelecimentos_uf_mun" ON "rfb_estabelecimentos" ("uf","municipio");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_rfb_socios_basico" ON "rfb_socios" ("cnpj_basico");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_rfb_socios_nome_gin" ON "rfb_socios" ("nome_socio");