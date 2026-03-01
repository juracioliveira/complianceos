# 📟 DEV-06 — Runbook de Operações

> [!NOTE]
> **Compliance OS · Chuangxin Tecnologia**  
> Código: `SaaS-DEV-06` · Alinhado com: **RC-02 (Incident Response Policy)**

---

## 📞 1. Contatos de Plantão

| Papel | Responsabilidade | Contato |
|---|---|---|
| **DevOps/SRE (Primário)** | Infra, deploy, incidentes P1/P2 | Slack `#ops-compliance` · WhatsApp emergência |
| **Tech Lead** | Decisões de arquitetura, rollback de prod | Slack DM · Ramal interno |
| **CTO RiverTrust** | Incidentes de segurança, infra crítica | Slack `#security-incident` |
| **Head of Product** | Comunicação com beta/clientes | Slack `#product-compliance` |
| **CCO** | Incidentes com impacto regulatório (LGPD, PLD) | `compliance@guinle.com.br` |

> **Incidentes P1 (críticos):** acionar Tech Lead + DevOps via WhatsApp se não responderem em Slack em até 15 minutos.

---

## 2. Classificação de Incidentes

| Prioridade | Critério | SLA Resposta | SLA Resolução | Escalação |
|---|---|---|---|---|
| **P1 — Crítico** | Prod indisponível · Breach de dados · RLS comprometido · Audit trail corrompido | **15 min** | **4h** | Tech Lead + CTO imediatamente |
| **P2 — Alto** | Feature crítica indisponível (checklists, scoring) · Degradação grave de performance | **1h** | **8h** | Tech Lead em 1h |
| **P3 — Médio** | Bug afetando alguns usuários · Performance degradada mas funcional | **4h** | **48h** | Tech Lead em 4h |
| **P4 — Baixo** | Bug cosmético · Melhoria · Dúvida de uso | **1 dia útil** | **Sprint atual** | Head of Product |

---

## 🚀 3. Deploy em Produção

> [!CAUTION]
> **Acesso Restrito:** Deploy em produção requer aprovação explícita do Tech Lead. Nunca realize deploy direto.

### 3.1 Pré-requisitos para Deploy

```bash
# Verificar antes de qualquer deploy em prod
checklist:
  - [ ] PR mergeado em main com 2 approvals (incluindo Tech Lead)
  - [ ] Pipeline CI 100% verde (lint, typecheck, tests, SAST, build)
  - [ ] Coverage ≥ 80% geral, ≥ 90% módulos críticos
  - [ ] Testes E2E passando em staging
  - [ ] Tech Lead aprovou o deploy via Slack #ops-compliance
  - [ ] Janela de manutenção comunicada (se > 5min de impacto)
  - [ ] Rollback plan documentado e testado em staging
  - [ ] Monitoramento Datadog aberto e ativo
```

### 3.2 Executar Deploy

```bash
# O deploy é feito pelo GitHub Actions após aprovação manual
# Navegar em: GitHub → Actions → "Deploy Production" → Run workflow

# Ou via CLI (apenas DevOps com permissão AWS):
aws ecs update-service \
  --cluster compliance-prod \
  --service compliance-api \
  --task-definition compliance-api:LATEST \
  --profile compliance-prod \
  --force-new-deployment

# Monitorar o deploy (acompanhar em tempo real)
aws ecs wait services-stable \
  --cluster compliance-prod \
  --services compliance-api \
  --profile compliance-prod
```

### 3.3 Estratégia Blue-Green + Canary

O deploy segue este fluxo automático:

```
1. Nova versão sobe no grupo "green" (30% do tráfego)
   → Monitorar por 10 minutos:
     - Error rate < 0.1%
     - P99 latência < 500ms
     - Health checks respondendo

2. Se métricas ok → promover para 100% (rollback do "blue")
   → Monitorar por 30 minutos adicionais

3. Se métricas NOK → rollback automático para "blue" (ver 3.4)
```

