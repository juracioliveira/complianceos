# 🚀 Compliance OS — SaaS Compliance & Governança

> [!NOTE]
> **Grupo Guinle · Chuangxin Tecnologia da Informação Ltda**  
> Código: `SaaS-DEV-01` · Versão: `1.0.0` · Classificação: **Confidencial — IP Chuangxin**

---

## 🏛️ Visão Geral

Plataforma SaaS de **Compliance & Governança** desenvolvida pela Chuangxin para automatizar conformidade regulatória brasileira em PMEs e fintechs. Cobre os três pilares regulatórios:

| Módulo | Regulação Principal | Órgão Supervisor |
|---|---|---|
| **PLD-FT** | Lei 9.613/98 + Res. BACEN 4.753 | COAF / BACEN |
| **LGPD** | Lei 13.709/18 | ANPD |
| **Anticorrupção** | Lei 12.846/13 + Decreto 11.129/22 | CGU / MPF |

---

## Stack Tecnológico

```
Frontend   → Next.js 14 (App Router) · TypeScript 5.3 · shadcn/ui · Tailwind CSS 3.4
Backend    → Node.js 20 LTS · Fastify 4 · TypeScript 5.3
Banco      → PostgreSQL 16 (RLS multi-tenant) · Redis 7.2 (cache/sessions)
Queue      → BullMQ 5 (jobs assíncronos)
Auth       → Auth.js v5 · TOTP MFA · JWT RS256
Docs       → Puppeteer 22 · React-PDF (geração de documentos regulatórios)
Infra      → AWS ECS Fargate · RDS Multi-AZ · S3 · CloudFront · WAF
IaC        → Terraform 1.7 · GitHub Actions
APM        → Datadog Agent 7 · AWS CloudWatch
```

---

## Estrutura do Monorepo

```
compliance-os/
├── apps/
│   ├── web/                  # Next.js 14 — frontend
│   │   ├── app/              # App Router (layouts, pages, loading, error)
│   │   ├── components/       # Componentes React reutilizáveis
│   │   ├── lib/              # Utilitários, hooks, types
│   │   └── styles/           # Globals, Tailwind config
│   └── api/                  # Fastify — backend API
│       ├── src/
│       │   ├── modules/      # Domínios: auth, entities, checklists, risk, docs, audit
│       │   ├── infra/        # DB, Redis, Queue, S3, Email
│       │   ├── middlewares/  # Auth, tenant, rate-limit, logging
│       │   └── shared/       # Types, constants, errors, utils
│       └── tests/            # Unit + integration tests
├── packages/
│   ├── ui/                   # Design System components (shadcn/ui + customizações Guinle)
│   ├── types/                # Tipos TypeScript compartilhados
│   ├── checklist-engine/     # Engine de checklists regulatórios
│   └── scoring-engine/       # Motor de score de risco
├── infra/
│   ├── terraform/            # IaC — todos os recursos AWS
│   └── docker/               # Dockerfiles por serviço
├── docs/                     # Documentação técnica (este diretório)
│   ├── DEV-01_README.md      # Este arquivo
│   ├── DEV-02_SETUP.md       # Guia de setup local
│   ├── DEV-03_CONVENTIONS.md # Convenções de código
│   ├── DEV-04_DATABASE.md    # Schema, migrations, RLS
│   ├── DEV-05_API.md         # Contratos de API
│   └── DEV-06_RUNBOOK.md     # Operações e incidentes
├── .github/
│   └── workflows/            # CI/CD pipelines
├── package.json              # Workspace root (pnpm workspaces)
├── turbo.json                # Turborepo config
└── docker-compose.yml        # Ambiente local completo
```

---

## Quick Start

```bash
# Pré-requisitos: Node.js 20+, pnpm 8+, Docker Desktop
git clone git@github.com:chuangxin/compliance-os.git
cd compliance-os
cp .env.example .env.local    # preencher variáveis (ver DEV-02_SETUP.md)
pnpm install
docker-compose up -d          # PostgreSQL + Redis locais
pnpm db:migrate               # Aplicar migrations
pnpm db:seed                  # Dados de desenvolvimento
pnpm dev                      # Inicia web (:3000) e api (:4000)
```

> Para setup completo com detalhes de cada variável de ambiente, ver **[DEV-02_SETUP.md](DEV-02_SETUP.md)**.

---

## Comandos do Workspace

```bash
# Desenvolvimento
pnpm dev                      # Todos os apps em paralelo (Turborepo)
pnpm dev --filter=web         # Só o frontend
pnpm dev --filter=api         # Só o backend

# Qualidade
pnpm lint                     # ESLint em todos os packages
pnpm typecheck                # tsc --noEmit em todos os packages
pnpm test                     # Vitest unit tests
pnpm test:integration         # Testes de integração (requer Docker)
pnpm test:e2e                 # Playwright end-to-end
pnpm test:coverage            # Coverage report (meta: ≥ 80%)

# Banco de dados
pnpm db:migrate               # Aplicar migrations pendentes
pnpm db:migrate:create NAME   # Criar nova migration
pnpm db:seed                  # Popular com dados de desenvolvimento
pnpm db:reset                 # Reset completo (APENAS dev/staging)
pnpm db:studio                # Drizzle Studio (UI do banco)

# Build e Deploy
pnpm build                    # Build de produção
pnpm build --filter=web       # Build só do frontend
docker-compose -f docker-compose.prod.yml build   # Build das imagens Docker

# Utilitários
pnpm format                   # Prettier em todos os arquivos
pnpm clean                    # Limpar node_modules e cache
pnpm audit                    # Auditoria de dependências npm
```

