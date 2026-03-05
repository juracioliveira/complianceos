# 🔌 DEV-05 — Contratos de API

> [!NOTE]
> **Compliance OS · Chuangxin Tecnologia**  
> Código: `SaaS-DEV-05` · Base URL: `https://api.complianceos.com.br` · Versão: `v1`

---

## 📡 1. Convenções Gerais

### 1.1 Autenticação

> [!IMPORTANT]
> Todos os endpoints (exceto `/auth/*`) requerem autenticação via Bearer Token.

```http
Authorization: Bearer <access_token>
```

O `access_token` é um **JWT RS256** com expiração de **15 minutos**.

**Payload do JWT:**

```json
{
  "sub": "uuid-do-usuario",
  "tenantId": "uuid-do-tenant",
  "role": "COMPLIANCE_OFFICER",
  "plan": "PROFESSIONAL",
  "modules": ["PLD_FT", "LGPD"],
  "iat": 1708123456,
  "exp": 1708124356
}
```

### 1.2 Versionamento

A API usa versionamento por URL: `/v1/`, `/v2/`. Versões antigas são mantidas por mínimo **6 meses** após anúncio de deprecação, com header `Deprecation: true` nas respostas.

### 1.3 Rate Limiting

| Plano | Requisições/minuto | Burst |
|---|---|---|
| Starter | 120 req/min | 20 req/seg |
| Professional | 600 req/min | 50 req/seg |
| Enterprise | 3.000 req/min | 200 req/seg |

Headers de rate limit em toda resposta:

```http
X-RateLimit-Limit: 600
X-RateLimit-Remaining: 487
X-RateLimit-Reset: 1708123500
Retry-After: 45           # apenas quando 429
```

### 1.4 Paginação (Cursor-based)

```http
GET /v1/entities?cursor=01HQ7XK...&limit=25&sort=created_at:desc
```

**Resposta paginada:**

```json
{
  "data": [...],
  "meta": {
    "total": 142,
    "limit": 25,
    "hasMore": true,
    "nextCursor": "01HQ7XL...",
    "prevCursor": "01HQ7XJ..."
  }
}
```

### 1.5 Formato de Erros (RFC 7807)

```json
{
  "type": "https://complianceos.com.br/errors/VALIDATION_ERROR",
  "title": "Erro de validação",
  "status": 400,
  "detail": "Descrição legível do erro",
  "instance": "/v1/entities",
  "requestId": "01HQ7XK2N3P4Q5R6S7T8U9V0",
  "timestamp": "2026-02-15T14:30:00Z",
  "errors": [
    { "field": "cnpj", "code": "INVALID_FORMAT", "message": "CNPJ deve ter 14 dígitos numéricos" }
  ]
}
```

**Códigos de erro da aplicação:**

| Código HTTP | Error Type | Quando ocorre |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Schema inválido, campo obrigatório ausente |
| 401 | `UNAUTHORIZED` | Token ausente, expirado ou inválido |
| 401 | `MFA_REQUIRED` | MFA não configurado ou código inválido |
| 403 | `FORBIDDEN` | Role insuficiente para a ação |
| 403 | `MODULE_NOT_ENABLED` | Plano não inclui o módulo solicitado |
| 404 | `NOT_FOUND` | Recurso não existe ou não pertence ao tenant |
| 409 | `CONFLICT` | Recurso já existe (ex: CNPJ duplicado) |
| 422 | `BUSINESS_RULE_VIOLATION` | Regra de negócio violada (ex: run COMPLETED) |
| 429 | `RATE_LIMIT_EXCEEDED` | Limite de requisições atingido |
| 500 | `INTERNAL_ERROR` | Erro interno — reportar ao suporte |

---

## 2. Autenticação — `/auth`

### `POST /v1/auth/login`

**Permissão:** Pública

