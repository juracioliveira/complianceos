'use client'
import Link from 'next/link'
import { useState } from 'react'
import { PublicNav, PublicFooter } from '@/components/public/PublicLayout'

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
            { id: 'api-entities', label: 'Entidades ↗', href: '/docs/api/entities' },
            { id: 'api-checklists', label: 'Checklists ↗', href: '/docs/api/checklists' },
            { id: 'api-documents', label: 'Documentos' },
            { id: 'api-audit', label: 'Audit Trail ↗', href: '/docs/api/audit' },
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
    const colors: Record<string, string> = {
        GET: 'text-green-600 bg-green-50 border-green-200',
        POST: 'text-sky-600 bg-sky-50 border-sky-200',
        PATCH: 'text-amber-600 bg-amber-50 border-amber-200',
        DELETE: 'text-red-600 bg-red-50 border-red-200',
        PUT: 'text-amber-600 bg-amber-50 border-amber-200'
    }
    return (
        <span className={`font-mono text-[0.6rem] font-semibold px-2 py-0.5 border rounded ${colors[method]}`}>{method}</span>
    )
}

function Code({ children }: { children: string }) {
    return (
        <pre className="font-mono text-[0.78rem] leading-relaxed p-5 bg-slate-900 text-slate-200 overflow-x-auto my-4 whitespace-pre-wrap break-all rounded-lg">
            <code>{children}</code>
        </pre>
    )
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
    return (
        <span className={`font-mono text-[0.6rem] px-2 py-0.5 border rounded ${styles[type]}`}>{label}</span>
    )
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
    return (
        <h2 id={id} className="font-serif text-[clamp(1.35rem,2vw,1.75rem)] text-slate-900 mb-4 pb-3 border-b border-slate-200 scroll-mt-24">
            {children}
        </h2>
    )
}

function SubTitle({ children, id }: { children: React.ReactNode; id?: string }) {
    return (
        <h3 id={id} className="font-semibold text-base text-slate-900 mt-8 mb-3 scroll-mt-24">
            {children}
        </h3>
    )
}

function P({ children }: { children: React.ReactNode }) {
    return <p className="text-[0.875rem] text-slate-600 leading-relaxed mb-3">{children}</p>
}

