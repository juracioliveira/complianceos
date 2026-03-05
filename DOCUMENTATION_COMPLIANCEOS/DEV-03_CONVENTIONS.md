# 📜 DEV-03 — Convenções de Código e Processos

> [!NOTE]
> **Compliance OS · Chuangxin Tecnologia**  
> Código: `SaaS-DEV-03` · **Status: Mandatório** · Estas convenções são gates do CI.

---

## 💡 1. Princípios Gerais

> [!TIP]
> **Legibilidade sobre "cleverness":** Código de compliance será lido por auditores. Seja explícito.
> **Tipos, sempre:** `any` implícito é erro de CI.
> **Auditabilidade:** Toda ação que modifica estado de compliance **deve** gerar um `audit_event`.

---

## 2. TypeScript

### 2.1 Configuração Obrigatória (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 2.2 Regras de Tipagem

```typescript
// ❌ PROIBIDO — any implícito
function processChecklist(data: any) { }

// ❌ PROIBIDO — type assertion sem validação
const result = data as ChecklistResult

// ✅ CORRETO — tipo explícito
function processChecklist(data: ChecklistRunInput): Promise<ChecklistRunResult> { }

// ✅ CORRETO — schema validation com zod, depois tipagem derivada
const schema = z.object({ tenantId: z.string().uuid(), ... })
type Input = z.infer<typeof schema>
```

### 2.3 Nomenclatura de Tipos

```typescript
// Interfaces para objetos de domínio
interface Entity { id: string; tenantId: string; cnpj: string; ... }

// Types para unions, aliases, DTOs
type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
type CreateEntityDTO = Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>

// Enums apenas para valores constantes do domínio regulatório
enum ComplianceModule {
  PLD_FT = 'PLD_FT',
  LGPD = 'LGPD',
  ANTICORRUPCAO = 'ANTICORRUPCAO',
}

// Generics com nomes descritivos (não T, U, V)
type ApiResponse<TData> = { data: TData; meta: PaginationMeta }
type Repository<TEntity, TId = string> = { findById(id: TId): Promise<TEntity | null> }
```

---

## 3. Estrutura de Módulos (Backend)

Cada módulo de domínio segue a arquitetura em camadas:

```
modules/
└── checklists/
    ├── checklist.controller.ts   # Handlers de rota — recebe request, chama service, retorna response
    ├── checklist.service.ts      # Lógica de negócio — orquestra repositories e engines
    ├── checklist.repository.ts   # Acesso a dados — queries SQL, sem lógica de negócio
    ├── checklist.schema.ts       # Schemas Zod de validação de entrada/saída
    ├── checklist.types.ts        # Types e interfaces do domínio
    ├── checklist.events.ts       # Definição de eventos de auditoria deste módulo
    └── checklist.test.ts         # Testes unitários e de integração do módulo
```

### 3.1 Controller — Responsabilidades

```typescript
// ✅ Controller FAZ: receber, validar schema, chamar service, retornar
export const executeChecklist: RouteHandler = async (request, reply) => {
  const input = executeChecklistSchema.parse(request.body)  // valida schema
  const result = await checklistService.execute(input, request.tenant)  // delega
  
  return reply.status(200).send({ data: result })
}

// ❌ Controller NÃO FAZ: lógica de negócio, queries diretas, cálculos
```

### 3.2 Service — Responsabilidades

```typescript
// ✅ Service FAZ: lógica de negócio, orquestração, audit events
export class ChecklistService {
  async execute(input: ExecuteChecklistInput, tenant: Tenant): Promise<ChecklistRunResult> {
    // 1. Buscar dados necessários via repositories
    const checklist = await this.checklistRepo.findById(input.checklistId, tenant.id)
    if (!checklist) throw new NotFoundError('Checklist não encontrado')

    // 2. Lógica de negócio: calcular score
    const result = this.scoringEngine.calculate(input.answers, checklist.items)

    // 3. Persistir resultado
    const run = await this.checklistRepo.saveRun({ ...result, tenantId: tenant.id })

    // 4. OBRIGATÓRIO: audit event para toda ação de compliance
    await this.auditService.record({
      tenantId: tenant.id,
      actorId: input.userId,
      module: ComplianceModule.PLD_FT,
      action: 'checklist.execute',
      resourceId: run.id,
      result: 'SUCCESS',
    })

    return run
  }
}
```

