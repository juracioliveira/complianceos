-- Migration: 0004_create_users.sql

CREATE TABLE users (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email           VARCHAR(200) NOT NULL,
  name            VARCHAR(200) NOT NULL,
  password_hash   TEXT        NOT NULL DEFAULT '',
  role            VARCHAR(30)  NOT NULL CHECK (role IN (
                    'ADMIN', 'COMPLIANCE_OFFICER', 'ANALYST', 'AUDITOR', 'READONLY'
                  )),
  status          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  -- MFA
  mfa_enabled     BOOLEAN      NOT NULL DEFAULT FALSE,
  mfa_secret      TEXT,                -- TOTP secret criptografado (AES-256 via app layer)
  mfa_backup_codes TEXT[],             -- códigos de emergência hasheados
  -- Sessão
  last_login_at   TIMESTAMPTZ,
  last_login_ip   INET,
  failed_attempts SMALLINT     NOT NULL DEFAULT 0,
  locked_until    TIMESTAMPTZ,
  -- Convite
  invited_by      UUID         REFERENCES users(id),
  invite_token    TEXT,                -- token de convite (bcrypt hash)
  invite_expires  TIMESTAMPTZ,
  -- Metadados
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE users IS 'Usuários por tenant. Email único por tenant (não globalmente).';
COMMENT ON COLUMN users.mfa_secret IS 'TOTP secret — criptografado AES-256 na camada de aplicação. NUNCA logar.';
COMMENT ON COLUMN users.password_hash IS 'Argon2id hash da senha. NUNCA logar nem expor via API.';

-- Email único por tenant (não globalmente — multi-tenant)
CREATE UNIQUE INDEX uq_users_tenant_email ON users(tenant_id, email);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);           -- para login (tenant não conhecido ainda)
CREATE INDEX idx_users_status ON users(tenant_id, status);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_tenant_isolation ON users
  USING (tenant_id = current_setting('app.tenant_id', TRUE)::UUID);

-- Trigger: atualizar updated_at
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- DOWN: DROP TABLE IF EXISTS users;
