-- Migration: 0007_create_checklist_runs.sql
-- Execuções de checklists — IMUTÁVEIS após status = COMPLETED

CREATE TABLE checklist_runs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  checklist_id    UUID        NOT NULL REFERENCES checklists(id),
  entity_id       UUID        NOT NULL REFERENCES entities(id),
  executed_by     UUID        NOT NULL REFERENCES users(id),
  -- Respostas e score
  answers         JSONB       NOT NULL DEFAULT '[]',
  score           SMALLINT    CHECK (score BETWEEN 0 AND 100),
  risk_level      VARCHAR(20) CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  -- Status do processo
  status          VARCHAR(20)  NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  started_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  -- Evidências e observações
  summary_notes   TEXT,
  evidence_keys   TEXT[]       NOT NULL DEFAULT '{}',
  -- Metadados de execução
  duration_secs   INTEGER,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE checklist_runs IS 'Execuções de checklists. IMUTÁVEL após status = COMPLETED (trigger enforça).';
COMMENT ON COLUMN checklist_runs.answers IS 'Array JSON: [{itemId, answer, note, evidenceKey, answeredAt}]';

CREATE INDEX idx_checklist_runs_tenant ON checklist_runs(tenant_id);
CREATE INDEX idx_checklist_runs_entity ON checklist_runs(tenant_id, entity_id);
CREATE INDEX idx_checklist_runs_status ON checklist_runs(tenant_id, status, completed_at DESC);
CREATE INDEX idx_checklist_runs_executor ON checklist_runs(tenant_id, executed_by);

-- RLS
ALTER TABLE checklist_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY checklist_runs_tenant_isolation ON checklist_runs
  USING (tenant_id = current_setting('app.tenant_id', TRUE)::UUID);

-- Trigger: atualizar updated_at
CREATE TRIGGER trg_checklist_runs_updated_at
  BEFORE UPDATE ON checklist_runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- TRIGGER CRÍTICO: impedir modificação de runs COMPLETED (imutabilidade)
CREATE OR REPLACE FUNCTION prevent_completed_run_modification()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'COMPLETED' THEN
    RAISE EXCEPTION 'checklist_run imutável após status COMPLETED. id: %, tenant: %', OLD.id, OLD.tenant_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_completed_run_modification
  BEFORE UPDATE ON checklist_runs
  FOR EACH ROW EXECUTE FUNCTION prevent_completed_run_modification();

-- DOWN: DROP TABLE IF EXISTS checklist_runs;
