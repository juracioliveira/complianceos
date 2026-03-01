-- Migration: 0005_create_entities.sql

CREATE TABLE entities (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  -- Identificação
  name                 VARCHAR(200) NOT NULL,
  cnpj                 CHAR(14),
  cpf                  CHAR(11),
  entity_type          VARCHAR(20)  NOT NULL CHECK (entity_type IN ('CLIENTE', 'FORNECEDOR', 'PARCEIRO', 'COLABORADOR')),
  sector               VARCHAR(100),
  -- Dados societários
  corporate_data       JSONB        NOT NULL DEFAULT '{}',
  -- Score e risco (cache — fonte de verdade é risk_assessments)
  risk_score           SMALLINT     CHECK (risk_score BETWEEN 0 AND 100),
  risk_level           VARCHAR(20)  NOT NULL DEFAULT 'UNKNOWN' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'UNKNOWN')),
  last_assessed_at     TIMESTAMPTZ,
  -- Status
  status               VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'BLOCKED')),
  blocked_reason       TEXT,
  -- KYC/KYB
  kyc_status           VARCHAR(20)  NOT NULL DEFAULT 'PENDING' CHECK (kyc_status IN ('PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED')),
  kyc_completed_at     TIMESTAMPTZ,
  -- PEP — Pessoa Exposta Politicamente
  is_pep               BOOLEAN      NOT NULL DEFAULT FALSE,
  pep_details          JSONB,
  -- Metadados
  created_by           UUID         NOT NULL REFERENCES users(id),
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE entities IS 'Entidades avaliadas: clientes, fornecedores, parceiros, colaboradores do tenant.';
COMMENT ON COLUMN entities.risk_score IS 'Cache do score calculado. Fonte de verdade: risk_assessments.';
COMMENT ON COLUMN entities.is_pep IS 'Pessoa Exposta Politicamente — monitoramento obrigatório pela Lei 9.613/98.';

-- CNPJ único por tenant
CREATE UNIQUE INDEX uq_entities_tenant_cnpj ON entities(tenant_id, cnpj) WHERE cnpj IS NOT NULL;
CREATE UNIQUE INDEX uq_entities_tenant_cpf ON entities(tenant_id, cpf) WHERE cpf IS NOT NULL;
CREATE INDEX idx_entities_tenant_id ON entities(tenant_id);
CREATE INDEX idx_entities_risk_level ON entities(tenant_id, risk_level);
CREATE INDEX idx_entities_status ON entities(tenant_id, status);
CREATE INDEX idx_entities_kyc_status ON entities(tenant_id, kyc_status);
CREATE INDEX idx_entities_pep ON entities(tenant_id) WHERE is_pep = TRUE;
-- Índice trigram para busca por nome (pg_trgm)
CREATE INDEX idx_entities_name_trgm ON entities USING GIN (name gin_trgm_ops);

-- RLS
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY entities_tenant_isolation ON entities
  USING (tenant_id = current_setting('app.tenant_id', TRUE)::UUID);

-- Trigger: atualizar updated_at
CREATE TRIGGER trg_entities_updated_at
  BEFORE UPDATE ON entities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- DOWN: DROP TABLE IF EXISTS entities;
