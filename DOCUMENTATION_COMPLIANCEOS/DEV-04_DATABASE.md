# 🗄️ DEV-04 — Banco de Dados: Schema, RLS e Migrations

> [!NOTE]
> **Compliance OS · Chuangxin Tecnologia**  
> Código: `SaaS-DEV-04` · Engine: **PostgreSQL 16** · ORM: **Drizzle ORM**

---

## 💎 1. Princípios do Modelo de Dados

> [!IMPORTANT]
> **Multi-tenancy via RLS:** isolamento por `tenant_id` garantido no banco.
> **Audit Trail imutável:** UPDATE/DELETE proibidos na tabela `audit_events`.
> **Timestamps:** Sempre UTC por padrão.

---

## 2. Roles do PostgreSQL

```sql
-- Role da aplicação — sem privilégio de DDL, bloqueado de modificar audit_events
CREATE ROLE compliance_app WITH LOGIN PASSWORD '${APP_DB_PASSWORD}';
GRANT CONNECT ON DATABASE compliance TO compliance_app;
GRANT USAGE ON SCHEMA public TO compliance_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO compliance_app;

-- EXCEÇÃO CRÍTICA: audit_events é INSERT ONLY para a app
REVOKE UPDATE, DELETE ON TABLE audit_events FROM compliance_app;

-- Role de migrations — usado apenas pelo pipeline de CI/CD
CREATE ROLE compliance_migrator WITH LOGIN PASSWORD '${MIGRATOR_DB_PASSWORD}';
GRANT ALL PRIVILEGES ON DATABASE compliance TO compliance_migrator;

-- Role de read-only — usada por ferramentas de BI e dashboards internos
CREATE ROLE compliance_reader WITH LOGIN PASSWORD '${READER_DB_PASSWORD}';
GRANT CONNECT ON DATABASE compliance TO compliance_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO compliance_reader;
```

---

## 3. Extensões Necessárias

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- gen_random_uuid(), crypt()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- busca full-text por CNPJ, nome
CREATE EXTENSION IF NOT EXISTS "btree_gin";    -- índices GIN para JSONB
```

---

## 4. Schema Completo

### 4.1 `tenants` — Clientes do SaaS

```sql
CREATE TABLE tenants (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(200) NOT NULL,
  cnpj          CHAR(14)    NOT NULL UNIQUE,
  plan          VARCHAR(20)  NOT NULL CHECK (plan IN ('STARTER', 'PROFESSIONAL', 'ENTERPRISE')),
  status        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'CANCELLED')),
  settings      JSONB        NOT NULL DEFAULT '{}',
  -- Campos de faturamento
  billing_email VARCHAR(200),
  trial_ends_at TIMESTAMPTZ,
  -- Metadados
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- settings JSONB schema esperado:
-- {
--   "modules": ["PLD_FT", "LGPD", "ANTICORRUPCAO"],
--   "maxUsers": 50,
--   "ssoEnabled": false,
--   "notificationEmail": "compliance@cliente.com.br",
--   "riskThresholds": { "high": 60, "critical": 30 }
-- }

CREATE INDEX idx_tenants_cnpj ON tenants(cnpj);
CREATE INDEX idx_tenants_status ON tenants(status);
```

### 4.2 `users` — Usuários por Tenant

```sql
CREATE TABLE users (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email           VARCHAR(200) NOT NULL,
  name            VARCHAR(200) NOT NULL,
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

-- Email único por tenant (não globalmente)
CREATE UNIQUE INDEX uq_users_tenant_email ON users(tenant_id, email);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);         -- para login (sem tenant ainda)

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_tenant_isolation ON users
  USING (tenant_id = current_setting('app.tenant_id')::UUID);
