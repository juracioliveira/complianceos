'use client'
import Link from 'next/link'
import { PublicNav, PublicFooter } from '@/components/public/PublicLayout'

function Tag({ method }: { method: string }) {
    const c: Record<string, string> = { GET: 'text-green-600 bg-green-50 border-green-200', POST: 'text-sky-600 bg-sky-50 border-sky-200', PATCH: 'text-amber-600 bg-amber-50 border-amber-200', DELETE: 'text-red-600 bg-red-50 border-red-200' }
    return <span className={`font-mono text-[0.6rem] font-bold px-2 py-0.5 border rounded tracking-wide ${c[method]}`}>{method}</span>
}
function Badge({ label, type = 'brand' }: { label: string; type?: 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'muted' }) {
    const styles = {
        brand: 'bg-brand-50 text-brand-600 border-brand-200',
        success: 'bg-green-50 text-green-600 border-green-200',
        warning: 'bg-amber-50 text-amber-600 border-amber-200',
        danger: 'bg-red-50 text-red-600 border-red-200',
        info: 'bg-sky-50 text-sky-600 border-sky-200',
        muted: 'bg-slate-100 text-slate-500 border-slate-200',
    }
    return <span className={`font-mono text-[0.6rem] px-2 py-0.5 border rounded ${styles[type]}`}>{label}</span>
}
function Code({ children }: { children: string }) {
    return <pre className="font-mono text-[0.775rem] leading-relaxed p-5 bg-slate-900 text-slate-200 overflow-x-auto my-4 whitespace-pre rounded-lg"><code>{children}</code></pre>
}
function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
    return (
        <div className="overflow-x-auto my-4 border border-slate-200 rounded-lg">
            <table className="w-full border-collapse text-[0.8125rem] text-left">
                <thead><tr className="bg-slate-100 border-b border-slate-200">{headers.map(h => <th key={h} className="p-3 font-semibold text-slate-900 whitespace-nowrap">{h}</th>)}</tr></thead>
                <tbody>{rows.map((row, i) => <tr key={i} className="border-b border-slate-200 last:border-0 bg-white">{row.map((cell, j) => <td key={j} className="p-3 text-slate-600 align-top">{cell}</td>)}</tr>)}</tbody>
            </table>
        </div>
    )
}
function AlertBox({ type, children }: { type: 'info' | 'warning' | 'danger'; children: React.ReactNode }) {
    const cfg = {
        info: { styles: 'bg-sky-50 border-sky-500 text-sky-600', icon: 'ℹ', text: 'text-slate-700' },
        warning: { styles: 'bg-amber-50 border-amber-500 text-amber-600', icon: '⚠', text: 'text-slate-700' },
        danger: { styles: 'bg-red-50 border-red-500 text-red-600', icon: '✕', text: 'text-slate-700' },
    }[type]
    return (
        <div className={`flex gap-3 p-4 my-4 border-l-4 rounded-r-lg ${cfg.styles}`}>
            <span className="font-mono text-[0.9rem] leading-relaxed shrink-0">{cfg.icon}</span>
            <div className={`text-[0.8125rem] leading-relaxed ${cfg.text}`}>{children}</div>
        </div>
    )
}
function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
    return (
        <section id={id} className="mb-16 scroll-mt-24">
            <h2 className="font-serif text-[1.6rem] text-slate-900 mb-4 pb-3 border-b-2 border-slate-200">{title}</h2>
            {children}
        </section>
    )
}
function EP({ method, path, permission, description, children }: { method: string; path: string; permission: string; description: string; children?: React.ReactNode }) {
    return (
        <div className="border border-slate-200 rounded-lg mb-10 overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 p-4 bg-slate-50 border-b border-slate-200">
                <Tag method={method} />
                <code className="font-mono text-[0.875rem] text-slate-900 font-semibold">{path}</code>
            </div>
            <div className="p-6 bg-white">
                <p className="text-[0.8125rem] text-slate-600 mb-2 leading-relaxed">{description}</p>
                <div className={`flex gap-2 flex-wrap items-center ${children ? 'mb-4' : ''}`}>
                    <span className="text-[0.75rem] text-slate-500 font-medium tracking-wide">Permissão:</span>
                    {permission.split(',').map(p => <Badge key={p} label={p.trim()} type={p.includes('ADMIN') ? 'danger' : p.includes('AUDITOR') ? 'warning' : 'brand'} />)}
                </div>
                {children}
            </div>
        </div>
    )
}
function P({ children }: { children: React.ReactNode }) {
    return <p className="text-[0.875rem] text-slate-600 leading-relaxed mb-3">{children}</p>
}
function H3({ children }: { children: React.ReactNode }) {
    return <h3 className="font-semibold text-[0.9375rem] text-slate-900 mt-6 mb-2.5">{children}</h3>
}