### 3.4 Verificar Saúde Pós-Deploy

```bash
# Health check
curl -s https://api.complianceos.com.br/health | jq .

# Verificar versão deployada
curl -s https://api.complianceos.com.br/health | jq .version

# Verificar métricas no Datadog (abrir no browser)
open "https://app.datadoghq.com/dashboard/compliance-prod"

# Logs em tempo real (últimos 5 minutos)
aws logs tail compliance-prod-api \
  --since 5m \
  --follow \
  --profile compliance-prod

# Verificar error rate (deve ser < 0.1%)
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name HTTPCode_Target_5XX_Count \
  --start-time $(date -u -d '10 minutes ago' +%Y-%m-%dT%H:%M:%SZ) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --period 60 \
  --statistics Sum \
  --profile compliance-prod
```

---

## ⏪ 4. Rollback (Reversão)

> [!WARNING]
> Use rollback apenas se: error rate > 1%, latência crítica ou P1 identificado. A reversão de banco de dados é a última instância.

### 4.1 Rollback Rápido (< 2 minutos)

```bash
# Opção 1: Rollback via AWS ECS (voltar para task definition anterior)
# Descobrir a task definition anterior
aws ecs describe-services \
  --cluster compliance-prod \
  --services compliance-api \
  --profile compliance-prod \
  --query 'services[0].taskDefinition'

# Fazer rollback para versão anterior (ex: compliance-api:142)
aws ecs update-service \
  --cluster compliance-prod \
  --service compliance-api \
  --task-definition compliance-api:142 \
  --profile compliance-prod

# Opção 2: Rollback via GitHub Actions
# GitHub → Actions → "Rollback Production" → selecionar versão alvo → Run workflow

# Verificar rollback concluído
aws ecs wait services-stable \
  --cluster compliance-prod \
  --services compliance-api \
  --profile compliance-prod

# Confirmar versão revertida
curl -s https://api.complianceos.com.br/health | jq .version
```

### 4.2 Rollback de Migration de Banco

> ⚠️ Rollback de migration é operação de alto risco. Sempre executar com Tech Lead presente.

```bash
# NUNCA em produção sem aprovação explícita do Tech Lead + CTO
# Verificar se migration tem DOWN seguro
pnpm db:migrate:status

# Executar rollback (apenas em emergência absoluta)
pnpm db:migrate:rollback --env production
# Requer: AWS_PROFILE=compliance-prod DATABASE_URL=[prod-url]

# Após rollback, verificar integridade dos dados
pnpm db:check:integrity --env production
```

---

## 5. Procedimentos de Operação Comuns

### 5.1 Escalar ECS Fargate Manualmente

```bash
# Aumentar o número de tasks (em pico de uso ou durante incidente)
aws ecs update-service \
  --cluster compliance-prod \
  --service compliance-api \
  --desired-count 6 \           # padrão é 3; máximo configurado: 10
  --profile compliance-prod

# Verificar tasks rodando
aws ecs list-tasks \
  --cluster compliance-prod \
  --service-name compliance-api \
  --profile compliance-prod
```

### 5.2 Limpar Cache Redis

```bash
# Acessar Redis via bastion host (apenas DevOps com acesso)
ssh -i ~/.ssh/compliance-bastion.pem ubuntu@bastion.compliance.guinle.internal

# Conectar no Redis
redis-cli -h compliance-prod.cache.amazonaws.com -p 6379 -a $REDIS_PASSWORD

# Limpar cache de um tenant específico (nunca FLUSHALL em prod)
SCAN 0 MATCH "tenant:uuid-do-tenant:*" COUNT 100
DEL "tenant:uuid:dashboard:summary"

# Ver uso de memória
INFO memory
```

### 5.3 Verificar Jobs na Fila (BullMQ)