```

### 4.3 `entities` — Entidades Avaliadas

```sql
-- Entidades são os clientes/parceiros/fornecedores do tenant que serão avaliados
CREATE TABLE entities (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  -- Identificação
  name                 VARCHAR(200) NOT NULL,
  cnpj                 CHAR(14),
  cpf                  CHAR(11),    -- para PF (em alguns módulos)
  entity_type          VARCHAR(20)  NOT NULL CHECK (entity_type IN ('CLIENTE', 'FORNECEDOR', 'PARCEIRO', 'COLABORADOR')),
  sector               VARCHAR(100),
  -- Dados societários (JSONB para flexibilidade)
  corporate_data       JSONB        NOT NULL DEFAULT '{}',
  -- {
  --   "socios": [{"nome": "...", "cpf": "...", "participacao": 50.0}],
  --   "beneficiarioFinal": {...},
  --   "capitalSocial": 100000.00,
  --   "dataAbertura": "2020-01-15"
  -- }
  -- Score e risco calculados (cache — fonte de verdade é risk_assessments)
  risk_score           SMALLINT     CHECK (risk_score BETWEEN 0 AND 100),
  risk_level           VARCHAR(20)  CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'UNKNOWN')),
  last_assessed_at     TIMESTAMPTZ,
  -- Status
  status               VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'BLOCKED')),
  blocked_reason       TEXT,
  -- KYC/KYB
  kyc_status           VARCHAR(20)  DEFAULT 'PENDING' CHECK (kyc_status IN ('PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED')),
  kyc_completed_at     TIMESTAMPTZ,
  -- PEP
  is_pep               BOOLEAN      NOT NULL DEFAULT FALSE,
  pep_details          JSONB,
  -- Metadados
  created_by           UUID         NOT NULL REFERENCES users(id),
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- CNPJ único por tenant
CREATE UNIQUE INDEX uq_entities_tenant_cnpj ON entities(tenant_id, cnpj) WHERE cnpj IS NOT NULL;
CREATE INDEX idx_entities_tenant_id ON entities(tenant_id);
CREATE INDEX idx_entities_risk_level ON entities(tenant_id, risk_level);
CREATE INDEX idx_entities_name_trgm ON entities USING GIN (name gin_trgm_ops);  -- busca por nome

ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
CREATE POLICY entities_tenant_isolation ON entities
  USING (tenant_id = current_setting('app.tenant_id')::UUID);
```

### 4.4 `checklists` — Templates de Checklists Regulatórios

```sql
-- Templates versionados — não modificados após publicação
CREATE TABLE checklists (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- null = checklist do sistema (disponível para todos os planos); não-null = personalizado pelo tenant
  tenant_id        UUID        REFERENCES tenants(id) ON DELETE CASCADE,
  module           VARCHAR(20)  NOT NULL CHECK (module IN ('PLD_FT', 'LGPD', 'ANTICORRUPCAO')),
  regulation_code  VARCHAR(50)  NOT NULL,  -- ex: 'LEI_9613_98', 'LGPD_ART37', 'LEI_12846_13'
  title            VARCHAR(200) NOT NULL,
  description      TEXT,
  version          VARCHAR(10)  NOT NULL DEFAULT '1.0',
  status           VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'DEPRECATED')),
  -- Items do checklist em JSONB
  items            JSONB        NOT NULL,
  -- [
  --   {
  --     "id": "item_001",
  --     "order": 1,
  --     "question": "A empresa possui política PLD/FT documentada e aprovada?",
  --     "weight": 10,                  -- peso na composição do score final
  --     "category": "POLITICAS",
  --     "regulationRef": "Art. 9, Lei 9.613/98",
  --     "answerType": "BOOLEAN",       -- BOOLEAN | SCALE | TEXT | MULTIPLE_CHOICE
  --     "options": null,               -- para MULTIPLE_CHOICE
  --     "evidenceRequired": true,      -- se exige upload de evidência
  --     "helpText": "Considere política aprovada..."
  --   }
  -- ]
  -- Configurações
  periodicity_days SMALLINT,           -- frequência recomendada de execução
  applies_to       VARCHAR(20)[] NOT NULL DEFAULT ARRAY['CLIENTE', 'FORNECEDOR', 'PARCEIRO'],
  -- Metadados
  created_by       UUID         REFERENCES users(id),
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_checklists_module ON checklists(module, status);
CREATE INDEX idx_checklists_tenant ON checklists(tenant_id) WHERE tenant_id IS NOT NULL;
```

### 4.5 `checklist_runs` — Execuções de Checklists

```sql
-- IMUTÁVEL após status = COMPLETED (enforced por trigger)
CREATE TABLE checklist_runs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  checklist_id    UUID        NOT NULL REFERENCES checklists(id),
  entity_id       UUID        NOT NULL REFERENCES entities(id),
  executed_by     UUID        NOT NULL REFERENCES users(id),
  -- Respostas e score
  answers         JSONB       NOT NULL DEFAULT '[]',
  -- [
  --   {
  --     "itemId": "item_001",
  --     "answer": true,          -- valor da resposta (varia por answerType)
  --     "note": "Aprovada em Jan/2026",
  --     "evidenceKey": "s3://bucket/evidence/...",
  --     "answeredAt": "2026-02-15T10:30:00Z"
  --   }
  -- ]
  score           SMALLINT     CHECK (score BETWEEN 0 AND 100),
  risk_level      VARCHAR(20)  CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  -- Status do processo
  status          VARCHAR(20)  NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  started_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  -- Evidências e observações
  summary_notes   TEXT,
  evidence_keys   TEXT[]       NOT NULL DEFAULT '{}',  -- keys no S3
  -- Metadados de execução
  duration_secs   INTEGER,     -- tempo total de preenchimento
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_checklist_runs_tenant ON checklist_runs(tenant_id);
CREATE INDEX idx_checklist_runs_entity ON checklist_runs(tenant_id, entity_id);
CREATE INDEX idx_checklist_runs_status ON checklist_runs(tenant_id, status, completed_at DESC);

