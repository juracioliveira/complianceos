'use client'
import Link from 'next/link'
import { PublicNav, PublicFooter } from '@/components/public/PublicLayout'

function Tag({ method }: { method: string }) {
    const c: Record<string, string> = {
        GET: 'text-green-600 bg-green-50 border-green-200',
        POST: 'text-sky-600 bg-sky-50 border-sky-200',
        PATCH: 'text-amber-600 bg-amber-50 border-amber-200',
        DELETE: 'text-red-600 bg-red-50 border-red-200',
        PUT: 'text-amber-600 bg-amber-50 border-amber-200'
    }
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
                <div className="flex gap-2 flex-wrap mb-4 items-center">
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

export function ChecklistsApiClient() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
            <PublicNav />

            <section className="pt-32 pb-12 border-b border-slate-200" style={{ backgroundImage: `linear-gradient(#e2e8f0 1px,transparent 1px),linear-gradient(90deg,#e2e8f0 1px,transparent 1px)`, backgroundSize: '80px 80px' }}>
                <div className="max-w-[1100px] mx-auto px-6 md:px-12">
                    <p className="font-mono text-[0.7rem] text-slate-500 uppercase tracking-widest mb-4">
                        <Link href="/" className="hover:text-brand-600 transition-colors">ComplianceOS</Link> / <Link href="/docs" className="hover:text-brand-600 transition-colors">Docs</Link> / Checklists
                    </p>
                    <h1 className="font-serif text-[clamp(1.75rem,3vw,2.75rem)] text-slate-900 mb-3">API — Checklists</h1>
                    <p className="text-base text-slate-600 max-w-2xl leading-relaxed">Gerencie templates de due diligence e execuções de checklists regulatórios. Execuções finalizadas são imutáveis por garantia regulatória.</p>
                    <div className="flex gap-2.5 mt-5 flex-wrap">
                        <Badge label="POST /v1/checklist-runs" type="info" />
                        <Badge label="POST /v1/checklists/run" type="info" />
                        <Badge label="Imutável após COMPLETED" type="danger" />
                    </div>
                </div>
            </section>

            <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-16">

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
                            A URL <code className="font-mono text-slate-700 bg-white/50 px-1 py-0.5 rounded">/v1/checklist-runs</code> e <code className="font-mono text-slate-700 bg-white/50 px-1 py-0.5 rounded">/v1/checklists/run</code> são equivalentes — ambas apontam para o mesmo handler.
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
                <div className="flex justify-between pt-10 border-t border-slate-200">
                    <Link href="/docs/api/entities" className="font-medium text-[0.875rem] text-brand-600 hover:text-brand-700 flex items-center gap-1.5 transition-colors">← API de Entidades</Link>
                    <Link href="/docs/api/audit" className="font-medium text-[0.875rem] text-brand-600 hover:text-brand-700 flex items-center gap-1.5 transition-colors">API de Audit Trail →</Link>
                </div>
            </div>
            <PublicFooter />
        </div>
    )
}
