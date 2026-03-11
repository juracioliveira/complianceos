-- Migration: 0016_schema_sync.sql
-- Sincronizar colunas que podem estar faltando no banco (adicionadas no schema.ts mas não em migrations anteriores)

-- Adicionar colunas de plano e configurações ao tenant (se não existirem)
ALTER TABLE tenants
    ADD COLUMN IF NOT EXISTS plan VARCHAR(30) NOT NULL DEFAULT 'FREE',
    ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{"modules": ["PLD_FT", "LGPD", "ANTICORRUPCAO"]}',
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';

-- Índice de plano de tenant para consultas de faturamento
CREATE INDEX IF NOT EXISTS idx_tenants_plan ON tenants(plan);

-- Normalizar checklists.applies_to para JSONB (migration 0006 usa VARCHAR(20)[])
-- Quando a coluna já existe como array, fazer cast para JSONB
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'checklists'
          AND column_name = 'applies_to'
          AND data_type = 'ARRAY'
    ) THEN
        ALTER TABLE checklists
            ALTER COLUMN applies_to TYPE JSONB USING to_jsonb(applies_to);
    END IF;
END$$;

-- Adicionar coluna updated_at ao checklists se não existir (0006 pode não ter)
ALTER TABLE checklists
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Garantir que checklist_runs.executed_by existe (0007 já cria, mas para segurança)
ALTER TABLE checklist_runs
    ADD COLUMN IF NOT EXISTS executed_by UUID REFERENCES users(id);

-- Garantir started_at existe em checklist_runs
ALTER TABLE checklist_runs
    ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas de assinatura digital em documents
ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS is_signed BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS signed_by UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS signed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS signature_token VARCHAR(256);

-- Índice de documentos por status
CREATE INDEX IF NOT EXISTS idx_documents_tenant_status ON documents(tenant_id, status);