ALTER TABLE checklist_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY checklist_runs_tenant_isolation ON checklist_runs
  USING (tenant_id = current_setting('app.tenant_id')::UUID);

-- Trigger: impedir modificação de runs COMPLETED
CREATE OR REPLACE FUNCTION prevent_completed_run_modification()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'COMPLETED' THEN
    RAISE EXCEPTION 'checklist_run imutável após status COMPLETED (id: %)', OLD.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_completed_run_modification
  BEFORE UPDATE ON checklist_runs
  FOR EACH ROW EXECUTE FUNCTION prevent_completed_run_modification();
```

### 4.6 `risk_assessments` — Histórico de Avaliações de Risco

```sql
CREATE TABLE risk_assessments (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entity_id       UUID        NOT NULL REFERENCES entities(id),
  -- Score composto e por dimensão
  score           SMALLINT    NOT NULL CHECK (score BETWEEN 0 AND 100),
  risk_level      VARCHAR(20)  NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  factors         JSONB        NOT NULL,
  -- {
  --   "pldFt":        { "score": 75, "weight": 0.4, "checklistRunId": "..." },
  --   "lgpd":         { "score": 60, "weight": 0.3, "checklistRunId": "..." },
  --   "anticorrupcao":{ "score": 80, "weight": 0.3, "checklistRunId": "..." },
  --   "sanctions":    { "clear": true, "screenedAt": "2026-02-15T..." },
  --   "pep":          { "isPep": false }
  -- }
  previous_level  VARCHAR(20)  CHECK (previous_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'UNKNOWN')),
  level_changed   BOOLEAN      NOT NULL DEFAULT FALSE,
  -- Validade
  calculated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ  NOT NULL,  -- calculado: NOW() + periodicity do checklist
  -- Quem calculou
  triggered_by    VARCHAR(20)  NOT NULL CHECK (triggered_by IN ('CHECKLIST_RUN', 'SANCTIONS_UPDATE', 'MANUAL', 'SCHEDULED')),
  triggered_by_id UUID,        -- ID do checklist_run ou do user que disparou manualmente
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_risk_assessments_entity ON risk_assessments(tenant_id, entity_id, calculated_at DESC);
CREATE INDEX idx_risk_assessments_level ON risk_assessments(tenant_id, risk_level, calculated_at DESC);

ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY risk_assessments_tenant_isolation ON risk_assessments
  USING (tenant_id = current_setting('app.tenant_id')::UUID);