### 3.3 Repository — Responsabilidades

```typescript
// ✅ Repository FAZ: queries SQL, mapeamento de dados, sem lógica de negócio
export class ChecklistRepository {
  async findById(id: string, tenantId: string): Promise<Checklist | null> {
    // O RLS do PostgreSQL garante o isolamento por tenant automaticamente
    // Mas sempre passar tenantId explicitamente como segunda camada de defesa
    const row = await this.db.query(
      `SELECT * FROM checklists WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId]
    )
    return row ?? null
  }
}

// ❌ Repository NÃO FAZ: lógica de negócio, chamadas a outros services
```

---

## 4. Convenções de Nomenclatura

### 4.1 Arquivos e Diretórios

```
# kebab-case para arquivos e diretórios
checklist-engine.ts
risk-scoring/
use-checklist-run.ts

# Exceções: componentes React → PascalCase
ChecklistCard.tsx
RiskBadge.tsx
```

### 4.2 Variáveis e Funções

```typescript
// camelCase para variáveis, funções, parâmetros
const riskScore = 75
function calculateRiskLevel(score: number): RiskLevel { }
const tenantId = request.tenant.id

// PascalCase para classes, interfaces, types, enums, componentes React
class ChecklistService { }
interface Entity { }
type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
enum ComplianceModule { }
function RiskBadge({ level }: { level: RiskLevel }) { }

// SCREAMING_SNAKE_CASE para constantes de domínio
const MAX_RISK_SCORE = 100
const AUDIT_RETENTION_YEARS = 5
const PLD_SCREENING_TIMEOUT_MS = 5000
```

### 4.3 Banco de Dados

```sql
-- snake_case para tabelas e colunas
CREATE TABLE checklist_runs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  checklist_id  UUID NOT NULL REFERENCES checklists(id),
  executed_by   UUID NOT NULL REFERENCES users(id),
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prefixos para índices e constraints
-- idx_   → índice de performance
-- uq_    → unique constraint
-- fk_    → foreign key
-- chk_   → check constraint
CREATE INDEX idx_checklist_runs_tenant_id ON checklist_runs(tenant_id);
CREATE UNIQUE INDEX uq_entities_tenant_cnpj ON entities(tenant_id, cnpj);
```

### 4.4 API Routes

```
# Recursos em kebab-case, plural
GET    /v1/checklist-runs
POST   /v1/checklist-runs
GET    /v1/checklist-runs/:id
PATCH  /v1/checklist-runs/:id

# Sub-recursos
GET    /v1/entities/:id/risk-assessments
POST   /v1/entities/:id/risk-assessments

# Ações (verbos quando REST não é suficiente)
POST   /v1/documents/:id/regenerate
POST   /v1/exports/regulators/anpd
```

---

## 5. Commit Messages — Conventional Commits

Formato: `<type>(<scope>): <description>`

### Types Válidos

| Type | Quando usar |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Documentação apenas |
| `style` | Formatação, sem mudança de lógica |
| `refactor` | Refatoração sem nova feature ou fix |
| `perf` | Melhoria de performance |
| `test` | Adicionar ou corrigir testes |
| `chore` | Manutenção: deps, config, ci |
| `security` | Correção de vulnerabilidade de segurança |
| `compliance` | Ajuste de lógica regulatória (PLD, LGPD, etc.) |

### Scopes Válidos

`auth` · `entities` · `checklists` · `risk` · `docs` · `audit` · `notifications` · `ui` · `api` · `db` · `infra` · `ci`

### Exemplos

```bash
# ✅ Correto
feat(checklists): adicionar módulo PLD-FT com scoring ponderado
fix(auth): corrigir expiração de refresh token em múltiplas sessões
security(audit): reforçar hash encadeado do audit trail
compliance(lgpd): ajustar geração de RAT para formato ANPD v2
test(risk): adicionar testes de edge case para score crítico
chore(deps): atualizar @fastify/jwt para 9.0.1

# ❌ Errado
fix things
update stuff
ajustes
wip
```

### Breaking Changes

```bash
# Usar footer BREAKING CHANGE para alterações que quebram API
feat(api)!: remover endpoint v1/risk-scores legado

BREAKING CHANGE: endpoint GET /v1/risk-scores removido.
Migrar para GET /v1/entities/:id/risk-assessments.
```

---

## 6. Pull Requests

### Template de PR (`.github/pull_request_template.md`)

```markdown
## O que esta PR faz?