```json
// Request
{
  "email": "cco@empresa.com.br",
  "password": "SenhaSegura@2026",
  "mfaCode": "123456"    // obrigatório se MFA habilitado
}

// Response 200
{
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "expiresIn": 900,
    "user": {
      "id": "uuid",
      "name": "Maria Silva",
      "email": "cco@empresa.com.br",
      "role": "COMPLIANCE_OFFICER",
      "mfaEnabled": true
    },
    "tenant": {
      "id": "uuid",
      "name": "Acme Fintech",
      "plan": "PROFESSIONAL",
      "modules": ["PLD_FT", "LGPD"]
    }
  }
}

// Response 401 — MFA obrigatório não fornecido
{
  "type": ".../MFA_REQUIRED",
  "title": "MFA obrigatório",
  "status": 401,
  "detail": "Configure e forneça o código MFA para continuar"
}
```

### `POST /v1/auth/refresh`

```json
// Request
{ "refreshToken": "eyJhbGci..." }

// Response 200
{
  "data": {
    "accessToken": "eyJhbGci...",
    "expiresIn": 900
  }
}
```

### `POST /v1/auth/logout`

```json
// Response 204 — No Content
```

---

## 3. Entidades — `/entities`

### `GET /v1/entities`

**Permissão:** `ANALYST`, `COMPLIANCE_OFFICER`, `ADMIN`, `AUDITOR`, `READONLY`

```http
GET /v1/entities?limit=25&cursor=...&sort=risk_level:asc&filter[risk_level]=HIGH&filter[status]=ACTIVE&search=acme
```

**Parâmetros de query:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `cursor` | string | Cursor de paginação (opaque token) |
| `limit` | integer | Itens por página (1–100, default 25) |
| `sort` | string | Campo e direção: `risk_level:asc`, `name:asc`, `created_at:desc` |
| `filter[risk_level]` | string | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`, `UNKNOWN` |
| `filter[status]` | string | `ACTIVE`, `INACTIVE`, `BLOCKED` |
| `filter[entity_type]` | string | `CLIENTE`, `FORNECEDOR`, `PARCEIRO` |
| `search` | string | Busca por nome (ILIKE com trigram index) |

```json
// Response 200
{
  "data": [
    {
      "id": "01HQ7XK2N...",
      "name": "Acme Pagamentos Ltda",
      "cnpj": "12345678000195",
      "entityType": "CLIENTE",
      "sector": "Serviços Financeiros",
      "riskScore": 42,
      "riskLevel": "HIGH",
      "lastAssessedAt": "2026-02-01T10:00:00Z",
      "kycStatus": "APPROVED",
      "status": "ACTIVE",
      "createdAt": "2026-01-15T09:00:00Z"
    }
  ],
  "meta": {
    "total": 87,
    "limit": 25,
    "hasMore": true,
    "nextCursor": "01HQ7XL..."
  }
}
```

### `POST /v1/entities`

**Permissão:** `COMPLIANCE_OFFICER`, `ADMIN`

```json
// Request
{
  "name": "Beta Cooperativa de Crédito",
  "cnpj": "98765432000187",
  "entityType": "CLIENTE",
  "sector": "Cooperativa de Crédito",
  "corporateData": {
    "capitalSocial": 5000000.00,
    "dataAbertura": "2010-03-20",
    "socios": [
      { "nome": "João Costa", "cpf": "12345678901", "participacao": 35.0 }
    ]
  }
}

