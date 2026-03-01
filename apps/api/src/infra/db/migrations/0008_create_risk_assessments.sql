-- Migration: 0008_create_risk_assessments.sql

CREATE TABLE risk_assessments (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entity_id       UUID        NOT NULL REFERENCES entities(id),
  -- Score composto e por dimensão
  score           SMALLINT    NOT NULL CHECK (score BETWEEN 0 AND 100),
  risk_level      VARCHAR(20)  NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  factors         JSONB        NOT NULL DEFAULT '{}',
  previous_level  VARCHAR(20)  CHECK (previous_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'UNKNOWN')),
  level_changed   BOOLEAN      NOT NULL DEFAULT FALSE,
  -- Validade
  calculated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ  NOT NULL,
  -- Gatilho do cálculo
  triggered_by    VARCHAR(20)  NOT NULL CHECK (triggered_by IN ('CHECKLIST_RUN', 'SANCTIONS_UPDATE', 'MANUAL', 'SCHEDULED')),
  triggered_by_id UUID,        -- ID do checklist_run ou do user que disparou manualmente
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  -- Não tem updated_at — risk_assessments são imutáveis (append-only history)
);

COMMENT ON TABLE risk_assessments IS 'Histórico de avaliações de risco por entidade. Append-only — nunca deletar.';
COMMENT ON COLUMN risk_assessments.factors IS 'Scores por dimensão: { pldFt, lgpd, anticorrupcao, sanctions, pep }';
COMMENT ON COLUMN risk_assessments.expires_at IS 'Calculado: calculated_at + periodicity do checklist.';

CREATE INDEX idx_risk_assessments_entity ON risk_assessments(tenant_id, entity_id, calculated_at DESC);
CREATE INDEX idx_risk_assessments_level ON risk_assessments(tenant_id, risk_level, calculated_at DESC);
CREATE INDEX idx_risk_assessments_expired ON risk_assessments(tenant_id, expires_at) WHERE expires_at < NOW();

-- RLS
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY risk_assessments_tenant_isolation ON risk_assessments
  USING (tenant_id = current_setting('app.tenant_id', TRUE)::UUID);

-- DOWN: DROP TABLE IF EXISTS risk_assessments;