Descrição clara e objetiva da mudança.

## Issue relacionada

Closes #XXX

## Tipo de mudança

- [ ] Bug fix (sem breaking change)
- [ ] Nova feature (sem breaking change)
- [ ] Breaking change
- [ ] Mudança de lógica regulatória (requer revisão do CCO)
- [ ] Mudança de schema de banco (migration incluída?)

## Checklist

- [ ] Testes adicionados/atualizados (coverage mantida ≥ 80%)
- [ ] Documentação atualizada (DEV-04, DEV-05 se necessário)
- [ ] Sem dados pessoais em logs ou comentários
- [ ] Sem secrets no código
- [ ] `pnpm lint` sem erros
- [ ] `pnpm typecheck` sem erros
- [ ] `pnpm test` passando
- [ ] Testado localmente com dados sintéticos

## Para mudanças de compliance regulatória

- [ ] Revisão do CCO solicitada
- [ ] Base legal documentada no código (comentário com artigo/lei)
- [ ] Audit event implementado para a ação

## Screenshots (se UI)

<!-- Adicionar screenshots do antes/depois -->
```

### Regras de Revisão

- PR requer **mínimo 2 aprovações** para `main` (1 deve ser Tech Lead)
- PR requer **mínimo 1 aprovação** para `staging` e `develop`
- **Auto-merge proibido** em `main` e `staging`
- Mudanças em lógica regulatória (PLD, LGPD, Anticorrupção) requerem **comentário do CCO** no PR
- PRs com mais de 400 linhas alteradas devem ser quebrados em PRs menores
- Stale PRs (> 5 dias sem atividade) são fechados automaticamente pelo bot

---

## 7. Testes

### 7.1 Estrutura e Cobertura

```
# Meta de cobertura mínima (gate do CI)
Overall:              ≥ 80%
Módulos de compliance: ≥ 90%  (checklists, risk, audit)
Autenticação:          ≥ 95%
```

### 7.2 Nomenclatura de Testes

```typescript
// Padrão: describe → contexto, it → comportamento esperado
describe('ChecklistService', () => {
  describe('execute()', () => {
    it('calcula score corretamente para checklist PLD com todas as respostas preenchidas', async () => { })
    it('lança NotFoundError quando checklist não existe no tenant', async () => { })
    it('registra audit_event após execução bem-sucedida', async () => { })
    it('lança UnauthorizedError quando usuário READONLY tenta executar', async () => { })
  })
})
```

### 7.3 Testes Unitários

```typescript
// Usar Vitest — rápido, ESM nativo, compatible com Node 20
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mockar dependências externas explicitamente
const mockAuditService = { record: vi.fn().mockResolvedValue(undefined) }
const mockRepo = { findById: vi.fn(), saveRun: vi.fn() }

// Testar APENAS a unidade em questão — sem banco real
it('calcula nível de risco como CRITICAL quando score é 0', () => {
  const result = scoringEngine.calculateLevel(0)
  expect(result).toBe('CRITICAL')
})
```

### 7.4 Testes de Integração

```typescript
// Usar banco PostgreSQL real via Testcontainers
// Cada teste tem seu próprio tenant isolado — sem contaminação entre testes
import { PostgreSqlContainer } from '@testcontainers/postgresql'

describe('ChecklistRepository (integração)', () => {
  let container: StartedPostgreSqlContainer

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16').start()
    await runMigrations(container.getConnectionUri())
  })

  afterAll(() => container.stop())

  it('aplica RLS corretamente — tenant A não vê dados do tenant B', async () => {
    const tenantA = await createTestTenant()
    const tenantB = await createTestTenant()
    await createTestEntity(tenantA.id)

    const repoB = new ChecklistRepository(getDbForTenant(tenantB.id))
    const result = await repoB.findAll()

    expect(result).toHaveLength(0)  // RLS deve bloquear
  })
})
```

### 7.5 Testes E2E — Playwright

```typescript
// Cobrir os happy paths críticos + error states principais
// Arquivo: tests/e2e/checklist-flow.spec.ts
test('fluxo completo: login → cadastrar entidade → executar checklist PLD → baixar relatório', async ({ page }) => {
  await page.goto('/login')
  await loginAs(page, 'cco@acme-fintech.dev')
  // ... steps do fluxo
  await expect(page.getByTestId('risk-badge')).toHaveText('Alto')
})
```

---

## 8. Logging

### 8.1 Regras de Log

A aplicação utiliza o `pino` de forma centralizada em `src/infra/logger.ts`.

```typescript
// ✅ O QUE LOGAR
logger.info({ tenantId, action: 'checklist.execute', checklistId }, 'Checklist executado')
logger.error({ err, tenantId, action: 'checklist.execute' }, 'Falha ao executar checklist')
logger.warn({ tenantId, userId, action: 'auth.mfa.failed', attempt: 2 }, 'Tentativa MFA falhou')