// Response 201
{
  "data": {
    "id": "01HQ8YL3M...",
    "name": "Beta Cooperativa de Crédito",
    "cnpj": "98765432000187",
    "entityType": "CLIENTE",
    "riskLevel": "UNKNOWN",
    "riskScore": null,
    "kycStatus": "PENDING",
    "status": "ACTIVE",
    "createdAt": "2026-02-15T14:30:00Z"
  },
  "meta": {
    "kybJobId": "job_01HQ8YL...",   // job assíncrono de validação CNPJ
    "message": "Entidade criada. KYB iniciado automaticamente."
  }
}
```

### `GET /v1/entities/:id`

```json
// Response 200 — Dados completos da entidade
{
  "data": {
    "id": "01HQ7XK2N...",
    "name": "Acme Pagamentos Ltda",
    "cnpj": "12345678000195",
    "entityType": "CLIENTE",
    "sector": "Serviços Financeiros",
    "corporateData": { "..." },
    "riskScore": 42,
    "riskLevel": "HIGH",
    "lastAssessedAt": "2026-02-01T10:00:00Z",
    "kycStatus": "APPROVED",
    "isPep": false,
    "status": "ACTIVE",
    "createdAt": "2026-01-15T09:00:00Z",
    "updatedAt": "2026-02-01T10:00:00Z",
    // Dados calculados
    "pendingChecklists": 2,
    "overdueChecklists": 1,
    "lastChecklistRunAt": "2026-01-20T15:00:00Z"
  }
}
```

### `GET /v1/entities/:id/risk-assessments`

**Permissão:** `ANALYST`, `COMPLIANCE_OFFICER`, `ADMIN`, `AUDITOR`, `READONLY`

```json
// Response 200
{
  "data": [
    {
      "id": "01HQ...",
      "score": 42,
      "riskLevel": "HIGH",
      "previousLevel": "MEDIUM",
      "levelChanged": true,
      "factors": {
        "pldFt":         { "score": 35, "weight": 0.4 },
        "lgpd":          { "score": 55, "weight": 0.3 },
        "anticorrupcao": { "score": 60, "weight": 0.3 },
        "sanctions":     { "clear": true, "screenedAt": "2026-02-01T09:55:00Z" },
        "pep":           { "isPep": false }
      },
      "triggeredBy": "CHECKLIST_RUN",
      "calculatedAt": "2026-02-01T10:00:00Z",
      "expiresAt": "2026-05-01T10:00:00Z"
    }
  ],
  "meta": { "total": 5, "limit": 10, "hasMore": false }
}
```

---

## 4. Checklists — `/checklists` e `/checklist-runs`

### `GET /v1/checklists`

**Permissão:** Todos os roles

```http
GET /v1/checklists?module=PLD_FT&status=ACTIVE
```

```json
// Response 200
{
  "data": [
    {
      "id": "01HQ...",
      "module": "PLD_FT",
      "regulationCode": "LEI_9613_98",
      "title": "Due Diligence PLD/FT — Cliente Padrão (CDD)",
      "description": "Checklist de conformidade com o Art. 10 da Lei 9.613/98...",
      "version": "2.1",
      "totalItems": 28,
      "periodicityDays": 365,
      "appliesTo": ["CLIENTE", "PARCEIRO"],
      "status": "ACTIVE"
    }
  ]
}
```

### `POST /v1/checklist-runs`

**Permissão:** `ANALYST`, `COMPLIANCE_OFFICER`, `ADMIN`

```json
// Request — iniciar execução de checklist
{
  "checklistId": "01HQ...",
  "entityId": "01HQ7XK2N...",
  "answers": []    // pode iniciar vazio (modo rascunho)
}

// Response 201
{
  "data": {
    "id": "01HR...",
    "status": "IN_PROGRESS",
    "checklistId": "01HQ...",
    "entityId": "01HQ7XK2N...",
    "totalItems": 28,
    "answeredItems": 0,
    "startedAt": "2026-02-15T14:30:00Z"
  }
}
```

### `PATCH /v1/checklist-runs/:id`

**Permissão:** `ANALYST`, `COMPLIANCE_OFFICER`, `ADMIN`  
**Regra:** Proibido se `status = COMPLETED`

```json
// Request — atualizar respostas (parcial — merge automático)
{
  "answers": [
    {
      "itemId": "item_001",
      "answer": true,
      "note": "Política aprovada em reunião de Diretoria em Jan/2026",
      "answeredAt": "2026-02-15T14:35:00Z"
    },
    {
      "itemId": "item_002",
      "answer": false,
      "note": "Em elaboração — prazo: Mar/2026"
    }
  ]
}

