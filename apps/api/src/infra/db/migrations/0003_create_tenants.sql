-- Migration: 0003_create_tenants.sql

CREATE TABLE tenants (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(200) NOT NULL,
  cnpj          CHAR(14)    NOT NULL UNIQUE,
  plan          VARCHAR(20)  NOT NULL CHECK (plan IN ('STARTER', 'PROFESSIONAL', 'ENTERPRISE')),
  status        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'CANCELLED')),
  settings      JSONB        NOT NULL DEFAULT '{}',
  -- Faturamento
  billing_email VARCHAR(200),
  trial_ends_at TIMESTAMPTZ,
  -- Metadados
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE tenants IS 'Clientes do SaaS (multi-tenancy). Cada tenant = uma empresa cliente.';
COMMENT ON COLUMN tenants.settings IS 'JSON: { modules, maxUsers, ssoEnabled, notificationEmail, riskThresholds }';

CREATE INDEX idx_tenants_cnpj ON tenants(cnpj);
CREATE INDEX idx_tenants_status ON tenants(status);

-- Trigger: atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- DOWN: DROP TABLE IF EXISTS tenants;