```

### 4.7 `documents` — Documentos Regulatórios Gerados

```sql
CREATE TABLE documents (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entity_id       UUID        REFERENCES entities(id),  -- null = documento corporativo do tenant
  -- Identificação
  doc_type        VARCHAR(50)  NOT NULL CHECK (doc_type IN (
                    'POLITICA_PLD', 'POLITICA_PRIVACIDADE', 'RAT', 'DPIA',
                    'PROGRAMA_INTEGRIDADE', 'CODIGO_CONDUTA', 'RELATORIO_AUDITORIA',
                    'RELATORIO_RISCO', 'RELATORIO_RAS', 'TERMO_CONSENTIMENTO'
                  )),
  title           VARCHAR(300) NOT NULL,
  version         INTEGER      NOT NULL DEFAULT 1,
  -- Armazenamento
  s3_key          VARCHAR(500) NOT NULL,       -- chave no S3 (criptografado SSE-KMS)
  s3_bucket       VARCHAR(100) NOT NULL,
  file_size_bytes INTEGER,
  -- Integridade
  content_hash    CHAR(64)     NOT NULL,       -- SHA-256 do conteúdo do PDF
  -- Status
  status          VARCHAR(20)  NOT NULL DEFAULT 'GENERATING' CHECK (status IN (
                    'GENERATING', 'READY', 'FAILED', 'ARCHIVED'
                  )),
  -- Validade regulatória (alguns documentos têm prazo de revisão)
  valid_until     TIMESTAMPTZ,
  -- Metadados de geração
  generated_by    UUID         NOT NULL REFERENCES users(id),
  generation_params JSONB      NOT NULL DEFAULT '{}',   -- parâmetros usados na geração
  error_message   TEXT,        -- se status = FAILED
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_tenant ON documents(tenant_id, doc_type, created_at DESC);
CREATE INDEX idx_documents_entity ON documents(tenant_id, entity_id) WHERE entity_id IS NOT NULL;
CREATE INDEX idx_documents_status ON documents(status) WHERE status = 'GENERATING';

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_tenant_isolation ON documents
  USING (tenant_id = current_setting('app.tenant_id')::UUID);
```

### 4.8 `audit_events` — Trilha de Auditoria Imutável

> [!CAUTION]
> **TABELA CRÍTICA:** Operações de UPDATE e DELETE são proibidas via triggers e roles. Qualquer tentativa de alteração será bloqueada e logada como incidente de segurança.

```sql
-- TABELA CRÍTICA — INSERT ONLY via trigger — NUNCA alterar manualmente
CREATE TABLE audit_events (
  event_id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL,  -- sem FK para não bloquear drop de tenant (retenção 5 anos)
  -- Contexto do ator
  actor_id        UUID        NOT NULL,  -- user_id ou 'SYSTEM' codificado
  actor_type      VARCHAR(20)  NOT NULL DEFAULT 'USER' CHECK (actor_type IN ('USER', 'SYSTEM', 'API')),
  actor_ip        INET,
  actor_user_agent TEXT,
  -- Evento
  occurred_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  module          VARCHAR(30)  NOT NULL CHECK (module IN (
                    'PLD_FT', 'LGPD', 'ANTICORRUPCAO', 'DOCS',
                    'ENTITIES', 'USERS', 'AUTH', 'ADMIN', 'SYSTEM'
                  )),
  action          VARCHAR(100) NOT NULL,  -- ex: 'checklist.execute', 'entity.risk.escalated'
  resource_type   VARCHAR(50),            -- ex: 'checklist_run', 'entity', 'document'
  resource_id     UUID,
  -- Resultado
  result          VARCHAR(10)  NOT NULL CHECK (result IN ('SUCCESS', 'FAILURE', 'PARTIAL')),
  error_code      VARCHAR(50),
  -- Integridade encadeada (blockchain-lite)
  payload_hash    CHAR(64)     NOT NULL,  -- SHA-256 do payload da ação
  prev_hash       CHAR(64),               -- hash do evento anterior do mesmo tenant (encadeamento)
  -- Dados do evento (sem dados pessoais — apenas IDs e metadados)
  metadata        JSONB        NOT NULL DEFAULT '{}'
  -- { "checklistId": "...", "entityId": "...", "scoreChange": { "from": 75, "to": 45 } }
);

-- Índices para consulta eficiente (auditores e reguladores)
CREATE INDEX idx_audit_tenant_time ON audit_events(tenant_id, occurred_at DESC);
CREATE INDEX idx_audit_actor ON audit_events(tenant_id, actor_id, occurred_at DESC);
CREATE INDEX idx_audit_module ON audit_events(tenant_id, module, action, occurred_at DESC);
CREATE INDEX idx_audit_resource ON audit_events(tenant_id, resource_type, resource_id, occurred_at DESC);

-- RLS — auditores só veem seu próprio tenant
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_events_tenant_isolation ON audit_events
  USING (tenant_id = current_setting('app.tenant_id')::UUID);

-- TRIGGER: impedir UPDATE e DELETE (imutabilidade absoluta)
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_events é imutável — UPDATE e DELETE são proibidos. Evento: %', OLD.event_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_audit_events_immutable
  BEFORE UPDATE OR DELETE ON audit_events
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();
```

### 4.9 `notifications` — Notificações e Alertas

```sql
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
  -- Contexto
  related_entity_type VARCHAR(50),
  related_entity_id   UUID,
  action_url      VARCHAR(500),  -- link de deep-link para a tela relevante
  -- Status
  read_at         TIMESTAMPTZ,
  dismissed_at    TIMESTAMPTZ,
  -- Agendamento
  due_at          TIMESTAMPTZ,   -- quando o prazo expira (para due_soon)
  -- Envio por e-mail
  email_sent_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(tenant_id, user_id, read_at NULLS FIRST, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, created_at DESC) WHERE read_at IS NULL;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_tenant_isolation ON notifications
  USING (tenant_id = current_setting('app.tenant_id')::UUID);
```

### 4.10 `alert_cases` — Casos de Alerta Regulatórios (P0 · Sprint Mar/2026)

> [!IMPORTANT]
> Tabela central do módulo de gestão de alertas (Case Management). Gerada automaticamente pelo worker de sanctions screening (P1-A) ou manualmente por usuários.

```sql
CREATE TYPE alert_source AS ENUM (
  'SANCTIONS_MATCH', 'PEP_MATCH', 'CHECKLIST_OVERDUE', 'HIGH_RISK_ENTITY', 'MANUAL'
);
CREATE TYPE alert_severity AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');
CREATE TYPE alert_case_status AS ENUM (
  'OPEN', 'UNDER_REVIEW', 'ESCALATED', 'CLOSED_FALSE_POSITIVE', 'CLOSED_CONFIRMED'
);

CREATE TABLE alert_cases (
  id                  UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID              NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entity_id           UUID              REFERENCES entities(id) ON DELETE SET NULL,
  -- Origem e classificação
  source              alert_source      NOT NULL,
  severity            alert_severity    NOT NULL DEFAULT 'MEDIUM',
  title               VARCHAR(300)      NOT NULL,
  description         TEXT              NOT NULL DEFAULT '',
  -- Evidências estruturadas (match de sanção, PEP, scores etc.)
  evidence            JSONB             NOT NULL DEFAULT '{}',
  -- {
  --   "list": "OFAC_SDN",
  --   "matchScore": 0.98,
  --   "matchedName": "John Doe",
  --   "entityType": "individual",
  --   "details": { ... }
  -- }
  -- Fluxo de trabalho (máquina de estados)
  status              alert_case_status NOT NULL DEFAULT 'OPEN',
  assigned_to         UUID              REFERENCES users(id) ON DELETE SET NULL,
  resolution_note     TEXT,
  resolved_at         TIMESTAMPTZ,
  -- Rastreabilidade
  created_by          UUID              REFERENCES users(id) ON DELETE SET NULL,  -- null = sistema
  -- Audit trail interno (array de eventos)
  audit_trail         JSONB             NOT NULL DEFAULT '[]',
  -- [
  --   {
  --     "timestamp": "2026-03-04T...",
  --     "actorId": "...",
  --     "event": "STATUS_CHANGED",
  --     "from": "OPEN",
  --     "to": "UNDER_REVIEW",
  --     "note": "Iniciando investigação"
  --   }
  -- ]
  created_at          TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alert_cases_tenant ON alert_cases(tenant_id, status, severity, created_at DESC);
CREATE INDEX idx_alert_cases_entity ON alert_cases(tenant_id, entity_id) WHERE entity_id IS NOT NULL;
CREATE INDEX idx_alert_cases_open ON alert_cases(tenant_id, severity) WHERE status IN ('OPEN', 'UNDER_REVIEW', 'ESCALATED');

ALTER TABLE alert_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY alert_cases_tenant_isolation ON alert_cases
  USING (tenant_id = current_setting('app.tenant_id')::UUID);
```

**Máquina de estados de `alert_cases`:**

```
OPEN → UNDER_REVIEW → ESCALATED → CLOSED_CONFIRMED
                              ↘ CLOSED_FALSE_POSITIVE
```

Transições válidas:
| De | Para |
|---|---|
| `OPEN` | `UNDER_REVIEW`, `CLOSED_FALSE_POSITIVE` |
| `UNDER_REVIEW` | `ESCALATED`, `CLOSED_FALSE_POSITIVE`, `CLOSED_CONFIRMED` |
| `ESCALATED` | `CLOSED_CONFIRMED`, `CLOSED_FALSE_POSITIVE` |

### 4.11 `webhooks` — Integrações Externas (Sprint Fev/2026)

```sql
CREATE TABLE webhooks (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  url         VARCHAR(500)  NOT NULL,
  secret      TEXT          NOT NULL,         -- segredo HMAC-SHA256 para verificação de assinatura
  status      VARCHAR(20)   NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  -- Filtros de eventos (array vazio = todos os eventos)
  events      TEXT[]        NOT NULL DEFAULT '{}',
  -- ex: ['alert.created', 'alert.escalated', 'entity.risk.changed']
  description VARCHAR(200),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhooks_tenant ON webhooks(tenant_id, status);

ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY webhooks_tenant_isolation ON webhooks
  USING (tenant_id = current_setting('app.tenant_id')::UUID);
```

**Assinatura de entrega:** cada request inclui header `X-ComplianceOS-Signature: sha256=<HMAC-SHA256(body, secret)>` para verificação de autenticidade.


## 5. Row-Level Security — Como Funciona

O middleware de tenant da API seta a variável de sessão antes de qualquer query:

```typescript
// apps/api/src/middlewares/tenant.middleware.ts
export async function tenantMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const tenantId = request.user.tenantId  // extraído do JWT

  // Setar a variável de sessão do PostgreSQL — ativa o RLS
  await request.db.execute(
    sql`SET LOCAL app.tenant_id = ${tenantId}`
  )
}
```

```sql
-- PostgreSQL: toda query após o SET LOCAL usa automaticamente o RLS
-- O banco garante que tenant A nunca veja dados do tenant B
-- mesmo que o código de aplicação tenha um bug

-- Verificar o RLS em funcionamento (apenas em dev/debug)
SET LOCAL app.tenant_id = 'uuid-do-tenant-a';
SELECT COUNT(*) FROM entities;  -- retorna apenas entidades do tenant A
```

---

## 6. Migrations

### 6.1 Convenção de Nomenclatura

```
migrations/
├── 0001_create_extensions.sql       -- pgcrypto, pg_trgm, btree_gin
├── 0002_create_tenants.sql          -- tenants (config, planos, settings JSONB)
├── 0003_create_users.sql            -- users, MFA, convites, RLS
├── 0004_create_entities.sql         -- entities, corporate_data JSONB, PEP
├── 0005_create_checklists.sql       -- checklists templates versionados
├── 0006_create_documents.sql        -- documents (S3 keys, SHA-256, status)
├── 0007_create_checklist_runs.sql   -- checklist_runs, trigger imutabilidade COMPLETED
├── 0008_create_risk_assessments.sql -- risk_assessments (score composto, factors JSONB)
├── 0009_create_audit_events.sql     -- audit_events INSERT ONLY + blockchain hash
├── 0010_create_alert_cases.sql      -- alert_cases (P0) + ENUMs de source/severity/status
├── 0011_create_notifications.sql    -- notifications, severity, action_url
├── 0012_create_additional_indexes.sql -- índices compostos de performance
├── 0013_seed_system_checklists.sql  -- seeds dos checklists regulatórios do sistema
└── 0014_create_webhooks.sql         -- webhooks (integrações HMAC-SHA256)
```

### 6.2 Regras de Migration

```sql
-- ✅ TODA migration deve ser reversível (ter um DOWN)
-- DOWN: 0006_create_checklist_runs.sql
DROP TABLE IF EXISTS checklist_runs;

-- ✅ Migrations de schema nunca deletam dados sem aprovação do Tech Lead
-- ✅ Migrations de produção são revisadas pelo Tech Lead + CTO antes de aplicar
-- ✅ Sempre testar o rollback em staging antes de aplicar em prod

-- ❌ NUNCA
ALTER TABLE audit_events ADD COLUMN ... -- tabela imutável
TRUNCATE TABLE checklist_runs;          -- perda de dados de compliance
DROP TABLE entities;                    -- sem aprovação explícita
```

### 6.3 Comandos de Migration

```bash
# Aplicar migrations pendentes
pnpm db:migrate

# Criar nova migration
pnpm db:migrate:create add_sanctions_screening_status

# Verificar status das migrations
pnpm db:migrate:status

# Rollback da última migration (APENAS em dev/staging)
pnpm db:migrate:rollback

# Rollback em produção: sempre via PR + aprovação
```

---

## 7. Queries Críticas de Referência

### 7.1 Dashboard — KPIs do Tenant

```sql
-- Resumo de entidades por nível de risco (otimizado com índice)
SELECT
  risk_level,
  COUNT(*) AS total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS pct
FROM entities
WHERE status = 'ACTIVE'
  AND tenant_id = current_setting('app.tenant_id')::UUID
GROUP BY risk_level
ORDER BY
  CASE risk_level
    WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2
    WHEN 'MEDIUM' THEN 3 WHEN 'LOW' THEN 4 ELSE 5
  END;
```

### 7.2 Checklists Vencidos ou com Vencimento Próximo

```sql
-- Checklists que precisam ser re-executados (periodicidade expirada)
SELECT
  e.name           AS entity_name,
  c.title          AS checklist_title,
  c.module,
  cr.completed_at,
  cr.completed_at + (c.periodicity_days || ' days')::INTERVAL AS next_due,
  CASE
    WHEN cr.completed_at + (c.periodicity_days || ' days')::INTERVAL < NOW() THEN 'OVERDUE'
    WHEN cr.completed_at + (c.periodicity_days || ' days')::INTERVAL < NOW() + INTERVAL '30 days' THEN 'DUE_SOON'
    ELSE 'OK'
  END AS due_status
FROM entities e
JOIN checklists c ON c.applies_to @> ARRAY[e.entity_type]::VARCHAR[]
LEFT JOIN LATERAL (
  SELECT * FROM checklist_runs cr
  WHERE cr.entity_id = e.id AND cr.checklist_id = c.id AND cr.status = 'COMPLETED'
  ORDER BY cr.completed_at DESC LIMIT 1
) cr ON TRUE
WHERE e.status = 'ACTIVE'
  AND c.status = 'ACTIVE'
  AND c.periodicity_days IS NOT NULL
  AND (cr.completed_at IS NULL
    OR cr.completed_at + (c.periodicity_days || ' days')::INTERVAL < NOW() + INTERVAL '30 days')
ORDER BY next_due NULLS FIRST;
```

### 7.3 Exportação de Audit Trail para Reguladores

```sql
-- Exportação otimizada por período — usada pelo endpoint /v1/audit/events
-- Cursor-based pagination para grandes volumes (sem OFFSET)
SELECT
  event_id,
  occurred_at,
  actor_type,
  module,
  action,
  resource_type,
  resource_id,
  result,
  payload_hash,
  prev_hash,
  metadata
FROM audit_events
WHERE tenant_id = current_setting('app.tenant_id')::UUID
  AND occurred_at BETWEEN $1 AND $2
  AND ($3::VARCHAR IS NULL OR module = $3)        -- filtro opcional por módulo
  AND event_id > $4                               -- cursor para paginação
ORDER BY occurred_at ASC, event_id ASC
LIMIT 500;  -- máximo por página para exportações
```

### 7.4 Alert Cases — Fila de Investigação (P0)

```sql
-- Listar casos abertos ordenados por severidade (fila de trabalho do analista)
SELECT
  ac.id,
  ac.title,
  ac.source,
  ac.severity,
  ac.status,
  ac.created_at,
  e.name    AS entity_name,
  e.cnpj    AS entity_cnpj,
  u.name    AS assigned_to_name
FROM alert_cases ac
LEFT JOIN entities e ON e.id = ac.entity_id
LEFT JOIN users u ON u.id = ac.assigned_to
WHERE ac.status IN ('OPEN', 'UNDER_REVIEW', 'ESCALATED')
ORDER BY
  CASE ac.severity
    WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2
    WHEN 'MEDIUM' THEN 3 ELSE 4
  END,
  ac.created_at ASC  -- mais antigo primeiro dentro da mesma prioridade
LIMIT 50;

-- KPIs de alert_cases para o dashboard
SELECT
  COUNT(*) FILTER (WHERE status IN ('OPEN', 'UNDER_REVIEW', 'ESCALATED')) AS open_cases,
  COUNT(*) FILTER (WHERE status IN ('OPEN', 'UNDER_REVIEW', 'ESCALATED') AND severity = 'CRITICAL') AS critical_cases,
  COUNT(*) FILTER (WHERE status = 'CLOSED_CONFIRMED') AS confirmed_threats,
  COUNT(*) FILTER (WHERE created_at >= date_trunc('week', NOW())) AS new_this_week,
  COUNT(*) FILTER (WHERE created_at >= date_trunc('week', NOW() - INTERVAL '1 week')
                    AND created_at < date_trunc('week', NOW())) AS new_last_week
FROM alert_cases;
```

### 7.5 Dashboard — Trend Data Mês/Semana (P2)

```sql
-- Trend de entidades: mês atual vs mês anterior
SELECT
  COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW())) AS entities_this_month,
  COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW() - INTERVAL '1 month')
                    AND created_at < date_trunc('month', NOW())) AS entities_last_month
