-- Migration: 0006_create_checklists.sql
-- Templates de checklists regulatórios — versionados e imutáveis após ACTIVE

CREATE TABLE checklists (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- null = checklist do sistema (todos os planos); não-null = personalizado pelo tenant
  tenant_id        UUID        REFERENCES tenants(id) ON DELETE CASCADE,
  module           VARCHAR(20)  NOT NULL CHECK (module IN ('PLD_FT', 'LGPD', 'ANTICORRUPCAO')),
  regulation_code  VARCHAR(50)  NOT NULL,  -- ex: 'LEI_9613_98', 'LGPD_ART37', 'LEI_12846_13'
  title            VARCHAR(200) NOT NULL,
  description      TEXT,
  version          VARCHAR(10)  NOT NULL DEFAULT '1.0',
  status           VARCHAR(20)  NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'DEPRECATED')),
  -- Items do checklist (JSONB para flexibilidade de schema por regulação)
  items            JSONB        NOT NULL DEFAULT '[]',
  -- Configurações
  periodicity_days SMALLINT,             -- frequência recomendada de execução (null = sem periodicidade)
  applies_to       VARCHAR(20)[] NOT NULL DEFAULT ARRAY['CLIENTE', 'FORNECEDOR', 'PARCEIRO']::VARCHAR[],
  -- Metadados
  created_by       UUID         REFERENCES users(id),
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE checklists IS 'Templates de checklists regulatórios. Items em JSONB para flexibilidade.';
COMMENT ON COLUMN checklists.tenant_id IS 'NULL = checklist sistema (disponível a todos). Não-NULL = customizado pelo tenant.';
COMMENT ON COLUMN checklists.items IS 'Array JSON: [{id, order, question, weight, category, regulationRef, answerType, options, evidenceRequired, helpText}]';

CREATE INDEX idx_checklists_module ON checklists(module, status);
CREATE INDEX idx_checklists_tenant ON checklists(tenant_id) WHERE tenant_id IS NOT NULL;
CREATE INDEX idx_checklists_system ON checklists(module, status) WHERE tenant_id IS NULL;

-- Trigger: atualizar updated_at
CREATE TRIGGER trg_checklists_updated_at
  BEFORE UPDATE ON checklists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- DOWN: DROP TABLE IF EXISTS checklists;
