# 🚀 DEV-02 — Guia de Configuração Local (Setup)

> [!NOTE]
> **Compliance OS · Chuangxin Tecnologia**  
> Código: `SaaS-DEV-02` · Status: **Elite Engineering Standard**

---

## 🏗️ Pré-requisitos do Sistema

### Software Obrigatório

| Ferramenta | Versão Mínima | Verificar |
|---|---|---|
| Node.js | 20.x LTS | `node --version` |
| pnpm | 8.x | `pnpm --version` |
| Docker Desktop | 4.x | `docker --version` |
| Git | 2.40+ | `git --version` |
| Antigravity IDE | latest | **Ambiente Oficial de Desenvolvimento** |


### 🔐 Acessos Necessários

> [!IMPORTANT]
> Solicite estes acessos ao seu Tech Lead antes de iniciar a configuração técnica.

- [ ] Acesso ao repositório GitHub `grupoguinle/compliance-os`
- [ ] SSH key adicionada ao GitHub (`~/.ssh/id_ed25519.pub`)
- [ ] Acesso ao AWS SSO (para ambientes de staging/beta)
- [ ] Convite para workspace Slack `chuangxin-dev`
- [ ] Acesso ao Figma workspace "Compliance OS" (para devs FE)
- [ ] Conta no Datadog (staging dashboard — para devs Sênior+)

---

## 🛠️ Instalação Passo a Passo

### 1. Clonar o Repositório

```bash
git clone git@github.com: grupoguinle/compliance-os.git
cd compliance-os
```

### 2. Instalar Dependências

```bash
# Instalar pnpm globalmente se ainda não tiver
npm install -g pnpm@8

# Instalar todas as dependências do monorepo
pnpm install

# Verificar se Turborepo está disponível
pnpm turbo --version
```

### 3. Configurar Variáveis de Ambiente

> [!TIP]
> O arquivo `.env.example` contém todas as variáveis necessárias com valores padrão seguros para desenvolvimento local.

```bash
# Copiar o template de variáveis
cp .env.example .env.local
```

#### Variáveis de Ambiente — `.env.local`

```bash
# ─── APP ──────────────────────────────────────────────────────────────────────
NODE_ENV=development
APP_URL=http://localhost:3000
API_URL=http://localhost:4000
APP_SECRET=dev-secret-change-in-production-minimum-32-chars   # REQUIRED: gerar com: openssl rand -hex 32

# ─── BANCO DE DADOS ───────────────────────────────────────────────────────────
DATABASE_URL=postgresql://compliance:compliance123@localhost:5432/compliance_dev
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_SSL=false                           # true em staging/prod

# ─── REDIS ────────────────────────────────────────────────────────────────────
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=                              # vazio em dev local

# ─── AUTH / JWT ───────────────────────────────────────────────────────────────
# Gerar par de chaves RSA: openssl genrsa -out private.pem 2048
#                          openssl rsa -in private.pem -pubout -out public.pem
AUTH_JWT_PRIVATE_KEY_PATH=./keys/dev-private.pem   # REQUIRED
AUTH_JWT_PUBLIC_KEY_PATH=./keys/dev-public.pem     # REQUIRED
AUTH_JWT_EXPIRES_IN=15m
AUTH_REFRESH_TOKEN_EXPIRES_IN=7d
AUTH_MFA_ISSUER="Compliance OS (DEV)"

# ─── S3 / ARMAZENAMENTO ───────────────────────────────────────────────────────
# Em dev local, usar MinIO (incluído no docker-compose)
S3_ENDPOINT=https://complian-os-minio-complianceos.qztbnm.easypanel.host
S3_REGION=us-east-1
S3_BUCKET_DOCUMENTS=compliance-docs
S3_BUCKET_AUDIT=compliance-audit
S3_ACCESS_KEY_ID=admin               # FROM UI
S3_SECRET_ACCESS_KEY=sjMZIp01gv4g        # FROM UI

# ─── EMAIL ────────────────────────────────────────────────────────────────────
# Em dev local, usar Mailhog (incluído no docker-compose — UI: localhost:8025)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM="Compliance OS <noreply@complianceos.com.br>"
SMTP_SECURE=false

# ─── INTEGRAÇÕES EXTERNAS ─────────────────────────────────────────────────────
# Receita Federal — CNPJ API (usar mock em dev)
CNPJ_API_URL=http://localhost:4000/mocks/cnpj    # mock interno dev
CNPJ_API_KEY=                                     # REQUIRED em staging/prod

# Screening de Sanções (usar mock em dev)
SANCTIONS_API_URL=http://localhost:4000/mocks/sanctions
SANCTIONS_API_KEY=                                # REQUIRED em staging/prod

# ─── OBSERVABILIDADE ──────────────────────────────────────────────────────────
LOG_LEVEL=debug                           # debug | info | warn | error
LOG_FORMAT=pretty                         # pretty (dev) | json (prod)
DATADOG_API_KEY=                          # vazio em dev local
DATADOG_SERVICE=compliance-os-dev

# ─── FEATURE FLAGS ────────────────────────────────────────────────────────────
FEATURE_SSO_SAML=false                    # Enterprise SSO (v1.0 Enterprise)
FEATURE_SANCTIONS_REALTIME=false          # Screening em tempo real
FEATURE_API_PUBLIC=false                  # API pública (v1.1)
```

