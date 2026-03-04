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

/* ─── SHARED COMPONENTS ─── */
function Tag({ method }: { method: string }) {
    const c: Record<string, string> = { GET: SUCCESS, POST: INFO, PATCH: WARNING, DELETE: DANGER, PUT: WARNING }
    return <span style={{ fontFamily: MONO, fontSize: '.6rem', fontWeight: 700, padding: '.15rem .5rem', background: c[method] + '18', color: c[method], border: `1px solid ${c[method]}40`, letterSpacing: '.04em' }}>{method}</span>
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
function EndpointBlock({ method, path, permission, description, children }: { method: string; path: string; permission: string; description: string; children: React.ReactNode }) {
    return (
        <div style={{ border: `1px solid ${LINE}`, marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.875rem', padding: '1rem 1.25rem', background: SURFACE, borderBottom: `1px solid ${LINE}` }}>
                <Tag method={method} />
                <code style={{ fontFamily: MONO, fontSize: '.875rem', color: TEXT, fontWeight: 600 }}>{path}</code>
            </div>
            <div style={{ padding: '1.25rem 1.5rem' }}>
                <p style={{ fontFamily: UI, fontSize: '.8125rem', color: MUTED, marginBottom: '.5rem', lineHeight: 1.7 }}>{description}</p>
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

export function EntitiesApiClient() {
    return (
        <div style={pageStyle}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');*{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}a{color:inherit;text-decoration:none;}`}</style>
            <PublicNav />

            {/* HERO */}
            <section style={{ paddingTop: '8rem', paddingBottom: '3rem', borderBottom: `1px solid ${LINE}`, backgroundImage: `linear-gradient(${LINE} 1px,transparent 1px),linear-gradient(90deg,${LINE} 1px,transparent 1px)`, backgroundSize: '80px 80px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 3rem' }}>
                    <p style={{ fontFamily: MONO, fontSize: '.7rem', color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '.1em', marginBottom: '1rem' }}>
                        <Link href="/" style={{ color: MUTED }}>ComplianceOS</Link> / <Link href="/docs" style={{ color: MUTED }}>Docs</Link> / Entidades
                    </p>
                    <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(1.75rem,3vw,2.75rem)', color: TEXT, fontWeight: 'normal', marginBottom: '.75rem' }}>API — Entidades</h1>
                    <p style={{ fontFamily: UI, fontSize: '1rem', color: MUTED, maxWidth: 600, lineHeight: 1.75 }}>Gerencie o portfólio de entidades (clientes, fornecedores, parceiros) sujeitas à due diligence. O módulo de KYB é disparado automaticamente ao criar ou atualizar uma entidade.</p>
                    <div style={{ display: 'flex', gap: '.625rem', marginTop: '1.25rem', flexWrap: 'wrap' as const }}>
                        <Badge label="Base URL: https://api.complianceos.com.br/v1/entities" color={INFO} />
                        <Badge label="RLS — Isolamento por tenant_id" color={SUCCESS} />
                        <Badge label="KYB Automático" color={CYAN} />
                    </div>
                </div>
            </section>

            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 3rem 6rem' }}>

                {/* SCHEMA */}
                <Section id="schema" title="Schema da Entidade">
                    <P>O objeto <code style={{ fontFamily: MONO, fontSize: '.85em', color: CYAN }}>Entity</code> representa qualquer pessoa jurídica ou física monitorada pela plataforma.</P>
                    <Code>{`interface Entity {
  id:               string              // UUID v4
  name:             string              // Razão social ou nome completo
  cnpj:             string | null       // 14 dígitos (PJ)
  cpf:              string | null       // 11 dígitos (PF)
  entityType:       'CLIENTE' | 'FORNECEDOR' | 'PARCEIRO' | 'COLABORADOR'
  sector:           string | null       // Setor econômico
  corporateData: {
    capitalSocial:  number | null
    dataAbertura:   string | null       // ISO 8601 date
    socios: Array<{
      nome:         string
      cpf:          string
      participacao: number              // percentual %
    }>
    beneficiarioFinal?: object | null   // UBO — Beneficial Owner
  }
  // Score e risco calculados (cache — fonte de verdade: risk_assessments)
  riskScore:        number | null       // 0-100
  riskLevel:        'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN'
  lastAssessedAt:   string | null       // ISO 8601
  // Status
  status:           'ACTIVE' | 'INACTIVE' | 'BLOCKED'
  blockedReason:    string | null
  // KYC/KYB
  kycStatus:        'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED'
  kycCompletedAt:   string | null
  // PEP
  isPep:            boolean
  pepDetails:       object | null
  // Metadados
  createdBy:        string              // user UUID
  createdAt:        string             // ISO 8601
  updatedAt:        string             // ISO 8601
  // Calculados — apenas no GET /:id
  pendingChecklists:  number
  overdueChecklists:  number
  lastChecklistRunAt: string | null
}`}</Code>
                </Section>

                {/* LIST */}
                <Section id="list" title="Endpoints">
                    <EndpointBlock
                        method="GET"
                        path="/v1/entities"
                        permission="ANALYST, COMPLIANCE_OFFICER, ADMIN, AUDITOR, READONLY"
                        description="Lista entidades do tenant com filtragem avançada, busca full-text e paginação por cursor."
                    >
                        <H3>Parâmetros de Query</H3>
                        <DataTable
                            headers={['Parâmetro', 'Tipo', 'Default', 'Descrição']}
                            rows={[
                                ['cursor', 'string', '—', 'Token opaco da próxima página (retornado em meta.nextCursor)'],
                                ['limit', 'integer', '25', 'Itens por página (1–100)'],
                                ['sort', 'string', 'created_at:desc', 'Campo e direção. Campos: name, risk_level, created_at, last_assessed_at'],
                                ['filter[risk_level]', 'string', '—', 'LOW | MEDIUM | HIGH | CRITICAL | UNKNOWN'],
                                ['filter[status]', 'string', '—', 'ACTIVE | INACTIVE | BLOCKED'],
                                ['filter[entity_type]', 'string', '—', 'CLIENTE | FORNECEDOR | PARCEIRO | COLABORADOR'],
                                ['filter[kyc_status]', 'string', '—', 'PENDING | IN_PROGRESS | APPROVED | REJECTED'],
                                ['filter[is_pep]', 'boolean', '—', 'true para filtrar apenas PEPs'],
                                ['search', 'string', '—', 'Busca full-text por nome (trigram index — mínimo 3 caracteres)'],
                            ]}
                        />
                        <Code>{`// Request
GET /v1/entities?limit=25&sort=risk_level:desc&filter[status]=ACTIVE&search=acme

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
      "isPep": false,
      "status": "ACTIVE",
      "createdAt": "2026-01-15T09:00:00Z"
    }
  ],
  "meta": {
    "total": 87,
    "limit": 25,
    "hasMore": true,
    "nextCursor": "01HQ7XL...",
    "prevCursor": null
  }
}`}</Code>
                    </EndpointBlock>

                    <EndpointBlock
                        method="POST"
                        path="/v1/entities"
                        permission="COMPLIANCE_OFFICER, ADMIN"
                        description="Cria uma nova entidade. Após criação, um job de KYB (Know Your Business) é disparado assincronamente para validar o CNPJ na Receita Federal e disparar o primeiro screening de sanções."
                    >
                        <AlertBox type="info">
                            O campo <code style={{ fontFamily: MONO }}>entityId</code> retornado pode ser usado imediatamente para iniciar um checklist mesmo antes do KYB terminar.
                        </AlertBox>
                        <H3>Request Body</H3>
                        <DataTable
                            headers={['Campo', 'Tipo', 'Obrigatório', 'Descrição']}
                            rows={[
                                ['name', 'string', '✓', 'Razão social (máx. 200 chars)'],
                                ['cnpj', 'string', 'PJ*', '14 dígitos numéricos sem formatação'],
                                ['cpf', 'string', 'PF*', '11 dígitos numéricos'],
                                ['entityType', 'string', '✓', 'CLIENTE | FORNECEDOR | PARCEIRO | COLABORADOR'],
                                ['sector', 'string', '—', 'Setor econômico da entidade'],
                                ['corporateData', 'object', '—', 'Dados societários: socios, capitalSocial, dataAbertura'],
                            ]}
                        />
                        <Code>{`// Request
{
  "name": "Chuangxin Tecnologia da Informacao Ltda",
  "cnpj": "65089671000116",
  "entityType": "FORNECEDOR",
  "sector": "Tecnologia da Informação",
  "corporateData": {
    "capitalSocial": 100000.00,
    "dataAbertura": "2022-01-10",
    "socios": [
      { "nome": "João Silva", "cpf": "12345678901", "participacao": 100.0 }
    ]
  }
}

// Response 201
{
  "data": {
    "id": "01HQ7XK2N3P4Q5R6...",
    "name": "Chuangxin Tecnologia da Informacao Ltda",
    "cnpj": "65089671000116",
    "entityType": "FORNECEDOR",
    "riskLevel": "UNKNOWN",
    "riskScore": null,
    "kycStatus": "PENDING",
    "status": "ACTIVE",
    "createdAt": "2026-03-03T22:10:00Z"
  },
  "meta": {
    "kybJobId": "job_01HQ...",
    "message": "Entidade criada. KYB iniciado automaticamente. Aguarde ~30s."
  }
}

// Erros possíveis
{
  // 409 — CNPJ já cadastrado no tenant
  "type": ".../CONFLICT",
  "title": "CNPJ já cadastrado",
  "status": 409,
  "detail": "A entidade com CNPJ 65089671000116 já existe neste tenant"
}`}</Code>
                    </EndpointBlock>

                    <EndpointBlock
                        method="GET"
                        path="/v1/entities/:id"
                        permission="ANALYST, COMPLIANCE_OFFICER, ADMIN, AUDITOR, READONLY"
                        description="Retorna dados completos da entidade, incluindo campos calculados como checklists pendentes e vencidos."
                    >
                        <Code>{`// Response 200
{
  "data": {
    "id": "01HQ7XK2N...",
    "name": "Chuangxin Tecnologia da Informacao Ltda",
    "cnpj": "65089671000116",
    "entityType": "FORNECEDOR",
    "sector": "Tecnologia da Informação",
    "corporateData": {
      "capitalSocial": 100000.00,
      "dataAbertura": "2022-01-10",
      "socios": [{ "nome": "João Silva", "cpf": "12345678901", "participacao": 100.0 }]
    },
    "riskScore": 75,
    "riskLevel": "MEDIUM",
    "lastAssessedAt": "2026-03-03T10:00:00Z",
    "kycStatus": "APPROVED",
    "kycCompletedAt": "2026-01-15T09:30:00Z",
    "isPep": false,
    "status": "ACTIVE",
    "createdAt": "2026-01-10T08:00:00Z",
    "updatedAt": "2026-03-03T10:00:00Z",
    // Campos calculados
    "pendingChecklists": 1,
    "overdueChecklists": 0,
    "lastChecklistRunAt": "2026-02-15T14:30:00Z"
  }
}

// 404 — entidade não existe ou pertence a outro tenant
{
  "type": ".../NOT_FOUND",
  "title": "Entidade não encontrada",
  "status": 404
}`}</Code>
                    </EndpointBlock>

                    <EndpointBlock
                        method="PATCH"
                        path="/v1/entities/:id"
                        permission="COMPLIANCE_OFFICER, ADMIN"
                        description="Atualiza dados não-estruturais da entidade. Alterações em cnpj ou corporateData disparam novo KYB automaticamente."
                    >
                        <AlertBox type="warning">
                            Alterar o CNPJ ou dados societários dispara automaticamente um novo ciclo de KYB (validação Receita Federal + screening de sanções).
                        </AlertBox>
                        <Code>{`// Request — campos opcionais, apenas os enviados são atualizados
{
  "sector": "Tecnologia da Informação e Comunicação",
  "status": "ACTIVE",
  "corporateData": {
    "capitalSocial": 250000.00
  }
}

// Response 200
{
  "data": { "id": "...", "updatedAt": "2026-03-03T22:10:00Z" },
  "meta": { "kybTriggered": false }
}`}</Code>
                    </EndpointBlock>

                    <EndpointBlock
                        method="DELETE"
                        path="/v1/entities/:id"
                        permission="ADMIN"
                        description="Bloqueia a entidade (soft delete). Dados são preservados para fins de auditoria regulatória. Remoção permanente não é suportada."
                    >
                        <AlertBox type="danger">
                            Entidades não são removidas permanentemente. O status é alterado para <code style={{ fontFamily: MONO }}>BLOCKED</code> e todos os dados históricos são preservados por 5 anos conforme exigência regulatória.
                        </AlertBox>
                        <Code>{`// Response 200
{
  "data": {
    "id": "01HQ7XK2N...",
    "status": "BLOCKED",
    "blockedReason": "Solicitado via API pelo admin"
  }
}`}</Code>
                    </EndpointBlock>

                    <EndpointBlock
                        method="POST"
                        path="/v1/entities/:id/screen"
                        permission="COMPLIANCE_OFFICER, ADMIN"
                        description="Dispara screening manual e imediato de sanções para a entidade. Para entidades CRITICAL o resultado é síncrono (< 5s). Para demais entidades, o resultado chega via webhook document.ready."
                    >
                        <Code>{`// Response 200 — resultado síncrono (CRITICAL) ou 202 (assíncrono)
{
  "data": {
    "entityId": "01HQ7XK2N...",
    "screeningId": "scr_01HR...",
    "status": "CLEAR",         // CLEAR | HIT | REVIEW_REQUIRED
    "listsChecked": ["OFAC_SDN", "UN_CONSOLIDATED", "CGU_CEIS", "COAF"],
    "hits": [],                // vazio se CLEAR
    "screenedAt": "2026-03-03T22:10:00Z"
  }
}

// Quando status = "HIT"
{
  "data": {
    "status": "HIT",
    "hits": [{
      "list": "OFAC_SDN",
      "matchedName": "CHUANGXIN TECH",
      "matchScore": 0.89,
      "listEntryId": "OFAC-123456",
      "sanctions": ["Executive Order 13382"]
    }]
  }
}`}</Code>
                    </EndpointBlock>

                    <EndpointBlock
                        method="GET"
                        path="/v1/entities/:id/risk-assessments"
                        permission="ANALYST, COMPLIANCE_OFFICER, ADMIN, AUDITOR, READONLY"
                        description="Histórico completo de avaliações de risco com fatores detalhados por módulo (PLD/FT, LGPD, Anticorrupção, Sanções)."
                    >
                        <DataTable
                            headers={['Parâmetro', 'Tipo', 'Descrição']}
                            rows={[
                                ['limit', 'integer', 'Itens por página (default 10, máx 100)'],
                                ['cursor', 'string', 'Cursor de paginação'],
                            ]}
                        />
                        <Code>{`// Response 200
{
  "data": [{
    "id": "01HQ...",
    "score": 42,
    "riskLevel": "HIGH",
    "previousLevel": "MEDIUM",
    "levelChanged": true,
    "factors": {
      "pldFt": {
        "score": 35,
        "weight": 0.4,
        "checklistRunId": "01HR...",
        "checklistTitle": "Due Diligence PLD/FT (CDD)"
      },
      "lgpd": {
        "score": 55,
        "weight": 0.3,
        "checklistRunId": "01HR..."
      },
      "anticorrupcao": {
        "score": 60,
        "weight": 0.3,
        "checklistRunId": "01HR..."
      },
      "sanctions": {
        "clear": true,
        "screenedAt": "2026-02-01T09:55:00Z",
        "listsChecked": ["OFAC_SDN", "UN_CONSOLIDATED", "CGU_CEIS"]
      },
      "pep": { "isPep": false }
    },
    "triggeredBy": "CHECKLIST_RUN",
    "triggeredById": "01HR...",
    "calculatedAt": "2026-02-01T10:00:00Z",
    "expiresAt": "2026-05-01T10:00:00Z"
  }],
  "meta": { "total": 5, "limit": 10, "hasMore": false }
}`}</Code>
                    </EndpointBlock>

                    <EndpointBlock
                        method="GET"
                        path="/v1/entities/:id/checklist-runs"
                        permission="ANALYST, COMPLIANCE_OFFICER, ADMIN, AUDITOR, READONLY"
                        description="Lista todas as execuções de checklists para a entidade, com scores e resultados."
                    >
                        <Code>{`// Response 200
{
  "data": [{
    "id": "01HR...",
    "checklistTitle": "Due Diligence PLD/FT — Cliente Padrão (CDD)",
    "module": "PLD_FT",
    "status": "COMPLETED",
    "score": 62,
    "riskLevel": "MEDIUM",
    "executedBy": { "id": "uuid", "name": "Maria Silva" },
    "startedAt": "2026-02-15T14:30:00Z",
    "completedAt": "2026-02-15T15:20:00Z",
    "durationSecs": 3000
  }],
  "meta": { "total": 3 }
}`}</Code>
                    </EndpointBlock>
                </Section>

                {/* NOTES */}
                <Section id="notas" title="Notas de Implementação">
                    <H3>Isolamento Multi-tenant (RLS)</H3>
                    <P>Todas as queries são automaticamente filtradas pelo <code style={{ fontFamily: MONO, fontSize: '.85em', color: CYAN }}>tenant_id</code> via PostgreSQL Row-Level Security. É impossível acessar entidades de outro tenant mesmo com um bug na camada de aplicação.</P>

                    <H3>Score de Risco</H3>
                    <P>O campo <code style={{ fontFamily: MONO, fontSize: '.85em', color: CYAN }}>riskScore</code> na entidade é um <strong>cache</strong> do último <code style={{ fontFamily: MONO, fontSize: '.85em' }}>risk_assessment</code>. A fonte de verdade são os registros em <code style={{ fontFamily: MONO, fontSize: '.85em' }}>/v1/entities/:id/risk-assessments</code>. O score é calculado como:</P>
                    <Code>{`score = (pldFt.score * 0.4) + (lgpd.score * 0.3) + (anticorrupcao.score * 0.3)

// Mapeamento score → riskLevel
score < 30  → CRITICAL
30 ≤ score < 50 → HIGH
50 ≤ score < 70 → MEDIUM
score ≥ 70  → LOW`}</Code>

                    <H3>Busca Full-text</H3>
                    <P>O parâmetro <code style={{ fontFamily: MONO, fontSize: '.85em', color: CYAN }}>search</code> usa o índice de trigrama (<code style={{ fontFamily: MONO, fontSize: '.85em' }}>pg_trgm</code>) sobre o campo <code style={{ fontFamily: MONO, fontSize: '.85em' }}>name</code>. Busca por similaridade — não requer correspondência exata. Mínimo de 3 caracteres para ativação do índice.</P>
                </Section>

                {/* NAV */}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '2.5rem', borderTop: `1px solid ${LINE}` }}>
                    <Link href="/docs" style={{ fontFamily: UI, fontSize: '.875rem', color: CYAN, display: 'flex', alignItems: 'center', gap: '.375rem' }}>← Voltar para Docs</Link>
                    <Link href="/docs/api/checklists" style={{ fontFamily: UI, fontSize: '.875rem', color: CYAN, display: 'flex', alignItems: 'center', gap: '.375rem' }}>API de Checklists →</Link>
                </div>
            </div>

            <PublicFooter />
        </div>
    )
}