```bash
# Via API interna de administração (requer role SYSTEM)
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://api.complianceos.com.br/internal/queues

# Ou via Redis diretamente
redis-cli -h ... LLEN "bull:document-generation:wait"
redis-cli -h ... LLEN "bull:document-generation:active"
redis-cli -h ... LLEN "bull:document-generation:failed"

# Reprocessar jobs falhos (apenas DevOps)
# Via BullMQ Board (UI de admin de queues — acesso restrito)
open "https://admin.compliance.guinle.internal/queues"
```

### 5.4 Forçar Renovação de Score de Risco

```bash
# Quando necessário recalcular risk assessment de entidade em prod
curl -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entityId": "uuid", "triggeredBy": "MANUAL", "reason": "Correção pós-incidente"}' \
  https://api.complianceos.com.br/internal/entities/uuid/recalculate-risk
```

### 5.5 Verificar Integridade do Audit Trail

```bash
# Script de verificação da cadeia de hashes (executar periodicamente ou após suspeita)
pnpm audit:verify-chain \
  --tenant uuid-do-tenant \
  --from 2026-01-01 \
  --to 2026-02-28 \
  --env production

# Saída esperada:
# ✅ Audit trail íntegro: 4.847 eventos verificados, nenhuma brecha detectada
# ❌ ALERTA: brecha detectada entre eventos 01HR... e 01HR... — acionar P1 imediatamente
```

---

## 6. Alertas do Datadog — Resposta

### Alertas Configurados e Ações

| Alerta | Threshold | Ação Imediata |
|---|---|---|
| `api.error_rate.critical` | Error rate > 5% por 5min | P1 — rollback imediato se pós-deploy; investigar logs |
| `api.error_rate.warning` | Error rate > 1% por 10min | P2 — investigar logs, verificar deploy recente |
| `api.p99_latency.critical` | P99 > 2s por 5min | Verificar DB slow queries, escalar ECS se necessário |
| `db.connections.critical` | > 90% do pool usado | Escalar connection pool ou ECS; verificar queries lentas |
| `db.replication.lag` | Replica lag > 30s | P2 — verificar saúde do RDS; notificar Tech Lead |
| `redis.memory.warning` | > 80% de memória | Identificar keys grandes; considerar escalar Redis |
| `queue.jobs.failed` | > 10 jobs falhos em 1h | Investigar logs da fila; reprocessar se seguro |
| `audit.chain.breach` | Brecha detectada | P1 — acionar Tech Lead + CTO + CCO imediatamente |
| `rls.bypass.attempt` | Qualquer tentativa | P1 SEGURANÇA — acionar CTO + CCO imediatamente |
| `ssl.cert.expiry` | Cert expira em ≤ 30 dias | Renovar certificado via AWS ACM |

### Acessar Logs de Incidente

```bash
# Logs de erro dos últimos 30 minutos
aws logs filter-log-events \
  --log-group-name compliance-prod-api \
  --start-time $(date -u -d '30 minutes ago' +%s000) \
  --filter-pattern "ERROR" \
  --profile compliance-prod | jq '.events[].message | fromjson'

# Buscar por requestId específico (para rastrear uma request)
aws logs filter-log-events \
  --log-group-name compliance-prod-api \
  --filter-pattern '{ $.requestId = "01HR..." }' \
  --profile compliance-prod

# Buscar erros de um tenant específico
aws logs filter-log-events \
  --log-group-name compliance-prod-api \
  --filter-pattern '{ $.tenantId = "uuid-do-tenant" && $.level = "error" }' \
  --profile compliance-prod
```

---

## 7. Resposta a Incidentes — Passo a Passo

> Baseado no RC-02 (Incident Response Policy) do Grupo Guinle.

### 7.1 Detecção (0–15 min)

```
1. Alerta recebido via Datadog, Slack ou reporte de cliente
2. DevOps/SRE classifica severidade (P1–P4) em até 5 minutos
3. Para P1/P2: abrir war room no Slack (#incident-YYYYMMDD-descricao)
4. Para P1: acionar Tech Lead + CTO via WhatsApp se não responderem em 10 min
5. Registrar hora da detecção e primeira ação no canal do incidente
```