---

## Branches e Gitflow

```
main          → produção (protegido — PR obrigatório + 2 approvals)
staging       → ambiente de homologação (PR obrigatório + 1 approval)
develop       → integração contínua dos devs
feature/xxx   → features individuais (branch de develop)
fix/xxx       → correções de bugs
hotfix/xxx    → correções urgentes em produção (branch de main)
release/x.y.z → release candidates
```

**Regras:**
- Nenhum push direto para `main` ou `staging`
- PRs devem ter: descrição, issue linkada, testes passando, coverage ok
- Commit messages: padrão Conventional Commits (ver DEV-03)
- Squash merge para `main`; merge commit para `develop`

---

## Ambientes

| Ambiente | URL | Branch | Deploy |
|---|---|---|---|
| Local | `localhost:3000` | qualquer | manual |
| Dev | `dev.compliance.guinle.internal` | `develop` | automático |
| Staging | `staging.compliance.guinle.com.br` | `staging` | automático |
| Beta | `beta.complianceos.com.br` | `release/*` | manual (aprovação Tech Lead) |
| Produção | `app.complianceos.com.br` | `main` | manual (aprovação Tech Lead) |

---

## 🛡️ Segurança — Regras Invioláveis

> [!CAUTION]
> Estas regras derivam das políticas REG-03 (Classificação de Dados) e da Arquitetura Técnica SaaS-TD-01 do Grupo Guinle. O não cumprimento pode resultar em incidentes críticos.

- ❌ **NUNCA** commitar secrets, API keys, senhas ou certificados no repositório.
- ❌ **NUNCA** usar dados reais de clientes em ambiente de desenvolvimento.
- ❌ **NUNCA** desabilitar o middleware de autenticação ou RLS.
- ❌ **NUNCA** fazer UPDATE ou DELETE direto na tabela `audit_events`.
- ❌ **NUNCA** logar dados pessoais (CPF, nome, e-mail) em logs de aplicação.
- ✅ Usar **AWS Secrets Manager** para todas as credenciais de produção.
- ✅ Reportar vulnerabilidades ao Tech Lead em até **2 horas**.
- ✅ Toda alteração no schema do banco deve ter migration reversível.

---

## Contatos do Time

| Papel | Responsabilidade | Canal |
|---|---|---|
| Tech Lead Arquiteto | Decisões de arquitetura, code review final, deploy prod | Slack `#tech-compliance` |
| Head of Product | Priorização, dúvidas de requisito, aceitação de features | Slack `#product-compliance` |
| DevOps/SRE | Infra, CI/CD, incidentes de produção | Slack `#ops-compliance` (24x7) |
| CCO / Compliance Advisor | Dúvidas regulatórias (PLD, LGPD, Anticorrupção) | Email `compliance@guinle.com.br` |
| CTO RiverTrust | Incidentes de segurança, aprovação de infra crítica | Slack `#security-incident` |

---

## Documentação Técnica Completa

| Documento | Conteúdo |
|---|---|
| [DEV-02_SETUP.md](DEV-02_SETUP.md) | Setup local detalhado, variáveis de ambiente, troubleshooting |
| [DEV-03_CONVENTIONS.md](DEV-03_CONVENTIONS.md) | Convenções de código, commits, PR, testes, nomenclatura |
| [DEV-04_DATABASE.md](DEV-04_DATABASE.md) | Schema completo, RLS, migrations, índices, queries críticas |
| [DEV-05_API.md](DEV-05_API.md) | Contratos de API, autenticação, erros, rate limits, exemplos |
| [DEV-06_RUNBOOK.md](DEV-06_RUNBOOK.md) | Deploy, rollback, alertas, resposta a incidentes |

---

## Referências Regulatórias

- Lei 9.613/98 — Prevenção à Lavagem de Dinheiro
- Resolução BACEN 4.753/2019 — KYC/KYB para instituições financeiras
- Lei 13.709/18 — LGPD — Lei Geral de Proteção de Dados
- ANPD Resolução CD/ANPD 02/2022 — Registro de operações de tratamento
- Lei 12.846/13 — Lei Anticorrupção
- Decreto 11.129/2022 — Programa de Integridade
- Normas Internas Grupo Guinle: REG-01, REG-03, OPS-01, SaaS-TD-01/02/03

---

> *Grupo Guinle · Chuangxin Tecnologia da Informação Ltda · Confidencial — Uso Interno*  
> *Qualquer dúvida sobre este repositório: Tech Lead via Slack `#tech-compliance`*
