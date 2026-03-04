'use client'
import Link from 'next/link'
import { useState } from 'react'
import { PublicNav, PublicFooter, pageStyle, CYAN, SURFACE, LINE, TEXT, MUTED, UI, MONO } from '@/components/public/PublicLayout'

/* ─── TOKENS ─── */
const SERIF = "'DM Serif Display', serif"
const SURFACE2 = '#F3F4F6'
const LINE_S = 'rgba(0,0,0,0.10)'
const SUCCESS = '#16A34A'
const WARNING = '#D97706'
const DANGER = '#DC2626'
const INFO = '#0284C7'

/* ─── SIDEBAR SECTIONS ─── */
const NAV = [
    {
        group: 'Introdução',
        items: [
            { id: 'intro', label: 'Visão Geral' },
            { id: 'quickstart', label: 'Quick Start (5 min)' },
            { id: 'auth', label: 'Autenticação' },
            { id: 'errors', label: 'Formato de Erros' },
            { id: 'pagination', label: 'Paginação' },
            { id: 'rate-limits', label: 'Rate Limits' },
        ],
    },
    {
        group: 'API Reference',
        items: [
            { id: 'api-entities', label: 'Entidades' },
            { id: 'api-checklists', label: 'Checklists' },
            { id: 'api-documents', label: 'Documentos' },
            { id: 'api-audit', label: 'Audit Trail' },
            { id: 'api-users', label: 'Usuários' },
            { id: 'api-dashboard', label: 'Dashboard' },
        ],
    },
    {
        group: 'Integrações',
        items: [
            { id: 'webhooks', label: 'Webhooks' },
            { id: 'cnpj-api', label: 'API de CNPJ' },
            { id: 'sanctions', label: 'Screening de Sanções' },
            { id: 'sso', label: 'SAML SSO (Enterprise)' },
        ],
    },
    {
        group: 'Módulos',
        items: [
            { id: 'mod-pld', label: 'PLD/FT' },
            { id: 'mod-lgpd', label: 'LGPD' },
            { id: 'mod-anticorrupcao', label: 'Anticorrupção' },
        ],
    },
]

/* ─── HELPERS ─── */
function Tag({ method }: { method: string }) {
    const colors: Record<string, string> = { GET: SUCCESS, POST: INFO, PATCH: WARNING, DELETE: DANGER, PUT: WARNING }
    return (
        <span style={{
            fontFamily: MONO, fontSize: '.6rem', fontWeight: 600, padding: '.15rem .45rem',
            background: colors[method] + '18', color: colors[method], border: `1px solid ${colors[method]}40`,
        }}>{method}</span>
    )
}

function Code({ children }: { children: string }) {
    return (
        <pre style={{
            fontFamily: MONO, fontSize: '.78rem', lineHeight: 1.7, padding: '1.25rem 1.5rem',
            background: '#0F172A', color: '#E2E8F0', overflowX: 'auto',
            margin: '1rem 0', whiteSpace: 'pre-wrap', wordBreak: 'break-all' as const,
        }}>
            <code>{children}</code>
        </pre>
    )
}

function Badge({ label, color = CYAN }: { label: string; color?: string }) {
    return (
        <span style={{
            fontFamily: MONO, fontSize: '.6rem', padding: '.15rem .5rem',
            background: color + '15', color, border: `1px solid ${color}30`,
        }}>{label}</span>
    )
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
    return (
        <h2 id={id} style={{
            fontFamily: SERIF, fontSize: 'clamp(1.35rem,2vw,1.75rem)', color: TEXT, fontWeight: 'normal',
            marginBottom: '1rem', paddingBottom: '.875rem', borderBottom: `1px solid ${LINE}`,
            scrollMarginTop: '6rem',
        }}>
            {children}
        </h2>
    )
}

function SubTitle({ children, id }: { children: React.ReactNode; id?: string }) {
    return (
        <h3 id={id} style={{
            fontFamily: UI, fontWeight: 600, fontSize: '1rem', color: TEXT,
            marginTop: '2rem', marginBottom: '.75rem', scrollMarginTop: '6rem',
        }}>
            {children}
        </h3>
    )
}

function P({ children }: { children: React.ReactNode }) {
    return <p style={{ fontFamily: UI, fontSize: '.875rem', color: MUTED, lineHeight: 1.8, marginBottom: '.75rem' }}>{children}</p>
}

