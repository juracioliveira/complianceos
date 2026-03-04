'use client'
import Link from 'next/link'
import { PublicNav, PublicFooter, pageStyle, CYAN, SURFACE, LINE, TEXT, MUTED, UI, MONO } from '@/components/public/PublicLayout'

const SERIF = "'DM Serif Display', serif"
const SURFACE2 = '#F3F4F6'
const SUCCESS = '#16A34A'
const WARNING = '#D97706'
const DANGER = '#DC2626'
const INFO = '#0284C7'
const LINE_S = 'rgba(0,0,0,0.10)'

function Tag({ method }: { method: string }) {
    const c: Record<string, string> = { GET: SUCCESS, POST: INFO, PATCH: WARNING, DELETE: DANGER }
    return <span style={{ fontFamily: MONO, fontSize: '.6rem', fontWeight: 700, padding: '.15rem .5rem', background: c[method] + '18', color: c[method], border: `1px solid ${c[method]}40` }}>{method}</span>
}
function Badge({ label, color = CYAN }: { label: string; color?: string }) {
    return <span style={{ fontFamily: MONO, fontSize: '.6rem', padding: '.12rem .45rem', background: color + '15', color, border: `1px solid ${color}28` }}>{label}</span>
}
function Code({ children }: { children: string }) {
    return <pre style={{ fontFamily: MONO, fontSize: '.775rem', lineHeight: 1.75, padding: '1.25rem 1.5rem', background: '#0F172A', color: '#E2E8F0', overflowX: 'auto', margin: '1rem 0', whiteSpace: 'pre' }}><code>{children}</code></pre>
}
function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
    return (
        <div style={{ overflowX: 'auto', margin: '1rem 0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: UI, fontSize: '.8125rem' }}>
                <thead><tr>{headers.map(h => <th key={h} style={{ textAlign: 'left', padding: '.5rem .875rem', background: SURFACE2, color: TEXT, fontWeight: 600, borderBottom: `1px solid ${LINE_S}` }}>{h}</th>)}</tr></thead>
                <tbody>{rows.map((row, i) => <tr key={i} style={{ borderBottom: `1px solid ${LINE}` }}>{row.map((cell, j) => <td key={j} style={{ padding: '.5rem .875rem', color: MUTED, verticalAlign: 'top' }}>{cell}</td>)}</tr>)}</tbody>
            </table>
        </div>
    )
}
function AlertBox({ type, children }: { type: 'info' | 'warning' | 'danger'; children: React.ReactNode }) {
    const c = { info: { color: INFO, icon: 'ℹ' }, warning: { color: WARNING, icon: '⚠' }, danger: { color: DANGER, icon: '✕' } }[type]
    return (
        <div style={{ display: 'flex', gap: '.75rem', padding: '1rem 1.25rem', background: c.color + '08', borderLeft: `3px solid ${c.color}`, margin: '1rem 0' }}>
            <span style={{ fontFamily: MONO, color: c.color, lineHeight: 1.7, flexShrink: 0 }}>{c.icon}</span>
            <div style={{ fontFamily: UI, fontSize: '.8125rem', color: MUTED, lineHeight: 1.75 }}>{children}</div>
        </div>
    )
}
function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
    return (
        <section id={id} style={{ marginBottom: '4rem', scrollMarginTop: '6rem' }}>
            <h2 style={{ fontFamily: SERIF, fontSize: '1.6rem', color: TEXT, fontWeight: 'normal', marginBottom: '1rem', paddingBottom: '.75rem', borderBottom: `2px solid ${LINE}` }}>{title}</h2>
            {children}
        </section>
    )
}
function EP({ method, path, permission, description, children }: { method: string; path: string; permission: string; description: string; children?: React.ReactNode }) {
    return (
        <div style={{ border: `1px solid ${LINE}`, marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.875rem', padding: '1rem 1.25rem', background: SURFACE, borderBottom: `1px solid ${LINE}` }}>
                <Tag method={method} />
                <code style={{ fontFamily: MONO, fontSize: '.875rem', color: TEXT, fontWeight: 600 }}>{path}</code>
            </div>
            <div style={{ padding: '1.25rem 1.5rem' }}>
                <p style={{ fontFamily: UI, fontSize: '.8125rem', color: MUTED, marginBottom: '.75rem', lineHeight: 1.7 }}>{description}</p>
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' as const, marginBottom: children ? '1rem' : 0 }}>
                    <span style={{ fontFamily: UI, fontSize: '.75rem', color: MUTED }}>Permissão:</span>
                    {permission.split(',').map(p => <Badge key={p} label={p.trim()} color={p.includes('ADMIN') ? DANGER : p.includes('AUDITOR') ? WARNING : CYAN} />)}
                </div>
                {children}
            </div>
        </div>
    )
}
function P({ children }: { children: React.ReactNode }) {
    return <p style={{ fontFamily: UI, fontSize: '.875rem', color: MUTED, lineHeight: 1.8, marginBottom: '.75rem' }}>{children}</p>
}
function H3({ children }: { children: React.ReactNode }) {
    return <h3 style={{ fontFamily: UI, fontWeight: 600, fontSize: '.9375rem', color: TEXT, marginTop: '1.5rem', marginBottom: '.625rem' }}>{children}</h3>
}

export function AuditApiClient() {
    return (
        <div style={pageStyle}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');*{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}a{color:inherit;text-decoration:none;}`}</style>
            <PublicNav />

            <section style={{ paddingTop: '8rem', paddingBottom: '3rem', borderBottom: `1px solid ${LINE}`, backgroundImage: `linear-gradient(${LINE} 1px,transparent 1px),linear-gradient(90deg,${LINE} 1px,transparent 1px)`, backgroundSize: '80px 80px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 3rem' }}>
                    <p style={{ fontFamily: MONO, fontSize: '.7rem', color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '.1em', marginBottom: '1rem' }}>
                        <Link href="/" style={{ color: MUTED }}>ComplianceOS</Link> / <Link href="/docs" style={{ color: MUTED }}>Docs</Link> / Audit Trail
                    </p>
                    <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(1.75rem,3vw,2.75rem)', color: TEXT, fontWeight: 'normal', marginBottom: '.75rem' }}>API — Audit Trail</h1>
                    <p style={{ fontFamily: UI, fontSize: '1rem', color: MUTED, maxWidth: 640, lineHeight: 1.75 }}>
                        Trilha de auditoria imutável com integridade garantida por hash chain encadeado. Retenção mínima de 5 anos conforme Art. 37 LGPD e Art. 9 Lei 9.613/98.
                    </p>
                    <div style={{ display: 'flex', gap: '.625rem', marginTop: '1.25rem', flexWrap: 'wrap' as const }}>
                        <Badge label="INSERT ONLY — UPDATE/DELETE proibidos" color={DANGER} />
                        <Badge label="Hash Chain — Integridade verificável" color={INFO} />
                        <Badge label="Retenção: 5 anos" color={WARNING} />
                    </div>
                </div>
            </section>

            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 3rem 6rem' }}>

                <Section id="seguranca" title="Garantias de Segurança">
                    <AlertBox type="danger">
                        A tabela <code style={{ fontFamily: MONO }}>audit_events</code> é protegida por dois mecanismos independentes: (1) trigger PostgreSQL que bloqueia UPDATE/DELETE a nível de banco, e (2) role de aplicação sem permissão DDL sobre a tabela. Tentativas de modificação são registradas como incidente de segurança.
                    </AlertBox>
                    <P>Todas as consultas de audit trail são elas mesmas auditadas — meta-auditoria. O sistema registra quem consultou o audit trail, quando, com quais filtros e qual o IP de origem.</P>

                    <H3>Hash Chain — Integridade Verificável</H3>
                    <P>Cada evento contém o hash SHA-256 do evento anterior do mesmo tenant (<code style={{ fontFamily: MONO, fontSize: '.85em', color: CYAN }}>prevHash</code>). Isso cria uma cadeia que permite detectar qualquer adulteração retroativa — similar a uma blockchain simplificada.</P>
                    <Code>{`// Verificação de integridade da cadeia (TypeScript)
import { createHash } from 'crypto'

function verifyAuditChain(events: AuditEvent[]): boolean {
  // events ordenados por occurred_at ASC
  for (let i = 1; i < events.length; i++) {
    const prev = events[i - 1]
    const curr = events[i]
    
    // O prevHash do evento atual deve corresponder ao payloadHash do anterior
    if (curr.prevHash !== prev.payloadHash) {
      console.error(\`Chain broken at event \${curr.eventId}\`)
      return false
    }
  }
  return true
}`}</Code>
                </Section>

                <Section id="schema" title="Schema do AuditEvent">
                    <Code>{`interface AuditEvent {
  eventId:       string              // UUID v4
  tenantId:      string
  // Contexto do ator
  actorId:       string              // user UUID ou 'SYSTEM'
  actorType:     'USER' | 'SYSTEM' | 'API'
  actorIp:       string | null       // IPv4 ou IPv6
  actorUserAgent: string | null
  // Evento
  occurredAt:    string              // ISO 8601 UTC
  module:        'PLD_FT' | 'LGPD' | 'ANTICORRUPCAO' | 'DOCS'
               | 'ENTITIES' | 'USERS' | 'AUTH' | 'ADMIN' | 'SYSTEM'
  action:        string              // ex: 'checklist.execute', 'entity.risk.escalated'
  resourceType:  string | null       // ex: 'checklist_run', 'entity', 'document'
  resourceId:    string | null       // UUID do recurso afetado
  // Resultado
  result:        'SUCCESS' | 'FAILURE' | 'PARTIAL'
  errorCode:     string | null       // apenas quando FAILURE
  // Integridade
  payloadHash:   string              // SHA-256 do payload atual
  prevHash:      string | null       // SHA-256 do evento anterior (encadeamento)
  // Dados do evento (sem dados pessoais — apenas IDs e metadados)
  metadata:      Record<string, unknown>
}`}</Code>

                    <H3>Catálogo de Actions por Módulo</H3>
                    <DataTable
                        headers={['Módulo', 'Action', 'Quando ocorre']}
                        rows={[
                            ['PLD_FT', 'checklist.execute', 'Execução de checklist PLD iniciada'],
                            ['PLD_FT', 'checklist.complete', 'Checklist PLD finalizado com score'],
                            ['ENTITIES', 'entity.create', 'Nova entidade cadastrada'],
                            ['ENTITIES', 'entity.risk.escalated', 'Nível de risco subiu'],
                            ['ENTITIES', 'entity.screen', 'Screening de sanções disparado'],
                            ['ENTITIES', 'entity.sanctions.hit', 'Entidade encontrada em lista de sanções'],
                            ['DOCS', 'document.generate', 'Geração de documento solicitada'],
                            ['DOCS', 'document.download', 'Download de documento realizado'],
                            ['USERS', 'user.invite', 'Convite enviado para novo usuário'],
                            ['USERS', 'user.role.change', 'Role de usuário alterada'],
                            ['AUTH', 'auth.login', 'Login realizado'],
                            ['AUTH', 'auth.login.failed', 'Tentativa de login falhou'],
                            ['AUTH', 'auth.mfa.challenge', 'MFA solicitado'],
                        ]}
                    />
                </Section>

                <Section id="endpoints" title="Endpoints">
                    <EP method="GET" path="/v1/audit/events" permission="AUDITOR, ADMIN" description="Consulta eventos do audit trail com filtros de período, módulo, ação, ator e resultado. Paginação por cursor para grandes volumes.">
                        <DataTable
                            headers={['Parâmetro', 'Tipo', 'Descrição']}
                            rows={[
                                ['from', 'string (ISO 8601)', 'Data/hora inicial (obrigatório)'],
                                ['to', 'string (ISO 8601)', 'Data/hora final (padrão: agora)'],
                                ['module', 'string', 'PLD_FT | LGPD | ANTICORRUPCAO | ENTITIES | AUTH | ...'],
                                ['action', 'string', 'Filtro exato da action. Ex: checklist.complete'],
                                ['actor_id', 'string (UUID)', 'Filtrar por usuário específico'],
                                ['resource_id', 'string (UUID)', 'Filtrar por recurso específico (ex: ID de entidade)'],
                                ['result', 'string', 'SUCCESS | FAILURE | PARTIAL'],
                                ['limit', 'integer', 'Itens por página (1–500, default 50)'],
                                ['cursor', 'string', 'Cursor de paginação'],
                            ]}
                        />
                        <AlertBox type="warning">
                            O parâmetro <code style={{ fontFamily: MONO }}>from</code> é obrigatório. A janela máxima por consulta é de <strong>90 dias</strong>. Para exportações maiores, use o endpoint <code style={{ fontFamily: MONO }}>POST /v1/exports/regulators</code>.
                        </AlertBox>
                        <Code>{`// GET /v1/audit/events?from=2026-01-01T00:00:00Z&module=PLD_FT&limit=50
{
  "data": [{
    "eventId": "01HR...",
    "occurredAt": "2026-03-03T22:10:00Z",
    "actorType": "USER",
    "actorId": "uuid-do-usuario",
    "module": "PLD_FT",
    "action": "checklist.complete",
    "resourceType": "checklist_run",
    "resourceId": "01HR...",
    "result": "SUCCESS",
    "payloadHash": "sha256:a1b2c3d4...",
    "prevHash": "sha256:z9y8x7w6...",
    "metadata": {
      "checklistId": "b62707ee-...",
      "entityId": "01HQ...",
      "scoreChange": { "value": 62, "riskLevel": "MEDIUM" },
      "riskChanged": true,
      "previousRiskLevel": "HIGH"
    }
  }],
  "meta": {
    "total": 142,
    "limit": 50,
    "hasMore": true,
    "nextCursor": "01HR...",
    "integrityStatus": "VERIFIED"    // resultado da verificação do hash chain
  }
}`}</Code>
                    </EP>

                    <EP method="GET" path="/v1/audit/events/:eventId" permission="AUDITOR, ADMIN" description="Retorna um evento específico com todos os campos, incluindo o payload completo original e verificação de integridade do hash.">
                        <Code>{`// Response 200
{
  "data": {
    "eventId": "01HR...",
    // ... todos os campos do AuditEvent
    "integrity": {
      "hashVerified": true,
      "prevEventId": "01HQ...",
      "chainPosition": 1247
    }
  }
}`}</Code>
                    </EP>

                    <EP method="POST" path="/v1/exports/regulators" permission="COMPLIANCE_OFFICER, ADMIN" description="Gera exportação formatada do audit trail para entrega a reguladores. Suporta múltiplos formatos e templates pré-formatados por agência.">
                        <H3>Request Body</H3>
                        <DataTable
                            headers={['Campo', 'Tipo', 'Obrigatório', 'Descrição']}
                            rows={[
                                ['regulator', 'string', '✓', 'ANPD | BACEN | CGU | COAF | CUSTOM'],
                                ['from', 'string', '✓', 'Data inicial (ISO 8601)'],
                                ['to', 'string', '✓', 'Data final (ISO 8601)'],
                                ['format', 'string', '—', 'PDF | XLSX | JSON (default: PDF)'],
                                ['modules', 'string[]', '—', 'Filtrar módulos. Default: todos'],
                                ['includeMetadata', 'boolean', '—', 'Incluir metadados completos. Default: false'],
                            ]}
                        />
                        <Code>{`// Request
{
  "regulator": "BACEN",
  "from": "2026-01-01T00:00:00Z",
  "to": "2026-03-31T23:59:59Z",
  "format": "XLSX",
  "modules": ["PLD_FT"]
}

// Response 202 — exportação gerada assincronamente
{
  "data": {
    "exportId": "exp_01HR...",
    "status": "GENERATING",
    "estimatedSeconds": 60
  },
  "meta": {
    "pollUrl": "/v1/exports/exp_01HR...",
    "webhookEvent": "export.ready"
  }
}`}</Code>
                    </EP>

                    <EP method="GET" path="/v1/audit/chain/verify" permission="ADMIN" description="Verifica a integridade completa do hash chain do tenant para um período. Operação pesada — executar fora do horário de pico.">
                        <Code>{`// GET /v1/audit/chain/verify?from=2026-01-01T00:00:00Z
{
  "data": {
    "verified": true,
    "eventsChecked": 3847,
    "brokenLinks": [],
    "firstEventId": "01HK...",
    "lastEventId": "01HR...",
    "verifiedAt": "2026-03-03T22:10:00Z",
    "durationMs": 1243
  }
}`}</Code>
                    </EP>
                </Section>

                <Section id="retencao" title="Retenção e Compliance">
                    <DataTable
                        headers={['Categoria', 'Prazo de Retenção', 'Storage', 'Base Legal']}
                        rows={[
                            ['audit_events', '5 anos (mínimo)', 'S3 Object Lock — Compliance Mode (WORM)', 'Art. 37 LGPD + Art. 9 Lei 9.613/98'],
                            ['checklist_runs', '5 anos', 'PostgreSQL + S3 backup', 'Lei 12.846/13 (Anticorrupção)'],
                            ['Documentos PDF', '5 anos → Glacier', 'S3 Standard → Glacier após 1 ano', 'Resolução BACEN 4.753/2019'],
                            ['Logs de aplicação', '1 ano', 'CloudWatch → S3 Cold', 'Política interna'],
                        ]}
                    />
                </Section>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '2.5rem', borderTop: `1px solid ${LINE}` }}>
                    <Link href="/docs/api/checklists" style={{ fontFamily: UI, fontSize: '.875rem', color: CYAN }}>← API de Checklists</Link>
                    <Link href="/docs" style={{ fontFamily: UI, fontSize: '.875rem', color: CYAN }}>Voltar para Docs →</Link>
                </div>
            </div>
            <PublicFooter />
        </div>
    )
}
