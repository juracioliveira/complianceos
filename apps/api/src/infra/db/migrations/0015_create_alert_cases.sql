-- Migration: 0015_create_alert_cases.sql
-- Módulo de Case Management (P0) — Fila de Alertas e Investigação

-- Enum: fonte do alerta
CREATE TYPE alert_source AS ENUM (
    'SANCTIONS_MATCH',
    'PEP_MATCH',
    'CHECKLIST_OVERDUE',
    'HIGH_RISK_ENTITY',
    'MANUAL'
);

-- Enum: severidade do caso
CREATE TYPE alert_severity AS ENUM (
    'CRITICAL',
    'HIGH',
    'MEDIUM',
    'LOW'
);

-- Enum: status do caso
CREATE TYPE alert_case_status AS ENUM (
    'OPEN',
    'UNDER_REVIEW',
    'ESCALATED',
    'CLOSED_FALSE_POSITIVE',
    'CLOSED_CONFIRMED'
);

-- Tabela principal de casos de alerta
CREATE TABLE IF NOT EXISTS alert_cases (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    entity_id           UUID REFERENCES entities(id) ON DELETE SET NULL,

    source              alert_source NOT NULL,
    severity            alert_severity NOT NULL DEFAULT 'MEDIUM',
    status              alert_case_status NOT NULL DEFAULT 'OPEN',

    title               VARCHAR(300) NOT NULL,
    description         TEXT NOT NULL DEFAULT '',
    evidence            JSONB NOT NULL DEFAULT '{}',

    assigned_to         UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_by         UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at         TIMESTAMP WITH TIME ZONE,
    resolution_note     TEXT,

    created_by          UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_alert_cases_tenant_status  ON alert_cases (tenant_id, status);
CREATE INDEX idx_alert_cases_tenant_severity ON alert_cases (tenant_id, severity);
CREATE INDEX idx_alert_cases_entity_id       ON alert_cases (entity_id);
CREATE INDEX idx_alert_cases_assigned_to     ON alert_cases (assigned_to);
CREATE INDEX idx_alert_cases_created_at      ON alert_cases (created_at DESC);

-- RLS (Row Level Security) — isolamento por tenant
ALTER TABLE alert_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY alert_cases_tenant_isolation ON alert_cases
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

COMMENT ON TABLE alert_cases IS 'Casos de alerta para investigação: sanctions matches, PEP, checklists vencidos e alertas manuais.';