function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
    return (
        <div style={{ overflowX: 'auto', margin: '1rem 0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: UI, fontSize: '.8125rem' }}>
                <thead>
                    <tr>
                        {headers.map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '.625rem 1rem', background: SURFACE2, color: TEXT, fontWeight: 600, borderBottom: `1px solid ${LINE_S}` }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${LINE}` }}>
                            {row.map((cell, j) => (
                                <td key={j} style={{ padding: '.625rem 1rem', color: MUTED, verticalAlign: 'top' }}>{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function Endpoint({ method, path, permission, description }: { method: string; path: string; permission?: string; description?: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.75rem', padding: '1rem', background: SURFACE, border: `1px solid ${LINE}`, marginBottom: '.75rem' }}>
            <Tag method={method} />
            <div style={{ flex: 1 }}>
                <code style={{ fontFamily: MONO, fontSize: '.8125rem', color: TEXT, fontWeight: 500 }}>{path}</code>
                {permission && <div style={{ fontFamily: UI, fontSize: '.75rem', color: MUTED, marginTop: '.25rem' }}>Permissão: <strong>{permission}</strong></div>}
                {description && <div style={{ fontFamily: UI, fontSize: '.8125rem', color: MUTED, marginTop: '.25rem' }}>{description}</div>}
            </div>
        </div>
    )
}

function AlertBox({ type, children }: { type: 'info' | 'warning' | 'danger' | 'success'; children: React.ReactNode }) {
    const cfg = {
        info: { color: INFO, icon: 'ℹ', label: 'Nota' },
        warning: { color: WARNING, icon: '⚠', label: 'Atenção' },
        danger: { color: DANGER, icon: '✕', label: 'Crítico' },
        success: { color: SUCCESS, icon: '✓', label: 'Dica' },
    }[type]
    return (
        <div style={{ display: 'flex', gap: '.75rem', padding: '1rem 1.25rem', background: cfg.color + '08', borderLeft: `3px solid ${cfg.color}`, margin: '1rem 0' }}>
            <span style={{ fontFamily: MONO, fontSize: '.9rem', color: cfg.color, lineHeight: 1.6, flexShrink: 0 }}>{cfg.icon}</span>
            <div style={{ fontFamily: UI, fontSize: '.8125rem', color: MUTED, lineHeight: 1.75 }}>{children}</div>
        </div>
    )
}

/* ─── MAIN CLIENT COMPONENT ─── */
export function DocsPageClient() {
    const [active, setActive] = useState('intro')

    function scrollTo(id: string) {
        setActive(id)
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    const mono = { fontFamily: MONO, fontSize: '.85em' as const, color: CYAN }

    return (
        <div style={pageStyle}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
        a{color:inherit;text-decoration:none;}
        html{scroll-behavior:smooth;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(0,0,0,.09);border-radius:2px;}
      `}</style>

            <PublicNav />

            {/* HERO */}
            <section style={{
                paddingTop: '8rem', paddingBottom: '4rem', borderBottom: `1px solid ${LINE}`,
                backgroundImage: `linear-gradient(${LINE} 1px,transparent 1px),linear-gradient(90deg,${LINE} 1px,transparent 1px)`,
                backgroundSize: '80px 80px',
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 3rem' }}>
                    <p style={{ fontFamily: MONO, fontSize: '.7rem', color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '.12em', marginBottom: '1.5rem' }}>
                        <Link href="/" style={{ color: MUTED }}>ComplianceOS</Link>{' / '}Documentação
                    </p>
                    <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(2rem,4vw,3.25rem)', color: TEXT, fontWeight: 'normal', marginBottom: '1rem', maxWidth: 680 }}>
                        Documentação Técnica
                    </h1>
                    <p style={{ fontFamily: UI, fontSize: '1.0625rem', color: MUTED, maxWidth: 560, lineHeight: 1.75, marginBottom: '2rem' }}>
                        Referência completa da API REST, guias de integração e documentação dos módulos de compliance.
                        Base URL: <code style={mono}>https://api.complianceos.com.br</code>
                    </p>
                    <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' as const }}>
                        {([['v1 — Estável', SUCCESS], ['JWT RS256', CYAN], ['RFC 7807', INFO], ['OpenAPI 3.1', INFO]] as [string, string][]).map(([label, color]) => (
                            <Badge key={label} label={label} color={color} />
                        ))}
                    </div>
                </div>
            </section>

            {/* LAYOUT */}
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '80vh' }}>

                {/* SIDEBAR */}
                <aside style={{ borderRight: `1px solid ${LINE}`, padding: '2.5rem 0', position: 'sticky', top: 60, height: 'calc(100vh - 60px)', overflowY: 'auto' }}>
                    {NAV.map(section => (
                        <div key={section.group} style={{ marginBottom: '2rem' }}>
                            <div style={{ fontFamily: MONO, fontSize: '.6rem', textTransform: 'uppercase' as const, letterSpacing: '.12em', color: '#94A3B8', padding: '0 1.5rem', marginBottom: '.5rem' }}>
                                {section.group}
                            </div>
                            {section.items.map(item => (
                                <button key={item.id} onClick={() => scrollTo(item.id)} style={{
                                    display: 'block', width: '100%', textAlign: 'left' as const,
                                    padding: '.45rem 1.5rem', fontFamily: UI, fontSize: '.8125rem',
                                    color: active === item.id ? CYAN : MUTED,
                                    background: active === item.id ? CYAN + '08' : 'transparent',
                                    border: 'none', borderLeft: active === item.id ? `2px solid ${CYAN}` : '2px solid transparent',
                                    cursor: 'pointer', transition: 'all .15s',
                                }}>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    ))}
                </aside>

                {/* CONTENT */}
                <main style={{ padding: '3rem 3.5rem 6rem', maxWidth: 860 }}>

                    {/* INTRO */}
                    <section style={{ marginBottom: '4rem' }}>
                        <SectionTitle id="intro">Visão Geral da API</SectionTitle>
                        <P>A API ComplianceOS é uma interface REST autenticada via JWT (RS256) que expõe todos os recursos da plataforma. Todos os endpoints seguem o versionamento <code style={mono}>/v1/</code> e retornam JSON.</P>
                        <P>A solução é desenvolvida e operada por <strong>CHUANGXIN TECNOLOGIA DA INFORMACAO LTDA</strong> (CNPJ <strong>65.089.671/0001-16</strong>), em conformidade com a LGPD e normas do BACEN.</P>
                        <AlertBox type="info">
                            <strong>Sandbox disponível:</strong> Use <code style={{ fontFamily: MONO }}>https://sandbox-api.complianceos.com.br</code> para testes sem afetar dados de produção.
                        </AlertBox>
                        <DataTable
                            headers={['Ambiente', 'Base URL', 'Status']}
                            rows={[
                                ['Produção', <code key="p" style={{ fontFamily: MONO, fontSize: '.8rem' }}>https://api.complianceos.com.br</code>, <Badge key="ps" label="Estável" color={SUCCESS} />],
                                ['Sandbox', <code key="s" style={{ fontFamily: MONO, fontSize: '.8rem' }}>https://sandbox-api.complianceos.com.br</code>, <Badge key="ss" label="Disponível" color={INFO} />],
                            ]}
                        />
                    </section>

                    {/* QUICK START */}
                    <section style={{ marginBottom: '4rem' }}>
                        <SectionTitle id="quickstart">Quick Start — 5 minutos</SectionTitle>
                        <P>3 passos para realizar sua primeira due diligence via API.</P>
                        <SubTitle>Passo 1 — Autenticar</SubTitle>
                        <Code>{`curl -X POST https://api.complianceos.com.br/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "cco@sua-empresa.com.br",
    "password": "SuaSenha@2026"
  }'

# Resposta
{
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiJ9...",
    "expiresIn": 900
  }
}`}</Code>

                        <SubTitle>Passo 2 — Criar Entidade</SubTitle>
                        <Code>{`curl -X POST https://api.complianceos.com.br/v1/entities \\
  -H "Authorization: Bearer <access_token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Chuangxin Tecnologia da Informacao Ltda",
    "cnpj": "65089671000116",
    "entityType": "FORNECEDOR",
    "sector": "Tecnologia da Informação"
  }'

# Resposta 201
{
  "data": { "id": "01HQ7XK2N...", "riskLevel": "UNKNOWN" },
  "meta": { "kybJobId": "job_01HQ...", "message": "KYB iniciado automaticamente." }
}`}</Code>

                        <SubTitle>Passo 3 — Executar Checklist PLD</SubTitle>
                        <Code>{`# Listar checklists disponíveis
curl "https://api.complianceos.com.br/v1/checklists?module=PLD_FT" \\
  -H "Authorization: Bearer <access_token>"

# Iniciar execução
curl -X POST https://api.complianceos.com.br/v1/checklists/run \\
  -H "Authorization: Bearer <access_token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "checklistId": "01HQ...",
    "entityId": "01HQ7XK2N...",
    "answers": []
  }'`}</Code>
                    </section>

                    {/* AUTH */}
                    <section style={{ marginBottom: '4rem' }}>
                        <SectionTitle id="auth">Autenticação</SectionTitle>
                        <P>Todos os endpoints (exceto <code style={mono}>/v1/auth/*</code>) requerem Bearer Token JWT RS256 com expiração de <strong>15 minutos</strong>.</P>
                        <Code>{`Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...`}</Code>
                        <SubTitle>Payload do JWT</SubTitle>
                        <Code>{`{
  "sub": "uuid-do-usuario",
  "tenantId": "uuid-do-tenant",
  "role": "COMPLIANCE_OFFICER",
  "plan": "PROFESSIONAL",
  "modules": ["PLD_FT", "LGPD", "ANTICORRUPCAO"],
  "iat": 1708123456,
  "exp": 1708124356
}`}</Code>
                        <SubTitle>Roles disponíveis</SubTitle>
                        <DataTable
                            headers={['Role', 'Descrição', 'Acesso']}
                            rows={[
                                [<Badge key="a" label="ADMIN" color={DANGER} />, 'Administrador do tenant', 'Completo'],
                                [<Badge key="b" label="COMPLIANCE_OFFICER" color={CYAN} />, 'Responsável de compliance', 'Leitura/Escrita'],
                                [<Badge key="c" label="ANALYST" color={INFO} />, 'Analista de compliance', 'Leitura/Escrita limitado'],
                                [<Badge key="d" label="AUDITOR" color={WARNING} />, 'Auditor externo', 'Somente leitura + Audit Trail'],
                                [<Badge key="e" label="READONLY" color={MUTED} />, 'Visualização', 'Somente leitura'],
                            ]}
                        />
                        <SubTitle>Renovação de Token</SubTitle>
                        <Code>{`curl -X POST https://api.complianceos.com.br/v1/auth/refresh \\
  -H "Content-Type: application/json" \\
  -d '{ "refreshToken": "eyJhbGci..." }'`}</Code>
                    </section>

                    {/* ERRORS */}
                    <section style={{ marginBottom: '4rem' }}>
                        <SectionTitle id="errors">Formato de Erros (RFC 7807)</SectionTitle>
                        <P>Todos os erros seguem o padrão Problem Details (RFC 7807) para interoperabilidade.</P>
                        <Code>{`{
  "type": "https://complianceos.com.br/errors/VALIDATION_ERROR",
  "title": "Erro de validação",
  "status": 400,
  "detail": "CNPJ deve ter 14 dígitos numéricos",
  "instance": "/v1/entities",
  "requestId": "01HQ7XK2N3P4Q5R6S7T8U9V0",
  "timestamp": "2026-03-03T22:10:00Z"
}`}</Code>
                        <DataTable
                            headers={['HTTP', 'Código', 'Quando ocorre']}
                            rows={[
                                ['400', 'VALIDATION_ERROR', 'Schema inválido ou campo obrigatório ausente'],
                                ['401', 'UNAUTHORIZED', 'Token ausente, expirado ou inválido'],
                                ['401', 'MFA_REQUIRED', 'MFA não configurado ou código inválido'],
                                ['403', 'FORBIDDEN', 'Role insuficiente para a ação'],
                                ['403', 'MODULE_NOT_ENABLED', 'Plano não inclui o módulo solicitado'],
                                ['404', 'NOT_FOUND', 'Recurso não existe ou não pertence ao tenant'],
                                ['409', 'CONFLICT', 'Recurso já existe (ex: CNPJ duplicado)'],
                                ['422', 'BUSINESS_RULE_VIOLATION', 'Regra de negócio violada'],
                                ['429', 'RATE_LIMIT_EXCEEDED', 'Limite de requisições atingido'],
                                ['500', 'INTERNAL_ERROR', 'Erro interno — reportar ao suporte'],
                            ]}
                        />
                    </section>

                    {/* PAGINATION */}
                    <section style={{ marginBottom: '4rem' }}>
                        <SectionTitle id="pagination">Paginação (Cursor-based)</SectionTitle>
                        <Code>{`GET /v1/entities?cursor=01HQ7XK...&limit=25&sort=created_at:desc

// Response
{
  "data": [...],
  "meta": {
    "total": 142,
    "limit": 25,
    "hasMore": true,
    "nextCursor": "01HQ7XL..."
  }
}`}</Code>
                    </section>

                    {/* RATE LIMITS */}
                    <section style={{ marginBottom: '4rem' }}>
                        <SectionTitle id="rate-limits">Rate Limits</SectionTitle>
                        <DataTable
                            headers={['Plano', 'Req/minuto', 'Burst']}
                            rows={[
                                [<Badge key="s" label="Starter" color={MUTED} />, '120', '20 req/s'],
                                [<Badge key="p" label="Professional" color={CYAN} />, '600', '50 req/s'],
                                [<Badge key="e" label="Enterprise" color={INFO} />, '3.000', '200 req/s'],
                            ]}
                        />
                        <Code>{`# Headers de resposta
X-RateLimit-Limit: 600
X-RateLimit-Remaining: 487
X-RateLimit-Reset: 1708123500
Retry-After: 45   # apenas quando 429`}</Code>
                    </section>

                    {/* API ENTITIES */}
                    <section style={{ marginBottom: '4rem' }}>
                        <SectionTitle id="api-entities">API — Entidades</SectionTitle>
                        <P>Gerencie o portfólio de entidades (clientes, fornecedores, parceiros) sujeitas à due diligence.</P>
                        <Endpoint method="GET" path="/v1/entities" permission="ANALYST, COMPLIANCE_OFFICER, ADMIN, AUDITOR, READONLY" description="Lista com filtros: ?filter[risk_level]=HIGH&filter[status]=ACTIVE&search=acme" />
                        <Endpoint method="POST" path="/v1/entities" permission="COMPLIANCE_OFFICER, ADMIN" description="Cria entidade. KYB é disparado automaticamente em background." />
                        <Code>{`// POST /v1/entities
{
  "name": "Chuangxin Tecnologia da Informacao Ltda",
  "cnpj": "65089671000116",
  "entityType": "FORNECEDOR",
  "sector": "Tecnologia da Informação"
}

// Response 201
{
  "data": { "id": "01HQ7XK2N...", "riskLevel": "UNKNOWN", "kycStatus": "PENDING" },
  "meta": { "kybJobId": "job_01HQ...", "message": "KYB iniciado automaticamente." }
}`}</Code>
                        <Endpoint method="GET" path="/v1/entities/:id" permission="Todos os roles" />
                        <Endpoint method="GET" path="/v1/entities/:id/risk-assessments" permission="ANALYST, COMPLIANCE_OFFICER, ADMIN, AUDITOR" description="Histórico de avaliações de risco com fatores detalhados por módulo." />
                        <Code>{`// Response — Risk Assessment
{
  "data": [{
    "score": 42,
    "riskLevel": "HIGH",
    "levelChanged": true,
    "factors": {
      "pldFt":         { "score": 35, "weight": 0.4 },
      "lgpd":          { "score": 55, "weight": 0.3 },
      "anticorrupcao": { "score": 60, "weight": 0.3 },
      "sanctions":     { "clear": true }
    },
    "triggeredBy": "CHECKLIST_RUN",
    "expiresAt": "2026-06-03T10:00:00Z"
  }]
}`}</Code>
                    </section>

                    {/* API CHECKLISTS */}
                    <section style={{ marginBottom: '4rem' }}>
                        <SectionTitle id="api-checklists">API — Checklists</SectionTitle>
                        <P>Execute due diligences baseadas nas regulamentações Lei 9.613/98, Lei 12.846/13 e LGPD.</P>
                        <Endpoint method="GET" path="/v1/checklists" permission="Todos os roles" description="Lista templates. Parâmetro: ?module=PLD_FT|LGPD|ANTICORRUPCAO" />
                        <Endpoint method="POST" path="/v1/checklists/run" permission="ANALYST, COMPLIANCE_OFFICER, ADMIN" description="Inicia execução. Pode começar com answers vazio (modo rascunho)." />
                        <Endpoint method="POST" path="/v1/checklists/run/:id/complete" permission="COMPLIANCE_OFFICER, ADMIN" description="Finaliza. Score calculado e risco é atualizado automaticamente." />
                        <Code>{`// POST /v1/checklists/run/:id/complete — Response 200
{
  "data": {
    "status": "COMPLETED",
    "score": 62,
    "riskLevel": "MEDIUM",
    "completedAt": "2026-03-03T22:10:00Z"
  },
  "meta": {
    "riskChanged": true,
    "previousLevel": "HIGH",
    "newLevel": "MEDIUM"
  }
}`}</Code>
                        <AlertBox type="warning">
                            <strong>Imutabilidade:</strong> Execuções <code style={{ fontFamily: MONO }}>COMPLETED</code> são imutáveis por garantia regulatória (trigger no banco).
                        </AlertBox>
                    </section>

                    {/* API DOCUMENTS */}
                    <section style={{ marginBottom: '4rem' }}>
                        <SectionTitle id="api-documents">API — Documentos</SectionTitle>
                        <P>Gere documentos regulatórios em PDF com assinatura digital (PKCS#7/PAdES) e carimbo de tempo (TSA).</P>
                        <Endpoint method="POST" path="/v1/documents/generate" permission="COMPLIANCE_OFFICER, ADMIN" description="Geração assíncrona. Retorna jobId para polling." />
                        <Code>{`// Request
{ "docType": "POLITICA_PLD", "entityId": null, "params": { "vigenciaAnos": 1 } }

// Response 202
{
  "data": { "jobId": "job_01HR...", "status": "GENERATING", "estimatedSeconds": 30 },
  "meta": { "webhookEvent": "document.ready", "pollUrl": "/v1/documents/jobs/job_01HR..." }
}`}</Code>
                        <Endpoint method="GET" path="/v1/documents/jobs/:jobId" permission="Qualquer role" description="Polling do status de geração." />
                        <Endpoint method="GET" path="/v1/documents/:id/download" permission="ANALYST, COMPLIANCE_OFFICER, ADMIN, AUDITOR" description="Presigned URL do S3 (expira em 15 min)." />
                    </section>

                    {/* API AUDIT */}
                    <section style={{ marginBottom: '4rem' }}>
                        <SectionTitle id="api-audit">API — Audit Trail</SectionTitle>
                        <AlertBox type="danger">Acesso restrito a <strong>AUDITOR</strong> e <strong>ADMIN</strong>. Consultas de audit são registradas para meta-auditoria.</AlertBox>
                        <Endpoint method="GET" path="/v1/audit/events" permission="AUDITOR, ADMIN" description="Consulta com filtros: ?from=ISO&to=ISO&module=PLD_FT&limit=100" />
                        <Code>{`// Response — hash chain para integridade
{
  "data": [{
    "eventId": "01HR...",
    "occurredAt": "2026-03-03T22:10:00Z",
    "module": "PLD_FT",
    "action": "checklist.execute",
    "result": "SUCCESS",
    "payloadHash": "sha256:a1b2c3...",
    "prevHash": "sha256:z9y8x7..."
  }],
  "meta": { "integrityNote": "Hash chain verified — no gaps detected" }
}`}</Code>
                        <Endpoint method="POST" path="/v1/exports/regulators" permission="COMPLIANCE_OFFICER, ADMIN" description="Exportação para ANPD, BACEN, CGU, COAF em PDF/XLSX/JSON." />
                    </section>

                    {/* API USERS */}
                    <section style={{ marginBottom: '4rem' }}>
                        <SectionTitle id="api-users">API — Usuários</SectionTitle>
                        <Endpoint method="GET" path="/v1/users" permission="ADMIN" description="Lista todos os usuários do tenant." />
                        <Endpoint method="POST" path="/v1/users/invite" permission="ADMIN" description="Convida usuário por e-mail. Convite expira em 48h." />
                        <Endpoint method="PATCH" path="/v1/users/:id" permission="ADMIN (outros) / Qualquer (próprio)" description="Altera role ou status." />
                    </section>

                    {/* API DASHBOARD */}
                    <section style={{ marginBottom: '4rem' }}>
                        <SectionTitle id="api-dashboard">API — Dashboard</SectionTitle>
                        <Endpoint method="GET" path="/v1/dashboard/summary" permission="Todos os roles" description="Resumo: entidades por nível de risco, checklists vencidos, alertas." />
                        <Code>{`// Response 200
{
  "data": {
    "entities": { "total": 142, "byRisk": { "CRITICAL": 3, "HIGH": 18, "MEDIUM": 67, "LOW": 54 } },
    "checklists": { "overdue": 7, "dueSoon": 12, "completedThisMonth": 34 },
    "alerts": { "critical": 1, "warning": 5, "unread": 4 }
  }
}`}</Code>
                    </section>

                    {/* WEBHOOKS */}
                    <section style={{ marginBottom: '4rem' }}>
                        <SectionTitle id="webhooks">Webhooks (Enterprise)</SectionTitle>
                        <P>Receba notificações em tempo real no seu sistema. Disponível no plano <strong>Enterprise</strong>.</P>
                        <DataTable
                            headers={['Evento', 'Quando disparado']}
                            rows={[
                                ['entity.risk.escalated', 'Nível de risco subiu (ex: MEDIUM → HIGH)'],
                                ['checklist.overdue', 'Checklist ultrapassou a data de vencimento'],
                                ['document.ready', 'Documento PDF gerado com sucesso'],
                                ['sanctions.hit', 'Entidade encontrada em lista de sanções'],
                                ['user.invited', 'Novo usuário convidado para o tenant'],
                            ]}
                        />
                        <SubTitle>Payload e Validação de Assinatura</SubTitle>
                        <Code>{`// POST para URL configurada — HMAC-SHA256
{
  "webhookId": "wh_01HR...",
  "event": "entity.risk.escalated",
  "tenantId": "uuid",
  "timestamp": "2026-03-03T22:10:00Z",
  "data": {
    "entityName": "Chuangxin Tecnologia da Informacao Ltda",
    "cnpj": "65089671000116",
    "previousLevel": "MEDIUM",
    "newLevel": "HIGH"
  },
  "signature": "sha256=a1b2c3..."
}

// Validação (TypeScript)
import { createHmac } from 'crypto'

function verifyWebhook(rawBody: string, signature: string, secret: string): boolean {
  const computed = 'sha256=' + createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')
  return computed === signature
}`}</Code>
                    </section>

                    {/* CNPJ API */}
                    <section style={{ marginBottom: '4rem' }}>
                        <SectionTitle id="cnpj-api">Integração — API de CNPJ</SectionTitle>
                        <AlertBox type="info">
                            O serviço interno processa mensalmente o dump da Receita Federal (~55 GB). Nenhuma consulta externa é feita em tempo real.
                        </AlertBox>
                        <Endpoint method="GET" path="/v1/cnpj/:cnpj" permission="Todos os roles" description="Retorna dados cadastrais da Receita Federal." />
                        <Code>{`// GET /v1/cnpj/65089671000116
{
  "data": {
    "cnpj": "65.089.671/0001-16",
    "razaoSocial": "CHUANGXIN TECNOLOGIA DA INFORMACAO LTDA",
    "situacaoCadastral": "ATIVA",
    "dataAbertura": "2022-01-10",
    "naturezaJuridica": "Sociedade Empresária Limitada",
    "atividadePrincipal": "Desenvolvimento de programas de computador sob encomenda",
    "capitalSocial": 100000.00,
    "porte": "MICRO",
    "municipio": "São Paulo",
    "uf": "SP"
  }
}`}</Code>
                    </section>

                    {/* SANCTIONS */}
                    <section style={{ marginBottom: '4rem' }}>
                        <SectionTitle id="sanctions">Integração — Screening de Sanções</SectionTitle>
                        <DataTable
                            headers={['Lista', 'Fonte', 'Atualização']}
                            rows={[
                                ['OFAC SDN', 'U.S. Treasury', 'Diária'],
                                ['Lista ONU (UNSC)', 'UN Security Council', 'Diária'],
                                ['Lista CGU (CEIS/CNEP)', 'CGU Brasil', 'Semanal'],
                                ['Lista COAF', 'COAF Brasil', 'Mensal'],
                                ['Interpol Notices', 'Interpol', 'Semanal'],
                                ['Lista UE', 'EU Sanctions Hub', 'Diária'],
                            ]}
                        />
                        <Endpoint method="POST" path="/v1/entities/:id/screen" permission="COMPLIANCE_OFFICER, ADMIN" description="Dispara screening imediato (síncrono para risco CRITICAL)." />
                    </section>

                    {/* SSO */}
                    <section style={{ marginBottom: '4rem' }}>
                        <SectionTitle id="sso">SAML SSO (Enterprise)</SectionTitle>
                        <AlertBox type="warning">
                            Disponível exclusivamente no plano Enterprise. <Link href="/contato" style={{ color: CYAN }}>Fale com a equipe</Link> para ativação.
                        </AlertBox>
                        <P>Suporte a SAML 2.0 com Okta, Azure AD, Google Workspace e Auth0.</P>
                        <Code>{`Entity ID: https://api.complianceos.com.br/auth/saml/metadata
ACS URL:   https://api.complianceos.com.br/auth/saml/callback
Metadata:  https://api.complianceos.com.br/auth/saml/metadata.xml`}</Code>
                    </section>

                    {/* MOD PLD */}
                    <section style={{ marginBottom: '4rem' }}>
                        <SectionTitle id="mod-pld">Módulo — PLD/FT</SectionTitle>
                        <P>Prevenção à Lavagem de Dinheiro. Baseado na <strong>Lei 9.613/98</strong>, Res. <strong>BACEN 4.753/2019</strong> e Circular <strong>BACEN 3.978/2020</strong>.</P>
                        <DataTable
                            headers={['Checklist', 'Periodicidade', 'Aplica-se a']}
                            rows={[
                                ['Due Diligence Padrão (CDD)', 'Anual', 'CLIENTE, PARCEIRO'],
                                ['Due Diligence Reforçada (EDD)', 'Semestral', 'CLIENTE, PARCEIRO, FORNECEDOR'],
                            ]}
                        />
                    </section>

                    {/* MOD LGPD */}
                    <section style={{ marginBottom: '4rem' }}>
                        <SectionTitle id="mod-lgpd">Módulo — LGPD</SectionTitle>
                        <P>Conformidade com a <strong>Lei 13.709/18</strong> e Resoluções da ANPD.</P>
                        <DataTable
                            headers={['Funcionalidade', 'Referência Legal']}
                            rows={[
                                ['Mapeamento de atividades (RAT)', 'Art. 37, LGPD'],
                                ['Atendimento de titulares', 'Art. 18 + Res. ANPD 02/2022 (SLA 15 dias)'],
                                ['Registro de incidentes', 'Art. 48 + Res. ANPD 01/2021 (2 dias úteis)'],
                                ['Avaliação de DPAs de fornecedores', 'Art. 39, LGPD'],
                                ['RIPD (Relatório de Impacto)', 'Art. 38, LGPD'],
                            ]}
                        />
                    </section>

                    {/* MOD ANTICORRUPCAO */}
                    <section style={{ marginBottom: '4rem' }}>
                        <SectionTitle id="mod-anticorrupcao">Módulo — Anticorrupção</SectionTitle>
                        <P>Programa de Integridade baseado na <strong>Lei 12.846/13</strong> e <strong>Decreto 11.129/2022</strong> — 5 pilares da CGU.</P>
                        <DataTable
                            headers={['Pilar', 'Descrição']}
                            rows={[
                                ['1 — Comprometimento', 'Tone at the top — comprometimento formal da Alta Direção'],
                                ['2 — Instância Responsável', 'Área com autonomia e governança independente'],
                                ['3 — Análise de Risco', 'Mapeamento e mitigação de riscos de corrupção'],
                                ['4 — Estrutura Normativa', 'Código de Conduta, Canal de Denúncias, DDI de terceiros'],
                                ['5 — Monitoramento', 'Auditoria periódica e atualização do programa'],
                            ]}
                        />
                    </section>

                    {/* CTA */}
                    <div style={{ padding: '2rem', border: `1px solid ${LINE}`, background: SURFACE, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: '1.5rem' }}>
                        <div>
                            <div style={{ fontFamily: UI, fontWeight: 600, fontSize: '1rem', color: TEXT, marginBottom: '.375rem' }}>Precisa de ajuda?</div>
                            <p style={{ fontFamily: UI, fontSize: '.875rem', color: MUTED }}>Nossa equipe está disponível para integrações complexas e customizações.</p>
                        </div>
                        <Link href="/contato" style={{ display: 'inline-flex', alignItems: 'center', padding: '.625rem 1.25rem', background: CYAN, color: '#FFFFFF', fontFamily: UI, fontWeight: 500, fontSize: '.8125rem', letterSpacing: '.04em', textTransform: 'uppercase' as const, textDecoration: 'none' }}>
                            Falar com especialista →
                        </Link>
                    </div>
                </main>
            </div>

            <PublicFooter />
        </div>
    )
}
