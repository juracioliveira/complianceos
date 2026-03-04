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
    const c: Record<string, string> = { GET: SUCCESS, POST: INFO, PATCH: WARNING, DELETE: DANGER, PUT: WARNING }
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
                <thead><tr>{headers.map(h => <th key={h} style={{ textAlign: 'left', padding: '.5rem .875rem', background: SURFACE2, color: TEXT, fontWeight: 600, borderBottom: `1px solid ${LINE_S}`, whiteSpace: 'nowrap' }}>{h}</th>)}</tr></thead>
                <tbody>{rows.map((row, i) => <tr key={i} style={{ borderBottom: `1px solid ${LINE}` }}>{row.map((cell, j) => <td key={j} style={{ padding: '.5rem .875rem', color: MUTED, verticalAlign: 'top' }}>{cell}</td>)}</tr>)}</tbody>
            </table>
        </div>
    )
}
function AlertBox({ type, children }: { type: 'info' | 'warning' | 'danger'; children: React.ReactNode }) {
    const c = { info: { color: INFO, icon: 'ℹ', label: '' }, warning: { color: WARNING, icon: '⚠', label: '' }, danger: { color: DANGER, icon: '✕', label: '' } }[type]
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
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' as const, marginBottom: '1rem' }}>
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

export function ChecklistsApiClient() {
    return (
        <div style={pageStyle}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');*{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}a{color:inherit;text-decoration:none;}`}</style>
            <PublicNav />

            <section style={{ paddingTop: '8rem', paddingBottom: '3rem', borderBottom: `1px solid ${LINE}`, backgroundImage: `linear-gradient(${LINE} 1px,transparent 1px),linear-gradient(90deg,${LINE} 1px,transparent 1px)`, backgroundSize: '80px 80px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 3rem' }}>
                    <p style={{ fontFamily: MONO, fontSize: '.7rem', color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '.1em', marginBottom: '1rem' }}>
                        <Link href="/" style={{ color: MUTED }}>ComplianceOS</Link> / <Link href="/docs" style={{ color: MUTED }}>Docs</Link> / Checklists
                    </p>
                    <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(1.75rem,3vw,2.75rem)', color: TEXT, fontWeight: 'normal', marginBottom: '.75rem' }}>API — Checklists</h1>
                    <p style={{ fontFamily: UI, fontSize: '1rem', color: MUTED, maxWidth: 600, lineHeight: 1.75 }}>Gerencie templates de due diligence e execuções de checklists regulatórios. Execuções finalizadas são imutáveis por garantia regulatória.</p>
                    <div style={{ display: 'flex', gap: '.625rem', marginTop: '1.25rem', flexWrap: 'wrap' as const }}>
                        <Badge label="POST /v1/checklist-runs" color={INFO} />
                        <Badge label="POST /v1/checklists/run" color={INFO} />
                        <Badge label="Imutável após COMPLETED" color={DANGER} />
                    </div>
                </div>
            </section>

            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 3rem 6rem' }}>

                {/* CHECKLIST ITEM SCHEMA */}
                <Section id="schema-item" title="Schema — ChecklistItem">
                    <P>Cada item de um checklist template é armazenado como JSONB com o seguinte schema:</P>
                    <Code>{`interface ChecklistItem {
  id:              string              // ex: "item_001"
  order:           number              // ordem de exibição
  question:        string              // texto da pergunta
  category:        string              // ex: "POLITICAS", "CONTROLES", "TREINAMENTO"
  regulationRef:   string              // ex: "Art. 9, Lei 9.613/98"
  answerType:      'BOOLEAN'           // Sim/Não
               | 'SCALE'              // Escala 0-3 (Não implementado / Parcialmente / Implementado / Totalmente)
               | 'TEXT'               // Texto livre
               | 'MULTIPLE_CHOICE'    // Opções discretas
  options?:        string[]            // para MULTIPLE_CHOICE
  weight:          number              // peso na composição do score (soma total = 100)
  evidenceRequired: boolean            // exige upload de documento como evidência
  helpText?:       string              // orientação para o analista
}`}</Code>

                    <H3>Tipos de Resposta por answerType</H3>
                    <DataTable
                        headers={['answerType', 'Valor da Resposta', 'Contribuição ao Score', 'Exemplo']}
                        rows={[
                            ['BOOLEAN', 'true | false', 'true = peso total, false = 0', '"A empresa possui política PLD/FT?"'],
                            ['SCALE', '0 | 1 | 2 | 3', 'Proporcional: 0=0%, 1=33%, 2=66%, 3=100%', '"Nível de implementação dos controles (0-3)"'],
                            ['TEXT', 'string', '0 — apenas evidencial', '"Descreva o processo de revisão periódica"'],
                            ['MULTIPLE_CHOICE', 'string (uma opção)', 'Pela opção selecionada', '"Frequência: Mensal / Trimestral / Semestral / Anual"'],
                        ]}
                    />
                </Section>

                {/* RUN SCHEMA */}
                <Section id="schema-run" title="Schema — ChecklistRun">
                    <Code>{`interface ChecklistRun {
  id:            string
  tenantId:      string
  checklistId:   string
  checklistTitle: string             // desnormalizado para leitura rápida
  entityId:      string
  entityName:    string              // desnormalizado
  executedBy:    string              // user UUID
  // Respostas — array de objetos Answer
  answers: Array<{
    itemId:      string              // referência ao ChecklistItem.id
    answer:      boolean | number | string
    note?:       string              // observação livre do analista
    evidenceKey?: string             // chave S3 do arquivo de evidência
    answeredAt:  string              // ISO 8601
  }>
  // Resultado
  score:         number | null       // 0-100 — calculado ao COMPLETE
  riskLevel:     'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null
  // Status
  status:        'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  startedAt:     string
  completedAt:   string | null
  summaryNotes:  string | null       // observações finais do analista
  evidenceKeys:  string[]            // todos os arquivos de evidência
  durationSecs:  number | null
  createdAt:     string
  updatedAt:     string
}`}</Code>
                </Section>

                {/* ENDPOINTS */}
                <Section id="endpoints" title="Endpoints">

                    <EP method="GET" path="/v1/checklists" permission="ANALYST, COMPLIANCE_OFFICER, ADMIN, AUDITOR, READONLY" description="Lista templates de checklists disponíveis para o tenant, incluindo os templates do sistema (tenant_id = null).">
                        <DataTable
                            headers={['Parâmetro', 'Tipo', 'Descrição']}
                            rows={[
                                ['module', 'string', 'PLD_FT | LGPD | ANTICORRUPCAO'],
                                ['status', 'string', 'DRAFT | ACTIVE | DEPRECATED (default: ACTIVE)'],
                                ['applies_to', 'string', 'CLIENTE | FORNECEDOR | PARCEIRO | COLABORADOR'],
                            ]}
                        />
                        <Code>{`// GET /v1/checklists?module=PLD_FT&status=ACTIVE
{
  "data": [{
    "id": "b62707ee-...",
    "module": "PLD_FT",
    "regulationCode": "LEI_9613_98_CDD",
    "title": "Due Diligence PLD/FT — Cliente Padrão (CDD)",
    "description": "Checklist de conformidade com Art. 10 da Lei 9.613/98 e Res. BACEN 4.753/2019.",
    "version": "1.0",
    "status": "ACTIVE",
    "periodicityDays": 365,
    "appliesTo": ["CLIENTE", "PARCEIRO"],
    "totalItems": 28,           // calculado via jsonb_array_length
    "isSystemTemplate": true,   // tenant_id = null
    "createdAt": "2026-01-01T00:00:00Z"
  }]
}`}</Code>
                    </EP>

                    <EP method="POST" path="/v1/checklist-runs  (alias: /v1/checklists/run)" permission="ANALYST, COMPLIANCE_OFFICER, ADMIN" description="Inicia uma nova execução de checklist. Aceita um array de respostas inicial (pode ser vazio para modo rascunho). O autosave do frontend salva respostas parciais via PATCH.">
                        <AlertBox type="info">
                            A URL <code style={{ fontFamily: MONO }}>/v1/checklist-runs</code> e <code style={{ fontFamily: MONO }}>/v1/checklists/run</code> são equivalentes — ambas apontam para o mesmo handler.
                        </AlertBox>
                        <H3>Request Body</H3>
                        <DataTable
                            headers={['Campo', 'Tipo', 'Obrigatório', 'Descrição']}
                            rows={[
                                ['checklistId', 'string (UUID)', '✓', 'ID do template de checklist'],
                                ['entityId', 'string (UUID)', '✓', 'ID da entidade sendo avaliada'],
                                ['answers', 'array', '—', 'Respostas iniciais. Default: [] (rascunho vazio)'],
                                ['summaryNotes', 'string', '—', 'Observações iniciais do analista'],
                            ]}
                        />
                        <Code>{`// Request
{
  "checklistId": "b62707ee-...",
  "entityId": "01HQ7XK2N...",
  "answers": []           // pode começar vazio
}

// Response 201
{
  "data": {
    "id": "01HR3KM5...",
    "status": "IN_PROGRESS",
    "checklistTitle": "Due Diligence PLD/FT — Cliente Padrão (CDD)",
    "entityName": "Chuangxin Tecnologia da Informacao Ltda",
    "totalItems": 28,
    "answeredItems": 0,
    "startedAt": "2026-03-03T22:10:00Z"
  }
}`}</Code>
                    </EP>

                    <EP method="GET" path="/v1/checklist-runs/:id  (alias: /v1/checklists/run/:id)" permission="ANALYST, COMPLIANCE_OFFICER, ADMIN, AUDITOR, READONLY" description="Retorna o estado atual da execução, incluindo todas as respostas já registradas e o progresso.">
                        <Code>{`// Response 200
{
  "data": {
    "id": "01HR3KM5...",
    "checklistId": "b62707ee-...",
    "checklistTitle": "Due Diligence PLD/FT — Cliente Padrão (CDD)",
    "entityId": "01HQ7XK2N...",
    "entityName": "Chuangxin Tecnologia da Informacao Ltda",
    "status": "IN_PROGRESS",
    "score": null,
    "riskLevel": null,
    "answers": [
      {
        "itemId": "item_001",
        "answer": true,
        "note": "Política aprovada em Dez/2025",
        "evidenceKey": null,
        "answeredAt": "2026-03-03T22:12:00Z"
      }
    ],
    "totalItems": 28,
    "answeredItems": 1,
    "progressPct": 3.5,
    "startedAt": "2026-03-03T22:10:00Z",
    "completedAt": null,
    "durationSecs": null
  }
}`}</Code>
                    </EP>

                    <EP method="PATCH" path="/v1/checklist-runs/:id" permission="ANALYST, COMPLIANCE_OFFICER, ADMIN" description="Atualiza respostas parciais durante o preenchimento (autosave). Merge as respostas enviadas com as já existentes pelo itemId. Apenas execuções IN_PROGRESS podem ser atualizadas.">
                        <AlertBox type="warning">
                            Este endpoint é chamado automaticamente pelo <strong>autosave</strong> do frontend a cada 30 segundos de inatividade de digitação. Não é necessário implementar debounce manual — o hook já lida com isso.
                        </AlertBox>
                        <Code>{`// Request — apenas as respostas alteradas
{
  "answers": [
    { "itemId": "item_001", "answer": true, "note": "Aprovado em Jan/2026" },
    { "itemId": "item_002", "answer": false, "note": "" },
    { "itemId": "item_003", "answer": 2 }    // SCALE
  ],
  "summaryNotes": "Empresa em processo de implementação..."
}

// Response 200
{
  "data": {
    "id": "01HR...",
    "answeredItems": 3,
    "progressPct": 10.7,
    "updatedAt": "2026-03-03T22:15:00Z"
  }
}

// 422 — tentativa de editar run COMPLETED
{
  "type": ".../BUSINESS_RULE_VIOLATION",
  "title": "Execução imutável",
  "status": 422,
  "detail": "checklist_run imutável após status COMPLETED (id: 01HR...)"
}`}</Code>
                    </EP>

                    <EP method="POST" path="/v1/checklist-runs/:id/complete  (alias: /v1/checklists/run/:id/complete)" permission="COMPLIANCE_OFFICER, ADMIN" description="Finaliza a execução do checklist. Calcula o score, atualiza o risco da entidade, gera um evento de auditoria e, se configurado, dispara notificação por webhook.">
                        <AlertBox type="danger">
                            <strong>Ação irreversível.</strong> Após COMPLETE, a execução torna-se <strong>permanentemente imutável</strong> (trigger no banco). Garanta que todas as respostas foram registradas via PATCH antes de chamar este endpoint.
                        </AlertBox>
                        <H3>Algoritmo de Score</H3>
                        <Code>{`// Cálculo simplificado por answerType:
for item in checklist.items:
  if item.answerType == 'BOOLEAN':
    contribution = item.weight if answer == true else 0
  elif item.answerType == 'SCALE':
    contribution = item.weight * (answer / 3)  # 0, 33%, 66%, 100%
  elif item.answerType == 'TEXT':
    contribution = 0  # não contribui numericamente
  
  totalScore += contribution

// Score normalizado 0-100 baseado nos pesos respondidos`}</Code>
                        <Code>{`// Response 200
{
  "data": {
    "id": "01HR...",
    "status": "COMPLETED",
    "score": 62,
    "riskLevel": "MEDIUM",
    "completedAt": "2026-03-03T22:20:00Z",
    "answeredItems": 28,
    "totalItems": 28,
    "durationSecs": 3600
  },
  "meta": {
    "riskChanged": true,
    "previousLevel": "HIGH",
    "newLevel": "MEDIUM",
    "riskAssessmentId": "01HR...",
    "auditEventId": "01HR..."
  }
}`}</Code>
                    </EP>

                    <EP method="DELETE" path="/v1/checklist-runs/:id" permission="ADMIN" description="Cancela uma execução em andamento (status: IN_PROGRESS → CANCELLED). Execuções COMPLETED não podem ser canceladas.">
                        <Code>{`// Response 200
{
  "data": { "id": "01HR...", "status": "CANCELLED" }
}

// 422 — tentativa de cancelar run COMPLETED
{
  "type": ".../BUSINESS_RULE_VIOLATION",
  "status": 422,
  "detail": "Execuções finalizadas não podem ser canceladas"
}`}</Code>
                    </EP>
                </Section>

                {/* MODULES */}
                <Section id="modulos" title="Templates por Módulo">
                    <H3>PLD/FT — Lei 9.613/98</H3>
                    <DataTable
                        headers={['ID', 'Template', 'Itens', 'Periodicidade', 'Base Legal']}
                        rows={[
                            ['b62707ee-...', 'Due Diligence Padrão (CDD)', '28', '365 dias', 'Art. 10, Lei 9.613/98 + Res. BACEN 4.753/2019'],
                            ['d461ab63-...', 'Due Diligence Reforçada (EDD)', '35', '180 dias', 'Res. BACEN 4.753/2019 — clientes Alto Risco'],
                        ]}
                    />

                    <H3>LGPD — Lei 13.709/18</H3>
                    <DataTable
                        headers={['ID', 'Template', 'Itens', 'Periodicidade', 'Base Legal']}
                        rows={[
                            ['d8e740bf-...', 'Mapeamento LGPD — RAT', '22', '180 dias', 'Art. 37, LGPD + Res. CD/ANPD 02/2022'],
                        ]}
                    />

                    <H3>Anticorrupção — Lei 12.846/13</H3>
                    <DataTable
                        headers={['ID', 'Template', 'Itens', 'Periodicidade', 'Base Legal']}
                        rows={[
                            ['bc7d2bd4-...', 'Programa de Integridade — Lei Anticorrupção', '42', '365 dias', '5 Pilares CGU + Decreto 11.129/2022'],
                        ]}
                    />
                </Section>

                {/* NAV */}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '2.5rem', borderTop: `1px solid ${LINE}` }}>
                    <Link href="/docs/api/entities" style={{ fontFamily: UI, fontSize: '.875rem', color: CYAN }}>← API de Entidades</Link>
                    <Link href="/docs/api/audit" style={{ fontFamily: UI, fontSize: '.875rem', color: CYAN }}>API de Audit Trail →</Link>
                </div>
            </div>
            <PublicFooter />
        </div>
    )
}