export function AuditApiClient() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
            <PublicNav />

            <section className="pt-32 pb-12 border-b border-slate-200" style={{ backgroundImage: `linear-gradient(#e2e8f0 1px,transparent 1px),linear-gradient(90deg,#e2e8f0 1px,transparent 1px)`, backgroundSize: '80px 80px' }}>
                <div className="max-w-[1100px] mx-auto px-6 md:px-12">
                    <p className="font-mono text-[0.7rem] text-slate-500 uppercase tracking-widest mb-4">
                        <Link href="/" className="hover:text-brand-600 transition-colors">ComplianceOS</Link> / <Link href="/docs" className="hover:text-brand-600 transition-colors">Docs</Link> / Audit Trail
                    </p>
                    <h1 className="font-serif text-[clamp(1.75rem,3vw,2.75rem)] text-slate-900 mb-3">API — Audit Trail</h1>
                    <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
                        Trilha de auditoria imutável com integridade garantida por hash chain encadeado. Retenção mínima de 5 anos conforme Art. 37 LGPD e Art. 9 Lei 9.613/98.
                    </p>
                    <div className="flex gap-2.5 mt-5 flex-wrap">
                        <Badge label="INSERT ONLY — UPDATE/DELETE proibidos" type="danger" />
                        <Badge label="Hash Chain — Integridade verificável" type="info" />
                        <Badge label="Retenção: 5 anos" type="warning" />
                    </div>
                </div>
            </section>

            <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-16">

                <Section id="seguranca" title="Garantias de Segurança">
                    <AlertBox type="danger">
                        A tabela <code className="font-mono text-slate-700 bg-white/50 px-1 py-0.5 rounded">audit_events</code> é protegida por dois mecanismos independentes: (1) trigger PostgreSQL que bloqueia UPDATE/DELETE a nível de banco, e (2) role de aplicação sem permissão DDL sobre a tabela. Tentativas de modificação são registradas como incidente de segurança.
                    </AlertBox>
                    <P>Todas as consultas de audit trail são elas mesmas auditadas — meta-auditoria. O sistema registra quem consultou o audit trail, quando, com quais filtros e qual o IP de origem.</P>

                    <H3>Hash Chain — Integridade Verificável</H3>
                    <P>Cada evento contém o hash SHA-256 do evento anterior do mesmo tenant (<code className="font-mono text-[0.85em] text-brand-600 bg-brand-50 px-1 py-0.5 rounded">prevHash</code>). Isso cria uma cadeia que permite detectar qualquer adulteração retroativa — similar a uma blockchain simplificada.</P>
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
                            O parâmetro <code className="font-mono text-slate-700 bg-white/50 px-1 py-0.5 rounded">from</code> é obrigatório. A janela máxima por consulta é de <strong>90 dias</strong>. Para exportações maiores, use o endpoint <code className="font-mono text-slate-700 bg-white/50 px-1 py-0.5 rounded">POST /v1/exports/regulators</code>.
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

                <div className="flex justify-between pt-10 border-t border-slate-200">
                    <Link href="/docs/api/checklists" className="font-medium text-[0.875rem] text-brand-600 hover:text-brand-700 flex items-center gap-1.5 transition-colors">← API de Checklists</Link>
                    <Link href="/docs" className="font-medium text-[0.875rem] text-brand-600 hover:text-brand-700 flex items-center gap-1.5 transition-colors">Voltar para Docs →</Link>
                </div>
            </div>
            <PublicFooter />
        </div>
    )
}