### 7.2 Contenção (15 min – 4h para P1)

```bash
# PASSO 1: Isolar o problema — não agir sem entender
# Verificar scope: todos os tenants? Um tenant? Uma feature?
curl -s https://api.complianceos.com.br/health | jq .

# PASSO 2: Preservar evidências antes de qualquer ação
# Tirar snapshot de logs e métricas do momento do incidente
aws logs create-export-task \
  --log-group-name compliance-prod-api \
  --from $(date -u -d '2 hours ago' +%s000) \
  --to $(date -u +%s000) \
  --destination compliance-incident-logs-$(date +%Y%m%d) \
  --destination-prefix incident-$(date +%H%M) \
  --profile compliance-prod

# PASSO 3: Decidir — corrigir forward ou rollback?
# Rollback se: causa identificada no código e tem versão estável anterior
# Forward fix se: causa é de dados/config, não código

# PASSO 4: Comunicar status para Head of Product (clientes impactados?)
# Template de comunicação interna:
# "Incidente P1 detectado às [HH:MM]. Impacto: [o quê]. 
#  Status: [investigando|contendo|resolvendo]. ETA: [XX min]."
```

### 🛡️ 7.3 Protocolo de Incidente de Segurança

> [!IMPORTANT]
> Se houver suspeita de breach de dados ou comprometimento de RLS, acione imediatamente o **CTO** e o **CCO**.

1. **Isolamento:** Revogar tokens de sessão e isolar o ambiente se necessário.
2. **Preservação:** NÃO comunique ao cliente suspeito (evitar tipping-off).
3. **Notificação:** CCO avalia obrigações com a ANPD e agentes reguladores.

### 7.4 Post-Mortem (obrigatório para P1 e P2)

Template em `/docs/incident-postmortems/YYYY-MM-DD-descricao.md`:

```markdown
# Post-Mortem: [Título do Incidente]

**Data:** YYYY-MM-DD  
**Severidade:** P1/P2  
**Duração:** HH:MM de impacto  
**Autores:** [nomes]  
**Status:** Rascunho → Em revisão → Aprovado

## Resumo Executivo (≤ 5 linhas)

## Timeline

| Hora (UTC) | Evento |
|---|---|
| HH:MM | Alerta detectado no Datadog |
| HH:MM | DevOps/SRE acionado |
| HH:MM | Tech Lead notificado |
| HH:MM | Causa raiz identificada |
| HH:MM | Resolução aplicada |
| HH:MM | Incidente encerrado |

## Causa Raiz (Root Cause Analysis)

O que aconteceu, por que aconteceu, o que falhou no controle preventivo.

## Impacto

- Tenants afetados: N
- Usuários impactados: N
- Features indisponíveis: [lista]
- Dados afetados: [sim/não — se sim, acionar CCO]

## O Que Funcionou Bem

## O Que Não Funcionou

## Plano de Ação (com responsáveis e prazos)

| Ação | Responsável | Prazo | Status |
|---|---|---|---|
| [ação corretiva] | [nome] | DD/MM | Pendente |

## Aprovação

- Tech Lead: ___/___/2026
- Head of Product: ___/___/2026
- CTO (se P1 de segurança): ___/___/2026
```

---

## 8. Manutenção Preventiva — Checklist Semanal

```bash
# Executar toda segunda-feira antes das 09h
# DevOps responsável registra resultado no Slack #ops-compliance

checklist_semanal:
  - [ ] pnpm audit — verificar vulnerabilidades em deps (zero High/Critical)
  - [ ] Verificar expiração de certificados SSL (> 30 dias)
  - [ ] Verificar uso de disco do RDS (< 70%)
  - [ ] Verificar uso de memória Redis (< 70%)
  - [ ] Verificar jobs falhos na fila BullMQ (0 falhos sem retentativa)
  - [ ] Revisar alertas Datadog da semana anterior
  - [ ] Executar script de verificação de integridade do audit trail
  - [ ] Verificar backups S3 concluídos com sucesso
  - [ ] Revisar Security Hub findings AWS (zero Critical)
  - [ ] Verificar cotas de rate limiting (algum cliente próximo do limite?)
```