// Response 200
{
  "data": {
    "id": "01HR...",
    "status": "IN_PROGRESS",
    "answeredItems": 2,
    "totalItems": 28,
    "partialScore": null    // score só calculado ao completar
  }
}
```

### `POST /v1/checklist-runs/:id/complete`

**Permissão:** `COMPLIANCE_OFFICER`, `ADMIN`

```json
// Request
{
  "summaryNotes": "Due diligence concluída. Empresa apresenta programa PLD básico mas sem monitoramento contínuo."
}

// Response 200
{
  "data": {
    "id": "01HR...",
    "status": "COMPLETED",
    "score": 62,
    "riskLevel": "MEDIUM",
    "completedAt": "2026-02-15T15:20:00Z",
    "completedBy": { "id": "uuid", "name": "Maria Silva" },
    "answeredItems": 28,
    "totalItems": 28,
    "reportJobId": "job_01HR..."   // job de geração do relatório PDF
  },
  "meta": {
    "riskChanged": true,
    "previousLevel": "HIGH",
    "newLevel": "MEDIUM",
    "auditEventId": "01HR..."
  }
}
```

### `GET /v1/checklist-runs/:id`

```json
// Response 200 — Resultado completo
{
  "data": {
    "id": "01HR...",
    "status": "COMPLETED",
    "checklist": {
      "id": "01HQ...",
      "title": "Due Diligence PLD/FT — Cliente Padrão",
      "module": "PLD_FT"
    },
    "entity": {
      "id": "01HQ7XK2N...",
      "name": "Acme Pagamentos Ltda"
    },
    "score": 62,
    "riskLevel": "MEDIUM",
    "answers": [
      {
        "itemId": "item_001",
        "question": "A empresa possui política PLD/FT documentada?",
        "answer": true,
        "weight": 10,
        "note": "Política aprovada em reunião de Diretoria",
        "evidenceKey": null
      }
    ],
    "summaryNotes": "Due diligence concluída...",
    "executedBy": { "id": "uuid", "name": "Maria Silva" },
    "startedAt": "2026-02-15T14:30:00Z",
    "completedAt": "2026-02-15T15:20:00Z",
    "durationSecs": 3000
  }
}
```

---

## 5. Documentos — `/documents`

### `POST /v1/documents/generate`

**Permissão:** `COMPLIANCE_OFFICER`, `ADMIN`

```json
// Request
{
  "docType": "POLITICA_PLD",
  "entityId": null,        // null = documento corporativo do tenant
  "params": {
    "incluirProcedimentosKYC": true,
    "incluirMonitoramento": true,
    "vigenciaAnos": 1
  }
}

