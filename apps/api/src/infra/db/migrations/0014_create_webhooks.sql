-- Migration: 0014_create_webhooks.sql

CREATE TABLE webhooks (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  url             VARCHAR(500) NOT NULL,
  secret          VARCHAR(255) NOT NULL, -- HMAC secret key
  description     VARCHAR(200),
  status          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  events          JSONB        NOT NULL DEFAULT '["*"]', -- ["document.ready", "risk.high_detected", etc]
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE webhooks IS 'Endpoints de webhook configurados pelos tenants para integração externa.';
COMMENT ON COLUMN webhooks.secret IS 'Chave secreta usada para assinar o payload via HMAC-SHA256 (X-ComplianceOS-Signature).';

CREATE INDEX idx_webhooks_tenant ON webhooks(tenant_id, status);

-- RLS
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY webhooks_tenant_isolation ON webhooks
  USING (tenant_id = current_setting('app.tenant_id', TRUE)::UUID);

-- Trigger: atualizar updated_at
CREATE TRIGGER trg_webhooks_updated_at
  BEFORE UPDATE ON webhooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