### Comandos de Verificação Preventiva

```bash
# Verificar saúde geral do cluster
aws ecs describe-clusters --clusters compliance-prod --profile compliance-prod | jq '.clusters[0].status'

# Verificar RDS
aws rds describe-db-instances --db-instance-identifier compliance-prod --profile compliance-prod \
  | jq '.DBInstances[0] | {status: .DBInstanceStatus, storage: .AllocatedStorage, freeStorage: .FreeStorageSpace}'

# Verificar último backup bem-sucedido
aws rds describe-db-instance-automated-backups \
  --db-instance-identifier compliance-prod \
  --profile compliance-prod \
  | jq '.DBInstanceAutomatedBackups[0].RestoreWindow'

# Auditoria de vulnerabilidades de dependências
pnpm audit --audit-level high

# Verificar certificados
aws acm list-certificates --certificate-statuses ISSUED --profile compliance-prod \
  | jq '.CertificateSummaryList[] | {domain: .DomainName, expiry: .NotAfter}'
```

---

## 9. Procedimento de Disaster Recovery

> Ativar apenas após decisão do CTO e Tech Lead. Baseado no BCP/DRP da RiverTrust.

### RTO/RPO por Plano

| Plano | RTO | RPO | Ação |
|---|---|---|---|
| Enterprise | 4h | 1h | DR automático multi-AZ + manual cross-region se necessário |
| Professional | 8h | 4h | Restore de backup RDS mais recente |
| Starter | 48h | 24h | Restore de backup diário |

### Failover Multi-AZ (automático)

O RDS Multi-AZ faz failover automático em < 2 minutos se a primary AZ falhar. Monitorar via:

```bash
aws rds describe-events \
  --source-type db-instance \
  --source-identifier compliance-prod \
  --duration 60 \
  --profile compliance-prod
```

### Restore Cross-Region (manual — caso extremo)

```bash
# 1. Identificar snapshot mais recente
aws rds describe-db-snapshots \
  --db-instance-identifier compliance-prod \
  --query 'sort_by(DBSnapshots, &SnapshotCreateTime)[-1]' \
  --profile compliance-prod

# 2. Restore em region secundária (us-west-2)
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier compliance-dr-restore \
  --db-snapshot-identifier [snapshot-id] \
  --region us-west-2 \
  --profile compliance-prod

# 3. Atualizar DNS para apontar para nova região
# 4. Notificar clientes Enterprise via e-mail + status page
```

---

## 10. Status Page e Comunicação com Clientes

```bash
# Atualizar status page (statuspage.io ou similar)
# Em incidentes P1/P2 que afetam clientes:

# Template de comunicação — SEMPRE aprovado pelo Head of Product antes de enviar:
# Assunto: [Compliance OS] Incidente em investigação — [data HH:MM UTC]
# "Identificamos uma instabilidade que pode estar afetando [feature].
#  Nossa equipe está trabalhando ativamente na resolução.
#  Próxima atualização em 30 minutos. [link status page]"

# Após resolução:
# "O incidente foi resolvido às [HH:MM UTC]. 
#  Todos os serviços estão operando normalmente.
#  Post-mortem disponível em [link] dentro de 5 dias úteis."
```

---

> *Grupo Guinle · Chuangxin Tecnologia · Confidencial — Uso Interno*  
> *Este runbook é um documento vivo — atualizar após todo incidente P1/P2*  
> *Responsável: DevOps/SRE · Revisão: Tech Lead · Aprovação: VP Chuangxin*