// Response 202 — Aceito para processamento assíncrono
{
  "data": {
    "jobId": "job_01HR...",
    "docType": "POLITICA_PLD",
    "status": "GENERATING",
    "estimatedSeconds": 30
  },
  "meta": {
    "webhookEvent": "document.ready",
    "pollUrl": "/v1/documents/jobs/job_01HR..."
  }
}
```

### `GET /v1/documents/jobs/:jobId`

```json
// Response 200 — Polling do status do job
{
  "data": {
    "jobId": "job_01HR...",
    "status": "READY",      // GENERATING | READY | FAILED
    "documentId": "01HR...",
    "downloadUrl": "/v1/documents/01HR.../download"
  }
}
```

### `GET /v1/documents/:id/download`

**Permissão:** `ANALYST`, `COMPLIANCE_OFFICER`, `ADMIN`, `AUDITOR`

```json
// Response 200
{
  "data": {
    "documentId": "01HR...",
    "title": "Política PLD/FT — Acme Fintech — Fev/2026",
    "docType": "POLITICA_PLD",
    "contentHash": "sha256:a1b2c3...",
    "fileSizeBytes": 245891,
    "presignedUrl": "https://s3.amazonaws.com/...",  // URL temporária — expira em 15min
    "presignedUrlExpiresAt": "2026-02-15T15:00:00Z",
    "generatedAt": "2026-02-15T14:35:00Z"
  }
}
```

### `GET /v1/documents`

```http
GET /v1/documents?docType=POLITICA_PLD&limit=10
```

```json
// Response 200
{
  "data": [
    {
      "id": "01HR...",
      "docType": "POLITICA_PLD",
      "title": "Política PLD/FT — Acme Fintech — Fev/2026",
      "status": "READY",
      "contentHash": "sha256:a1b2c3...",
      "generatedBy": { "name": "Maria Silva" },
      "createdAt": "2026-02-15T14:35:00Z",
      "validUntil": "2027-02-15T00:00:00Z"
    }
  ]
}
```

---

## 🔍 6. Audit Trail — `/audit`

> [!CAUTION]
> O acesso a estes endpoints é restrito a usuários com role `AUDITOR` ou `ADMIN`. Todas as consultas de auditoria são registradas nelas mesmas para fins de meta-auditoria.

**Permissão:** `AUDITOR`, `ADMIN` (apenas)

```http
GET /v1/audit/events?from=2026-01-01T00:00:00Z&to=2026-02-28T23:59:59Z&module=PLD_FT&limit=100&cursor=...
```

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `from` | ISO 8601 | Início do período (obrigatório) |
| `to` | ISO 8601 | Fim do período (obrigatório) |
| `module` | string | Filtrar por módulo |
| `action` | string | Filtrar por ação específica |
| `actorId` | UUID | Filtrar por usuário |
| `resourceId` | UUID | Filtrar por recurso específico |
| `result` | string | `SUCCESS`, `FAILURE`, `PARTIAL` |
| `format` | string | `json` (default) ou `csv` |
| `limit` | integer | 1–500 (default 100) |

```json
// Response 200
{
  "data": [
    {
      "eventId": "01HR...",
      "occurredAt": "2026-02-15T14:30:00Z",
      "actorType": "USER",
      "module": "PLD_FT",
      "action": "checklist.execute",
      "resourceType": "checklist_run",
      "resourceId": "01HR...",
      "result": "SUCCESS",
      "payloadHash": "sha256:a1b2c3...",
      "prevHash": "sha256:z9y8x7...",
      "metadata": {
        "checklistId": "01HQ...",
        "entityId": "01HQ7XK2N...",
        "scoreChange": { "from": null, "to": 62 },
        "riskChange": { "from": "HIGH", "to": "MEDIUM" }
      }
    }
  ],
  "meta": {
    "total": 1847,
    "limit": 100,
    "hasMore": true,
    "nextCursor": "01HR...",
    "integrityNote": "Hash chain verified — no gaps detected"
  }
}
```

### `POST /v1/exports/regulators`

**Permissão:** `COMPLIANCE_OFFICER`, `ADMIN`

```json
// Request — exportação formatada para regulador específico
{
  "regulator": "ANPD",    // ANPD | BACEN | CGU | COAF
  "period": {
    "from": "2025-01-01",
    "to": "2025-12-31"
  },
  "format": "pdf"         // pdf | xlsx | json
}

