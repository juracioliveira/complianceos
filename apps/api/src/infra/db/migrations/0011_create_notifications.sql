-- Migration: 0011_create_notifications.sql

CREATE TABLE notifications (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id         UUID        REFERENCES users(id) ON DELETE CASCADE,  -- null = para todos do tenant
  -- Conteúdo
  type            VARCHAR(50)  NOT NULL CHECK (type IN (
                    'RISK_ESCALATED', 'CHECKLIST_OVERDUE', 'CHECKLIST_DUE_SOON',
                    'DOCUMENT_READY', 'DOCUMENT_EXPIRING', 'KYC_REQUIRED',
                    'SANCTIONS_HIT', 'SYSTEM_ALERT'
                  )),
  severity        VARCHAR(10)  NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
  title           VARCHAR(200) NOT NULL,
  body            TEXT         NOT NULL,
  -- Contexto e deep-link
  related_entity_type VARCHAR(50),
  related_entity_id   UUID,
  action_url      VARCHAR(500),
  -- Status
  read_at         TIMESTAMPTZ,
  dismissed_at    TIMESTAMPTZ,
  -- Agendamento
  due_at          TIMESTAMPTZ,
  -- Envio de email
  email_sent_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE notifications IS 'Notificações e alertas de compliance para usuários do tenant.';
COMMENT ON COLUMN notifications.user_id IS 'NULL = notificação para todos os usuários do tenant.';
COMMENT ON COLUMN notifications.action_url IS 'Deep-link para a tela relevante na UI.';

CREATE INDEX idx_notifications_user ON notifications(tenant_id, user_id, read_at NULLS FIRST, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, created_at DESC) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_severity ON notifications(tenant_id, severity, created_at DESC);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_tenant_isolation ON notifications
  USING (tenant_id = current_setting('app.tenant_id', TRUE)::UUID);

-- DOWN: DROP TABLE IF EXISTS notifications;
