-- Migration: 0012_create_additional_indexes.sql
-- Índices adicionais de performance para queries críticas do dashboard

-- Índice para query de checklists vencidos (DEV-04 §7.2)
CREATE INDEX idx_checklist_runs_completed_by_entity
  ON checklist_runs(entity_id, checklist_id, completed_at DESC)
  WHERE status = 'COMPLETED';

-- Índice para audit trail export (DEV-04 §7.3) — cursor pagination
CREATE INDEX idx_audit_events_cursor
  ON audit_events(tenant_id, occurred_at ASC, event_id ASC);

-- Índice para documentos próximos de expirar
CREATE INDEX idx_documents_valid_until
  ON documents(tenant_id, valid_until ASC)
  WHERE status = 'READY' AND valid_until IS NOT NULL;

-- Índice para notificações críticas não lidas
CREATE INDEX idx_notifications_critical_unread
  ON notifications(tenant_id, created_at DESC)
  WHERE read_at IS NULL AND severity = 'CRITICAL';

-- Índice para score de risco mais recente por entidade
CREATE INDEX idx_risk_assessments_latest
  ON risk_assessments(entity_id, calculated_at DESC);

-- Índice GIN para busca em JSONB dos itens de checklist
CREATE INDEX idx_checklists_items_gin
  ON checklists USING GIN (items);

-- Índice para entidades PEP — monitoramento obrigatório
CREATE INDEX idx_entities_pep_active
  ON entities(tenant_id, last_assessed_at NULLS FIRST)
  WHERE is_pep = TRUE AND status = 'ACTIVE';

-- DOWN: DROP INDEX IF EXISTS ... (todos os índices acima)