// Response 202
{
  "data": {
    "jobId": "job_01HR...",
    "regulator": "ANPD",
    "status": "GENERATING",
    "estimatedSeconds": 60
  }
}
```

---

## 7. Alert Cases — `/alert-cases` (P0 · Case Management)

> [!IMPORTANT]
> Módulo de gestão de alertas e investigação regulatória. Casos podem ser criados manualmente ou automaticamente pelo worker de sanctions screening (P1-A). A máquina de estados garante rastreabilidade completa.

### `GET /v1/alert-cases`

**Permissão:** `ANALYST`, `COMPLIANCE_OFFICER`, `ADMIN`, `AUDITOR`

```http
GET /v1/alert-cases?status=OPEN&severity=CRITICAL,HIGH&limit=50
```

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `status` | string ou array | `OPEN`, `UNDER_REVIEW`, `ESCALATED`, `CLOSED_FALSE_POSITIVE`, `CLOSED_CONFIRMED` |
| `severity` | string ou array | `CRITICAL`, `HIGH`, `MEDIUM`, `LOW` |
| `source` | string | `SANCTIONS_MATCH`, `PEP_MATCH`, `CHECKLIST_OVERDUE`, `HIGH_RISK_ENTITY`, `MANUAL` |
| `assignedTo` | UUID | Filtrar por responsável |
| `entityId` | UUID | Filtrar por entidade |
| `limit` | integer | 1–200 (default 50) |
| `offset` | integer | Offset para paginação |

```json
// Response 200
{
  "data": [
    {
      "id": "01HR...",
      "title": "Match em Lista OFAC_SDN — Acme Pagamentos",
      "source": "SANCTIONS_MATCH",
      "severity": "CRITICAL",
      "status": "OPEN",
      "entityId": "01HQ...",
      "entity_name": "Acme Pagamentos Ltda",
      "entity_cnpj": "12345678000195",
      "evidence": { "list": "OFAC_SDN", "matchScore": 0.98, "matchedName": "Acme Pagamentos" },
      "createdBy": null,
      "assignedTo": null,
      "createdAt": "2026-03-04T20:15:00Z",
      "updatedAt": "2026-03-04T20:15:00Z"
    }
  ],
  "meta": { "total": 12, "limit": 50, "hasMore": false }
}
```

### `POST /v1/alert-cases`

**Permissão:** `ANALYST`, `COMPLIANCE_OFFICER`, `ADMIN`

```json
// Request
{
  "entityId": "01HQ...",           // opcional
  "source": "MANUAL",
  "severity": "HIGH",
  "title": "Operações atipicas detectadas em análise manual",
  "description": "Cliente realizou 12 transferências acima de R$10k em 3 dias.",
  "evidence": { "transactionIds": ["tx_001", "tx_002"], "totalValue": 145000 }
}

// Response 201
{
  "data": {
    "id": "01HR...",
    "status": "OPEN",
    "severity": "HIGH",
    "source": "MANUAL",
    "createdAt": "2026-03-04T22:00:00Z"
  }
}
```

### `GET /v1/alert-cases/:id`

```json
// Response 200
{
  "data": {
    "id": "01HR...",
    "title": "Match em Lista OFAC_SDN",
    "source": "SANCTIONS_MATCH",
    "severity": "CRITICAL",
    "status": "UNDER_REVIEW",
    "description": "Entidade Acme Pagamentos encontrada na lista OFAC_SDN com score de similaridade 98%.",
    "evidence": { "list": "OFAC_SDN", "matchScore": 0.98 },
    "entity": { "id": "01HQ...", "name": "Acme Pagamentos Ltda", "cnpj": "12345678000195" },
    "assignedTo": { "id": "uuid", "name": "Maria Silva" },
    "auditTrail": [
      { "timestamp": "2026-03-04T20:15:00Z", "event": "CREATED", "actorId": null },
      { "timestamp": "2026-03-04T21:00:00Z", "event": "STATUS_CHANGED", "from": "OPEN", "to": "UNDER_REVIEW", "actorId": "uuid" }
    ],
    "createdAt": "2026-03-04T20:15:00Z",
    "updatedAt": "2026-03-04T21:00:00Z"
  }
}
```

### `PATCH /v1/alert-cases/:id`

**Permissão:** `ANALYST`, `COMPLIANCE_OFFICER`, `ADMIN`

```json
// Request — mudar status (máquina de estados)
{ "status": "ESCALATED", "resolutionNote": "Confirmado match. Bloqueando conta..." }

// Request — atribuir responsável
{ "assignedTo": "uuid-do-analista" }

// Response 200
{ "data": { ...dadosCasoAtualizado } }
```

> **Transições válidas:** `OPEN → UNDER_REVIEW`, `UNDER_REVIEW → ESCALATED`, `UNDER_REVIEW/ESCALATED → CLOSED_*`. Outras transições retornam `422 BUSINESS_RULE_VIOLATION`.

### `POST /v1/alert-cases/export` (P1-C · PDF Regulatório)

**Permissão:** `COMPLIANCE_OFFICER`, `ADMIN`

Gera e retorna um PDF regulatório dos casos de alerta, formatado para submissão ao COAF/BACEN/CVM. O documento inclui: capa institucional, metadados de geração, aviso legal e um card por caso com severidade, status, fonte e evidências.

```json
// Request
{
  "status": "CLOSED_CONFIRMED",   // opcional — pode ser array
  "severity": ["CRITICAL", "HIGH"],
  "source": "SANCTIONS_MATCH",     // opcional
  "limit": 200                     // máximo 500
}
```

```http
// Response 200 — binário PDF
Content-Type: application/pdf
Content-Disposition: attachment; filename="relatorio-alertas-2026-03-04.pdf"