### 4. Gerar Chaves RSA para JWT

> [!WARNING]
> NUNCA commite chaves privadas (.pem) no repositório. O `.gitignore` deve estar configurado.

```bash
mkdir -p keys
openssl genrsa -out keys/dev-private.pem 2048
openssl rsa -in keys/dev-private.pem -pubout -out keys/dev-public.pem
echo "keys/*.pem" >> .gitignore
```

### 5. Subir Serviços Locais com Docker

```bash
# Sobe PostgreSQL, Redis, MinIO e Mailhog
docker-compose up -d

# Verificar se todos estão healthy
docker-compose ps

# Logs de um serviço específico
docker-compose logs -f postgres
```

#### Serviços do Docker Compose Local

| Serviço | Porta | Acesso |
|---|---|---|
| PostgreSQL | `5432` | `postgresql://compliance:compliance123@localhost:5432/compliance_dev` |
| Redis | `6379` | `redis://localhost:6379` |
| MinIO (S3 local) | `9000` / `9001` | API: `:9000` · Console: `localhost:9001` (admin/admin123) |
| Mailhog (SMTP) | `1025` / `8025` | SMTP: `:1025` · UI: `localhost:8025` |
| PgAdmin (opcional) | `5050` | `localhost:5050` (admin@guinle.com / admin123) |

### 6. Configurar Banco de Dados

```bash
# Criar o banco e aplicar todas as migrations
pnpm db:migrate

# Popular com dados de desenvolvimento (tenants, users, checklists de exemplo)
pnpm db:seed

# Verificar schema no Drizzle Studio
pnpm db:studio    # Abre em localhost:4983
```

#### Usuários de Desenvolvimento (criados pelo seed)

| E-mail | Senha | Role | Tenant |
|---|---|---|---|
| `admin@acme-fintech.dev` | `Dev@12345!` | ADMIN | Acme Fintech (demo) |
| `cco@acme-fintech.dev` | `Dev@12345!` | COMPLIANCE_OFFICER | Acme Fintech |
| `analyst@acme-fintech.dev` | `Dev@12345!` | ANALYST | Acme Fintech |
| `auditor@acme-fintech.dev` | `Dev@12345!` | AUDITOR | Acme Fintech |
| `readonly@acme-fintech.dev` | `Dev@12345!` | READONLY | Acme Fintech |
| `admin@beta-corp.dev` | `Dev@12345!` | ADMIN | Beta Corp (segundo tenant) |

