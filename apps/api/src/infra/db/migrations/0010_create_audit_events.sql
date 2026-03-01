-- Migration: 0010_create_audit_events.sql
-- TABELA CRÍTICA — INSERT ONLY — NUNCA ALTERAR MANUALMENTE
-- Retenção: 5 anos — Base legal: Art. 9 Lei 9.613/98 + Art. 37 LGPD

CREATE TABLE audit_events (
  event_id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL,  -- sem FK para não bloquear DROP de tenant (retenção 5 anos)
  -- Contexto do ator
  actor_id        UUID        NOT NULL,  -- user_id ou UUID(00000000...) para SYSTEM
  actor_type      VARCHAR(20)  NOT NULL DEFAULT 'USER' CHECK (actor_type IN ('USER', 'SYSTEM', 'API')),
  actor_ip        INET,
  actor_user_agent TEXT,
  -- Evento
  occurred_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  module          VARCHAR(30)  NOT NULL CHECK (module IN (
                    'PLD_FT', 'LGPD', 'ANTICORRUPCAO', 'DOCS',
                    'ENTITIES', 'USERS', 'AUTH', 'ADMIN', 'SYSTEM'
                  )),
  action          VARCHAR(100) NOT NULL,
  resource_type   VARCHAR(50),
  resource_id     UUID,
  -- Resultado
  result          VARCHAR(10)  NOT NULL CHECK (result IN ('SUCCESS', 'FAILURE', 'PARTIAL')),
  error_code      VARCHAR(50),
  -- Integridade encadeada (blockchain-lite)
  payload_hash    CHAR(64)     NOT NULL,
  prev_hash       CHAR(64),
  -- Metadados (sem dados pessoais — apenas IDs)
  metadata        JSONB        NOT NULL DEFAULT '{}'
);

COMMENT ON TABLE audit_events IS 'Trilha de auditoria imutável. INSERT ONLY. DELETE/UPDATE proibidos via trigger e role. Retenção: 5 anos.';
COMMENT ON COLUMN audit_events.prev_hash IS 'Hash do evento anterior do mesmo tenant — encadeamento para detectar adulteração.';
COMMENT ON COLUMN audit_events.payload_hash IS 'SHA-256 do payload do evento para verificação de integridade individual.';

-- Índices para consultas eficientes de auditores e reguladores
CREATE INDEX idx_audit_tenant_time ON audit_events(tenant_id, occurred_at DESC);
CREATE INDEX idx_audit_actor ON audit_events(tenant_id, actor_id, occurred_at DESC);
CREATE INDEX idx_audit_module ON audit_events(tenant_id, module, action, occurred_at DESC);
CREATE INDEX idx_audit_resource ON audit_events(tenant_id, resource_type, resource_id, occurred_at DESC);
CREATE INDEX idx_audit_result ON audit_events(tenant_id, result, occurred_at DESC);

-- RLS — auditores só veem seu próprio tenant
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_events_tenant_isolation ON audit_events
  USING (tenant_id = current_setting('app.tenant_id', TRUE)::UUID);

-- TRIGGER CRÍTICO: impedir UPDATE e DELETE (imutabilidade absoluta)
-- Violações são registradas nos logs do PostgreSQL como evento de segurança
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION
    'VIOLAÇÃO DE SEGURANÇA: audit_events é imutável — UPDATE e DELETE são proibidos. evento_id: %, tenant: %',
    OLD.event_id, OLD.tenant_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_audit_events_immutable
  BEFORE UPDATE OR DELETE ON audit_events
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

-- Revogar privilégios de UPDATE e DELETE do role da app
-- (executado APÓS as tabelas existirem)
REVOKE UPDATE, DELETE ON TABLE audit_events FROM compliance_app;

-- DOWN: NÃO EXECUTE O DOWN EM PRODUÇÃO — dados regulatórios com retenção obrigatória de 5 anos
-- Em dev/staging APENAS: DROP TABLE IF EXISTS audit_events;