<pdf binary>
```

**Exemplo de uso com cURL:**
```bash
curl -X POST https://api.complianceos.com.br/v1/alert-cases/export \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"severity":["CRITICAL","HIGH"]}' \\
  --output relatorio-alertas.pdf
```

> Base legal: COAF Res. 36/2021 · Art. 11 da Lei nº 9.613/1998 (retenção mínima de 5 anos).

---

## 8. Dashboard — `/dashboard` (P2 · Dados em Tempo Real)

### `GET /v1/dashboard/summary`

**Permissão:** Todos os roles  
**Cache:** Redis TTL 60s (atualizado automaticamente a cada nova operação)

```json
// Response 200
{
  "data": {
    "entities": {
      "total": 142,
      "byRisk": { "CRITICAL": 3, "HIGH": 18, "MEDIUM": 67, "LOW": 48, "UNKNOWN": 6 },
      "active": 138,
      "blocked": 4,
      "trend": { "delta": 5, "dir": "up", "pct": 4 }  // vs mês anterior
    },
    "checklists": {
      "overdue": 7,
      "dueSoon": 12,
      "completedThisMonth": 34,
      "inProgress": 3,
      "trend": { "delta": 8, "dir": "up", "pct": 31 }  // concluídos vs mês anterior
    },
    "documents": {
      "generatedThisMonth": 8,
      "expiringSoon": 2
    },
    "alerts": {
      "critical": 1,
      "warning": 5,
      "unread": 4,
      "openCases": 3,
      "criticalCases": 1,
      "trend": { "delta": 2, "dir": "up", "pct": null }  // alert cases esta semana vs semana anterior
    },
    "recentActivities": [
      { "entity": "Acme Fintech", "action": "Atualização de status", "user": "Maria Silva", "time": "há pouco", "risk": "HIGH" }
    ],
    "criticalEntities": [
      { "name": "Acme Pagamentos", "cnpj": "12345678000195", "type": "CLIENTE", "risk": "CRITICAL", "score": 18, "lastCheck": "2026-03-01T..." }
    ],
    "lastUpdated": "2026-03-04T22:00:00Z"
  }
}
```

### `GET /v1/dashboard/stream` (P2 · SSE em Tempo Real)

**Permissão:** Todos os roles  
**Protocolo:** Server-Sent Events (SSE)

Conecta o cliente ao stream de atualizações do dashboard em tempo real. O servidor envia eventos quando os KPIs mudam (detectado por hash do cache Redis), e heartbeats a cada 30s para manter a conexão viva.

```http
GET /v1/dashboard/stream
Accept: text/event-stream
Authorization: Bearer <token>
```

**Eventos emitidos:**

| Evento | Quando | Payload |
|---|---|---|
| `connected` | Imediatamente após conectar | `{ tenantId, timestamp }` |
| `summary` | Ao conectar (estado inicial) e quando KPIs mudam | Mesmo schema de `/summary` |
| `heartbeat` | A cada 30s sem mudanças | `{ timestamp }` |

**Exemplo de stream:**
```
event: connected
data: {"tenantId":"uuid","timestamp":"2026-03-04T22:00:00Z"}

event: summary
data: {"entities":{...},"checklists":{...},...}