> **MFA em dev:** use o código `000000` (bypass de TOTP apenas em `NODE_ENV=development`)

### 7. Iniciar o Ambiente de Desenvolvimento

> [!NOTE]
> O comando abaixo utiliza o Turborepo para orquestrar o frontend e API simultaneamente.

```bash
pnpm dev
```

#### 🌐 Endpoints Locais

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **API Backend:** [http://localhost:4000](http://localhost:4000)
- **Documentação API:** [http://localhost:4000/docs](http://localhost:4000/docs)
- **Health Check:** [http://localhost:4000/health](http://localhost:4000/health)

---

## ✅ Verificação do Setup

Após seguir todos os passos, verificar:

```bash
# Todos os checks devem passar
pnpm check:setup
```

O script verifica:
- [ ] Node.js versão correta
- [ ] pnpm instalado
- [ ] Docker rodando e serviços healthy
- [ ] Banco acessível e migrations aplicadas
- [ ] Redis acessível
- [ ] MinIO acessível
- [ ] Chaves JWT geradas
- [ ] Frontend compilando
- [ ] API respondendo no `/health`
- [ ] Login funcionando com usuário seed

---

## 🆘 Troubleshooting (Solução de Problemas)

> [!CAUTION]
> Se o erro persistir após estas soluções, contacte o canal `#tech-compliance` no Slack.

### Erro: `ECONNREFUSED 127.0.0.1:5432`

O PostgreSQL local não está rodando.

```bash
docker-compose up -d postgres
docker-compose ps postgres   # verificar se está "healthy"
```

### Erro: `JWT_PRIVATE_KEY_PATH not found`

Chaves RSA não foram geradas.

```bash
mkdir -p keys
openssl genrsa -out keys/dev-private.pem 2048
openssl rsa -in keys/dev-private.pem -pubout -out keys/dev-public.pem
```

### Erro: `Cannot find module '@compliance/types'`

Workspace não foi buildado corretamente.

```bash
pnpm clean
pnpm install
pnpm build --filter=@compliance/types
pnpm build --filter=@compliance/ui
pnpm dev
```

### Erro: `RLS policy violation` em queries

Você está tentando acessar dados sem `tenant_id` definido na sessão. Toda query deve passar pelo middleware de tenant. Não usar o pool de banco diretamente — usar apenas os repositories.

```typescript
// ❌ ERRADO — bypass do RLS
const db = getDirectPool()
const rows = await db.query('SELECT * FROM entities')

// ✅ CORRETO — usa o repository que seta o tenant na sessão
const entities = await entityRepository.findAll(tenantId)
```

### Porta 3000 ou 4000 já em uso

```bash
# Identificar e matar o processo
lsof -ti:3000 | xargs kill -9
lsof -ti:4000 | xargs kill -9
```

### Reset Completo do Banco (dev apenas)

```bash
# ⚠️ DESTRÓI TODOS OS DADOS LOCAIS
pnpm db:reset
pnpm db:seed
```

---

## Setup de Staging (AWS SSO)

> Necessário apenas para devs Sênior com acesso aprovado pelo Tech Lead.

```bash
# Instalar AWS CLI v2 e configurar SSO
aws configure sso
# Profile: compliance-staging
# Region: us-east-1

# Login SSO
aws sso login --profile compliance-staging

# Verificar acesso
aws sts get-caller-identity --profile compliance-staging

# Para staging, usar as variáveis de ambiente do AWS Secrets Manager
aws secretsmanager get-secret-value \
  --secret-id compliance-os/staging/env \
  --profile compliance-staging \
  --query SecretString --output text > .env.staging
```

---

> *Dúvidas de setup: Slack `#tech-compliance` · Tech Lead ou DevOps/SRE*  
> *Grupo Guinle · Chuangxin Tecnologia · Confidencial*