FROM entities;

-- Trend de checklists concluídos
SELECT
  COUNT(*) FILTER (WHERE completed_at >= date_trunc('month', NOW())) AS checklists_this_month,
  COUNT(*) FILTER (WHERE completed_at >= date_trunc('month', NOW() - INTERVAL '1 month')
                    AND completed_at < date_trunc('month', NOW())) AS checklists_last_month
FROM checklist_runs WHERE status = 'COMPLETED';

-- Trend de alert cases: semana atual vs semana anterior
SELECT
  COUNT(*) FILTER (WHERE created_at >= date_trunc('week', NOW())) AS cases_this_week,
  COUNT(*) FILTER (WHERE created_at >= date_trunc('week', NOW() - INTERVAL '1 week')
                    AND created_at < date_trunc('week', NOW())) AS cases_last_week
FROM alert_cases;
-- Nota: essas queries são executadas em paralelo com Promise.all() no dashboard.controller.ts
```

---

## 8. Backup e Retenção

| Dado | Retenção | Storage | Política |
|---|---|---|---|
| `audit_events` | **5 anos** | S3 Object Lock — Compliance Mode | WORM — imutável |
| Demais tabelas | 5 anos após cancelamento do tenant | RDS automated backup | Diário com point-in-time |
| Documentos gerados | 5 anos | S3 Standard → S3 Glacier após 1 ano | Lifecycle policy automática |
| Logs de aplicação | 1 ano | CloudWatch → S3 Cold | Log Group retention policy |

> Base legal: REG-03 Grupo Guinle · Art. 37 LGPD · Art. 9, Lei 9.613/98 (PLD)

---

> *Grupo Guinle · Chuangxin Tecnologia · Confidencial — Uso Interno*  
> *Alterações de schema: PR obrigatório + revisão Tech Lead + CTO (para tabelas críticas)*