event: heartbeat
data: {"timestamp":"2026-03-04T22:00:30Z"}
```

**Reconexão:** Em caso de desconexão, o cliente deve aguardar 15s e reconectar. O frontend do dashboard implementa essa lógica automaticamente.

### `GET /v1/dashboard/compliance-readiness`

**Permissão:** Todos os roles

```json
// Response 200
{
  "data": {
    "frameworks": [
      {
        "name": "SOC2 Type II",
        "score": 85,
        "controls": [
          { "id": "CC6.1", "name": "Logical Access", "status": "COMPLIANT", "feature": "MFA + JWT" },
          { "id": "CC7.1", "name": "System Operations", "status": "COMPLIANT", "feature": "Audit Chaining SHA-256" }
        ]
      },
      {
        "name": "ISO 27001",
        "score": 92,
        "controls": [
          { "id": "A.12.4.1", "name": "Event Logging", "status": "COMPLIANT", "feature": "Audit Trail" },
          { "id": "A.18.1.1", "name": "Applicable Legislation", "status": "COMPLIANT", "feature": "LGPD Module" }
        ]
      }
    ],
    "summary": { "overallReadiness": "HIGH", "lastAssessment": "2026-03-04T22:00:00Z" }
  }
}
```

---

## 8. Usuários — `/users`

### `GET /v1/users`

**Permissão:** `ADMIN`

### `POST /v1/users/invite`

**Permissão:** `ADMIN`

```json
// Request
{
  "email": "novo.analista@empresa.com.br",
  "name": "Carlos Ferreira",
  "role": "ANALYST"
}

// Response 201
{
  "data": {
    "id": "01HR...",
    "email": "novo.analista@empresa.com.br",
    "role": "ANALYST",
    "status": "INVITED",
    "inviteExpires": "2026-02-17T14:30:00Z"  // 48h
  },
  "meta": {
    "inviteEmailSent": true
  }
}
```

### `PATCH /v1/users/:id`

**Permissão:** `ADMIN` (alterar outros) · Qualquer role (alterar próprio perfil)

```json
// Request — alterar role ou status
{
  "role": "COMPLIANCE_OFFICER",
  "status": "ACTIVE"
}
```

---

## 9. Webhooks (Enterprise)

Clientes Enterprise podem registrar endpoints para receber eventos em tempo real:

### Eventos Disponíveis

| Evento | Quando disparado |
|---|---|
| `entity.risk.escalated` | Nível de risco de entidade subiu (ex: MEDIUM → HIGH) |
| `checklist.overdue` | Checklist ultrapassou a data de vencimento |
| `document.ready` | Documento PDF foi gerado com sucesso |
| `sanctions.hit` | Entidade encontrada em lista de sanções |
| `user.invited` | Novo usuário foi convidado para o tenant |
| `system.maintenance` | Janela de manutenção programada |

### Payload de Webhook

```json
// POST para URL configurada pelo cliente
{
  "webhookId": "wh_01HR...",
  "event": "entity.risk.escalated",
  "tenantId": "uuid",
  "timestamp": "2026-02-15T14:30:00Z",
  "data": {
    "entityId": "01HQ...",
    "entityName": "Acme Pagamentos Ltda",
    "previousLevel": "MEDIUM",
    "newLevel": "HIGH",
    "newScore": 42,
    "triggeredBy": "CHECKLIST_RUN",
    "checklistRunId": "01HR..."
  },
  "signature": "sha256=a1b2c3..."   // HMAC-SHA256 com webhook secret do cliente
}
```

**Validação da assinatura:**

```typescript
import { createHmac } from 'crypto'

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expected = 'sha256=' + createHmac('sha256', secret).update(payload).digest('hex')
  return signature === expected
}
```

---

## 10. Health e Status

### `GET /health`

```json
// Response 200
{
  "status": "healthy",
  "timestamp": "2026-02-15T14:30:00Z",
  "version": "1.0.0",
  "checks": {
    "database": "healthy",
    "redis": "healthy",
    "s3": "healthy",
    "queue": "healthy"
  }
}
```

### `GET /health/ready`

Usado pelo load balancer — retorna `200` apenas quando pronto para receber tráfego.

### `GET /health/live`

Kubernetes liveness probe — retorna `200` enquanto o processo está vivo.

---

> *Grupo Guinle · Chuangxin Tecnologia · Confidencial — Uso Interno*  
> *Atualizações de contrato de API: PR obrigatório + revisão Tech Lead + Head of Product*