// ❌ NUNCA LOGAR — dados pessoais e sensíveis (configurado no redact do logger.ts)
// CPF, Senhas, Tokens e MFA Secrets são removidos automaticamente pelo logger.
```

### 8.2 Níveis de Log por Ambiente

| Ambiente | Nível | Formato |
|---|---|---|
| `development` | `debug`/`info` | `pino-pretty` (colorido, UTC local) |
| `production` | `info`/`warn` | `json` (otimizado para Datadog/ELK) |

### 8.3 Contexto Automático

O logger do Fastify injeta automaticamente o `requestId`. O hook `preHandler` no `server.ts` injeta o `tenantId` nos logs de requisição assim que o middleware de autenticação processa o token.

```typescript
// Todo log de request estruturado inclui:
{
  "level": 30,
  "time": 1600000000000,
  "req": {
    "method": "POST",
    "url": "/v1/entities",
    "requestId": "uuid",
    "tenantId": "uuid-do-cliente" // Injetado automaticamente
  },
  "msg": "Entidade criada"
}
```

---

## 9. Tratamento de Erros

### 9.1 Hierarquia de Erros

```typescript
// packages/types/src/errors.ts
export class ComplianceOSError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
    public readonly details?: unknown
  ) { super(message) }
}

export class ValidationError extends ComplianceOSError {
  constructor(message: string, details?: z.ZodError) {
    super('VALIDATION_ERROR', message, 400, details?.flatten())
  }
}

export class UnauthorizedError extends ComplianceOSError {
  constructor(message = 'Não autorizado') {
    super('UNAUTHORIZED', message, 401)
  }
}

export class ForbiddenError extends ComplianceOSError {
  constructor(message = 'Acesso negado') {
    super('FORBIDDEN', message, 403)
  }
}

export class NotFoundError extends ComplianceOSError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} não encontrado`, 404)
  }
}

export class ConflictError extends ComplianceOSError {
  constructor(message: string) {
    super('CONFLICT', message, 409)
  }
}
```

### 9.2 Formato de Erro na API (RFC 7807)

```json
{
  "type": "https://complianceos.com.br/errors/VALIDATION_ERROR",
  "title": "Erro de validação",
  "status": 400,
  "detail": "O campo 'cnpj' é obrigatório e deve ter 14 dígitos",
  "instance": "/v1/entities",
  "requestId": "01HQ7XK...",
  "errors": [
    { "field": "cnpj", "message": "CNPJ inválido" }
  ]
}
```

---

## 🛡️ 10. Segurança no Código

> [!IMPORTANT]
> A conformidade regulatória depende da integridade do código. Siga este checklist rigorosamente em todo Pull Request.

### Checklist de Segurança para Code Review

```
Autenticação e Autorização:
- [ ] Endpoint está protegido pelo middleware de auth?
- [ ] Verificação de role/permissão está correta para o recurso?
- [ ] tenantId está sendo validado (não veio apenas do body, mas do token)?

Dados:
- [ ] Inputs validados com Zod antes de qualquer processamento?
- [ ] Queries SQL usam parâmetros ($1, $2) — nunca concatenação de string?
- [ ] Dados pessoais não estão sendo logados?

Audit Trail:
- [ ] Toda ação que modifica estado de compliance gera audit_event?
- [ ] audit_events não são modificados ou deletados?

Gerais:
- [ ] Nenhum secret hardcoded?
- [ ] Nenhum TODO de segurança aberto?
- [ ] Dependências novas foram auditadas (pnpm audit)?
```

---

> *Grupo Guinle · Chuangxin Tecnologia · Confidencial — Uso Interno*  
> *Dúvidas: Slack `#tech-compliance` · Revisões: Tech Lead Arquiteto*