function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
    return (
        <div className="overflow-x-auto my-4 border border-slate-200 rounded-lg">
            <table className="w-full border-collapse text-[0.8125rem] text-left">
                <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                        {headers.map(h => (
                            <th key={h} className="p-3 font-semibold text-slate-900">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className="border-b border-slate-200 last:border-0 bg-white">
                            {row.map((cell, j) => (
                                <td key={j} className="p-3 text-slate-600 align-top">{cell}</td>
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
        <div className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-lg mb-3 shadow-sm">
            <Tag method={method} />
            <div className="flex-1">
                <code className="font-mono text-[0.8125rem] text-slate-900 font-medium">{path}</code>
                {permission && <div className="text-[0.75rem] text-slate-500 mt-1">Permissão: <strong className="text-slate-700">{permission}</strong></div>}
                {description && <div className="text-[0.8125rem] text-slate-600 mt-1 leading-relaxed">{description}</div>}
            </div>
        </div>
    )
}

function AlertBox({ type, children }: { type: 'info' | 'warning' | 'danger' | 'success'; children: React.ReactNode }) {
    const cfg = {
        info: { styles: 'bg-sky-50 border-sky-500 text-sky-600', icon: 'ℹ', text: 'text-slate-700' },
        warning: { styles: 'bg-amber-50 border-amber-500 text-amber-600', icon: '⚠', text: 'text-slate-700' },
        danger: { styles: 'bg-red-50 border-red-500 text-red-600', icon: '✕', text: 'text-slate-700' },
        success: { styles: 'bg-green-50 border-green-500 text-green-600', icon: '✓', text: 'text-slate-700' },
    }[type]
    return (
        <div className={`flex gap-3 p-4 my-4 border-l-4 rounded-r-lg ${cfg.styles}`}>
            <span className="font-mono text-[0.9rem] leading-relaxed shrink-0">{cfg.icon}</span>
            <div className={`text-[0.8125rem] leading-relaxed ${cfg.text}`}>{children}</div>
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

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
            <PublicNav />

            {/* HERO */}
            <section className="pt-32 pb-16 border-b border-slate-200" style={{
                backgroundImage: `linear-gradient(#e2e8f0 1px,transparent 1px),linear-gradient(90deg,#e2e8f0 1px,transparent 1px)`,
                backgroundSize: '80px 80px',
            }}>
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <p className="font-mono text-[0.7rem] text-slate-500 uppercase tracking-widest mb-6">
                        <Link href="/" className="hover:text-brand-600 transition-colors">ComplianceOS</Link>{' / '}Documentação
                    </p>
                    <h1 className="font-serif text-[clamp(2rem,4vw,3.25rem)] text-slate-900 mb-4 max-w-3xl leading-tight">
                        Documentação Técnica
                    </h1>
                    <p className="text-[1.0625rem] text-slate-600 max-w-2xl leading-relaxed mb-8">
                        Referência completa da API REST, guias de integração e documentação dos módulos de compliance.
                        Base URL: <code className="font-mono text-[0.85em] text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">https://api.complianceos.com.br</code>
                    </p>
                    <div className="flex gap-3 flex-wrap">
                        {[['v1 — Estável', 'success'], ['JWT RS256', 'brand'], ['RFC 7807', 'info'], ['OpenAPI 3.1', 'info']].map(([label, type]) => (
                            <Badge key={label as string} label={label as string} type={type as any} />
                        ))}
                    </div>
                </div>
            </section>

            {/* LAYOUT */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row min-h-[80vh]">

                {/* SIDEBAR */}
                <aside className="md:w-[260px] md:shrink-0 md:border-r border-slate-200 py-10 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:overflow-y-auto">
                    {NAV.map(section => (
                        <div key={section.group} className="mb-8">
                            <div className="font-mono text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest px-6 mb-3">
                                {section.group}
                            </div>
                            {section.items.map(item =>
                                (item as any).href
                                    ? (
                                        <Link key={item.id} href={(item as any).href} className="block px-6 py-2 text-[0.8125rem] font-medium text-slate-600 hover:text-brand-600 hover:bg-slate-100 transition-colors border-l-2 border-transparent hover:border-brand-500">
                                            {item.label}
                                        </Link>
                                    )
                                    : (
                                        <button key={item.id} onClick={() => scrollTo(item.id)} className={`block w-full text-left px-6 py-2 text-[0.8125rem] font-medium transition-colors border-l-2 border-transparent ${active === item.id ? 'text-brand-600 bg-brand-50 border-brand-500' : 'text-slate-600 hover:text-brand-600 hover:bg-slate-100'}`}>
                                            {item.label}
                                        </button>
                                    )
                            )}
                        </div>
                    ))}
                </aside>

                {/* CONTENT */}
                <main className="flex-1 py-12 px-6 md:px-14 max-w-4xl">

                    {/* INTRO */}
                    <section className="mb-16">
                        <SectionTitle id="intro">Visão Geral da API</SectionTitle>
                        <P>A API ComplianceOS é uma interface REST autenticada via JWT (RS256) que expõe todos os recursos da plataforma. Todos os endpoints seguem o versionamento <code className="font-mono text-[0.85em] text-brand-600 bg-brand-50 px-1 py-0.5 rounded">/v1/</code> e retornam JSON.</P>
                        <P>A solução é desenvolvida e operada por <strong>CHUANGXIN TECNOLOGIA DA INFORMACAO LTDA</strong> (CNPJ <strong>65.089.671/0001-16</strong>), em conformidade com a LGPD e normas do BACEN.</P>
                        <AlertBox type="info">
                            <strong>Sandbox disponível:</strong> Use <code className="font-mono">https://sandbox-api.complianceos.com.br</code> para testes sem afetar dados de produção.
                        </AlertBox>
                        <DataTable
                            headers={['Ambiente', 'Base URL', 'Status']}
                            rows={[
                                ['Produção', <code key="p" className="font-mono text-[0.8rem] text-slate-800">https://api.complianceos.com.br</code>, <Badge key="ps" label="Estável" type="success" />],
                                ['Sandbox', <code key="s" className="font-mono text-[0.8rem] text-slate-800">https://sandbox-api.complianceos.com.br</code>, <Badge key="ss" label="Disponível" type="info" />],
                            ]}
                        />
                    </section>

                    {/* QUICK START */}
                    <section className="mb-16">
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
                    <section className="mb-16">
                        <SectionTitle id="auth">Autenticação</SectionTitle>
                        <P>Todos os endpoints (exceto <code className="font-mono text-[0.85em] text-brand-600 bg-brand-50 px-1 py-0.5 rounded">/v1/auth/*</code>) requerem Bearer Token JWT RS256 com expiração de <strong>15 minutos</strong>.</P>
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
                                [<Badge key="a" label="ADMIN" type="danger" />, 'Administrador do tenant', 'Completo'],
                                [<Badge key="b" label="COMPLIANCE_OFFICER" type="brand" />, 'Responsável de compliance', 'Leitura/Escrita'],
                                [<Badge key="c" label="ANALYST" type="info" />, 'Analista de compliance', 'Leitura/Escrita limitado'],
                                [<Badge key="d" label="AUDITOR" type="warning" />, 'Auditor externo', 'Somente leitura + Audit Trail'],
                                [<Badge key="e" label="READONLY" type="muted" />, 'Visualização', 'Somente leitura'],
                            ]}
                        />
                        <SubTitle>Renovação de Token</SubTitle>
                        <Code>{`curl -X POST https://api.complianceos.com.br/v1/auth/refresh \\
  -H "Content-Type: application/json" \\
  -d '{ "refreshToken": "eyJhbGci..." }'`}</Code>
                    </section>

                    {/* ERRORS */}
                    <section className="mb-16">
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
                    <section className="mb-16">
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
                    <section className="mb-16">
                        <SectionTitle id="rate-limits">Rate Limits</SectionTitle>
                        <DataTable
                            headers={['Plano', 'Req/minuto', 'Burst']}
                            rows={[
                                [<Badge key="s" label="Starter" type="muted" />, '120', '20 req/s'],
                                [<Badge key="p" label="Professional" type="brand" />, '600', '50 req/s'],
                                [<Badge key="e" label="Enterprise" type="info" />, '3.000', '200 req/s'],
                            ]}
                        />
                        <Code>{`# Headers de resposta
X-RateLimit-Limit: 600
X-RateLimit-Remaining: 487
X-RateLimit-Reset: 1708123500
Retry-After: 45   # apenas quando 429`}</Code>
                    </section>

                    {/* API ENTITIES */}
                    <section className="mb-16">
                        <SectionTitle id="api-entities">API — Entidades</SectionTitle>
                        <P>Gerencie o portfólio de entidades (clientes, fornecedores, parceiros) sujeitas à due diligence.</P>
                        <Endpoint method="GET" path="/v1/entities" permission="ANALYST, COMPLIANCE_OFFICER, ADMIN, AUDITOR, READONLY" description="Lista com filtros: ?filter[risk_level]=HIGH&filter[status]=ACTIVE&search=acme" />
                        <Endpoint method="POST" path="/v1/entities" permission="COMPLIANCE_OFFICER, ADMIN" description="Cria entidade. KYB é disparado automaticamente em background." />
                        <Endpoint method="GET" path="/v1/entities/:id" permission="Todos os roles" />
                        <Endpoint method="PATCH" path="/v1/entities/:id" permission="COMPLIANCE_OFFICER, ADMIN" description="Atualiza dados. Alteração de CNPJ dispara novo KYB." />
                        <Endpoint method="POST" path="/v1/entities/:id/screen" permission="COMPLIANCE_OFFICER, ADMIN" description="Screening de sanções imediato." />
                        <Endpoint method="GET" path="/v1/entities/:id/risk-assessments" permission="ANALYST, COMPLIANCE_OFFICER, ADMIN, AUDITOR" description="Histórico de avaliações de risco com fatores detalhados por módulo." />
                        <div className="mt-6 p-5 bg-brand-50 border border-brand-200 rounded-lg">
                            <Link href="/docs/api/entities" className="font-semibold text-[0.875rem] text-brand-600 hover:text-brand-700">Ver documentação completa de Entidades →</Link>
                            <p className="text-[0.8125rem] text-slate-600 mt-2">Schema completo, exemplos de erro, parâmetros de filtro e notas de implementação (RLS, scoring, full-text).</p>
                        </div>
                    </section>

                    {/* API CHECKLISTS */}
                    <section className="mb-16">
                        <SectionTitle id="api-checklists">API — Checklists</SectionTitle>
                        <P>Execute due diligences baseadas nas regulamentações Lei 9.613/98, Lei 12.846/13 e LGPD.</P>
                        <Endpoint method="GET" path="/v1/checklists" permission="Todos os roles" description="Lista templates. Parâmetro: ?module=PLD_FT|LGPD|ANTICORRUPCAO" />
                        <Endpoint method="POST" path="/v1/checklist-runs" permission="ANALYST, COMPLIANCE_OFFICER, ADMIN" description="Cria execução (alias: /v1/checklists/run). Modo rascunho com answers vazio." />
                        <Endpoint method="PATCH" path="/v1/checklist-runs/:id" permission="ANALYST, COMPLIANCE_OFFICER, ADMIN" description="Atualiza respostas parciais (autosave a cada 30s)." />
                        <Endpoint method="POST" path="/v1/checklist-runs/:id/complete" permission="COMPLIANCE_OFFICER, ADMIN" description="Finaliza. Score calculado e risco atualizado automaticamente." />
                        <AlertBox type="warning">
                            <strong>Imutabilidade:</strong> Execuções <code className="font-mono">COMPLETED</code> são imutáveis por garantia regulatória (trigger no banco).
                        </AlertBox>
                        <div className="mt-6 p-5 bg-brand-50 border border-brand-200 rounded-lg">
                            <Link href="/docs/api/checklists" className="font-semibold text-[0.875rem] text-brand-600 hover:text-brand-700">Ver documentação completa de Checklists →</Link>
                            <p className="text-[0.8125rem] text-slate-600 mt-2">Schema de ChecklistItem e ChecklistRun, algoritmo de score, catálogo de templates por módulo e autosave.</p>
                        </div>
                    </section>

                    {/* API DOCUMENTS */}
                    <section className="mb-16">
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
                    <section className="mb-16">
                        <SectionTitle id="api-audit">API — Audit Trail</SectionTitle>
                        <AlertBox type="danger">Acesso restrito a <strong>AUDITOR</strong> e <strong>ADMIN</strong>. Consultas de audit são registradas para meta-auditoria.</AlertBox>
                        <Endpoint method="GET" path="/v1/audit/events" permission="AUDITOR, ADMIN" description="Consulta com filtros: ?from=ISO&to=ISO&module=PLD_FT&limit=100" />
                        <Endpoint method="POST" path="/v1/exports/regulators" permission="COMPLIANCE_OFFICER, ADMIN" description="Exportação para ANPD, BACEN, CGU, COAF em PDF/XLSX/JSON." />
                        <Endpoint method="GET" path="/v1/audit/chain/verify" permission="ADMIN" description="Verifica integridade do hash chain do tenant." />
                        <div className="mt-6 p-5 bg-brand-50 border border-brand-200 rounded-lg">
                            <Link href="/docs/api/audit" className="font-semibold text-[0.875rem] text-brand-600 hover:text-brand-700">Ver documentação completa de Audit Trail →</Link>
                            <p className="text-[0.8125rem] text-slate-600 mt-2">Hash chain, catálogo de actions, exportação para reguladores e política de retenção de 5 anos.</p>
                        </div>
                    </section>

                    {/* API USERS */}
                    <section className="mb-16">
                        <SectionTitle id="api-users">API — Usuários</SectionTitle>
                        <Endpoint method="GET" path="/v1/users" permission="ADMIN" description="Lista todos os usuários do tenant." />
                        <Endpoint method="POST" path="/v1/users/invite" permission="ADMIN" description="Convida usuário por e-mail. Convite expira em 48h." />
                        <Endpoint method="PATCH" path="/v1/users/:id" permission="ADMIN (outros) / Qualquer (próprio)" description="Altera role ou status." />
                    </section>

                    {/* API DASHBOARD */}
                    <section className="mb-16">
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
                    <section className="mb-16">
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
                    <section className="mb-16">
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
                    <section className="mb-16">
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
                    <section className="mb-16">
                        <SectionTitle id="sso">SAML SSO (Enterprise)</SectionTitle>
                        <AlertBox type="warning">
                            Disponível exclusivamente no plano Enterprise. <Link href="/contato" className="text-amber-700 hover:text-amber-800 underline">Fale com a equipe</Link> para ativação.
                        </AlertBox>
                        <P>Suporte a SAML 2.0 com Okta, Azure AD, Google Workspace e Auth0.</P>
                        <Code>{`Entity ID: https://api.complianceos.com.br/auth/saml/metadata
ACS URL:   https://api.complianceos.com.br/auth/saml/callback
Metadata:  https://api.complianceos.com.br/auth/saml/metadata.xml`}</Code>
                    </section>

                    {/* MOD PLD */}
                    <section className="mb-16">
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
                    <section className="mb-16">
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
                    <section className="mb-16">
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
                    <div className="p-8 border border-slate-200 bg-white rounded-xl shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-6 mt-8">
                        <div>
                            <div className="font-semibold text-base text-slate-900 mb-2">Precisa de ajuda?</div>
                            <p className="text-[0.9375rem] text-slate-600">Nossa equipe está disponível para integrações complexas e customizações.</p>
                        </div>
                        <Link href="/contato" className="shrink-0 inline-flex items-center justify-center px-6 py-3 bg-brand-600 text-white font-medium text-[0.875rem] rounded-lg shadow-sm shadow-brand-600/20 hover:bg-brand-700 transition-colors uppercase tracking-wide">
                            Falar com especialista →
                        </Link>
                    </div>
                </main>
            </div>

            <PublicFooter />
        </div>
    )
}
