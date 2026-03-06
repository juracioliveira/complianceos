'use client'
import Link from 'next/link'
import { PublicNav, PublicFooter } from '@/components/public/PublicLayout'

/* ─── SHARED COMPONENTS ─── */
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
function EndpointBlock({ method, path, permission, description, children }: { method: string; path: string; permission: string; description: string; children: React.ReactNode }) {
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

export function EntitiesApiClient() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
      <PublicNav />

      {/* HERO */}
      <section className="pt-32 pb-12 border-b border-slate-200" style={{ backgroundImage: `linear-gradient(#e2e8f0 1px,transparent 1px),linear-gradient(90deg,#e2e8f0 1px,transparent 1px)`, backgroundSize: '80px 80px' }}>
        <div className="max-w-[1100px] mx-auto px-6 md:px-12">
          <p className="font-mono text-[0.7rem] text-slate-500 uppercase tracking-widest mb-4">
            <Link href="/" className="hover:text-brand-600 transition-colors">ComplianceOS</Link> / <Link href="/docs" className="hover:text-brand-600 transition-colors">Docs</Link> / Entidades
          </p>
          <h1 className="font-serif text-[clamp(1.75rem,3vw,2.75rem)] text-slate-900 mb-3">API — Entidades</h1>
          <p className="text-base text-slate-600 max-w-2xl leading-relaxed">Gerencie o portfólio de entidades (clientes, fornecedores, parceiros) sujeitas à due diligence. O módulo de KYB é disparado automaticamente ao criar ou atualizar uma entidade.</p>
          <div className="flex gap-2.5 mt-5 flex-wrap">
            <Badge label="Base URL: https://api.complianceos.com.br/v1/entities" type="info" />
            <Badge label="RLS — Isolamento por tenant_id" type="success" />
            <Badge label="KYB Automático" type="brand" />
          </div>
        </div>
      </section>

      <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-16">

        {/* SCHEMA */}
        <Section id="schema" title="Schema da Entidade">
          <P>O objeto <code className="font-mono text-[0.85em] text-brand-600 bg-brand-50 px-1 py-0.5 rounded">Entity</code> representa qualquer pessoa jurídica ou física monitorada pela plataforma.</P>
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
              O campo <code className="font-mono">entityId</code> retornado pode ser usado imediatamente para iniciar um checklist mesmo antes do KYB terminar.
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
              Entidades não são removidas permanentemente. O status é alterado para <code className="font-mono">BLOCKED</code> e todos os dados históricos são preservados por 5 anos conforme exigência regulatória.
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
          <P>Todas as queries são automaticamente filtradas pelo <code className="font-mono text-[0.85em] text-brand-600 bg-brand-50 px-1 py-0.5 rounded">tenant_id</code> via PostgreSQL Row-Level Security. É impossível acessar entidades de outro tenant mesmo com um bug na camada de aplicação.</P>

          <H3>Score de Risco</H3>
          <P>O campo <code className="font-mono text-[0.85em] text-brand-600 bg-brand-50 px-1 py-0.5 rounded">riskScore</code> na entidade é um <strong>cache</strong> do último <code className="font-mono text-[0.85em] px-1 py-0.5 bg-slate-100 rounded text-slate-700">risk_assessment</code>. A fonte de verdade são os registros em <code className="font-mono text-[0.85em] px-1 py-0.5 bg-slate-100 rounded text-slate-700">/v1/entities/:id/risk-assessments</code>. O score é calculado como:</P>
          <Code>{`score = (pldFt.score * 0.4) + (lgpd.score * 0.3) + (anticorrupcao.score * 0.3)

// Mapeamento score → riskLevel
score < 30  → CRITICAL
30 ≤ score < 50 → HIGH
50 ≤ score < 70 → MEDIUM
score ≥ 70  → LOW`}</Code>

          <H3>Busca Full-text</H3>
          <P>O parâmetro <code className="font-mono text-[0.85em] text-brand-600 bg-brand-50 px-1 py-0.5 rounded">search</code> usa o índice de trigrama (<code className="font-mono text-[0.85em] px-1 py-0.5 bg-slate-100 rounded text-slate-700">pg_trgm</code>) sobre o campo <code className="font-mono text-[0.85em] px-1 py-0.5 bg-slate-100 rounded text-slate-700">name</code>. Busca por similaridade — não requer correspondência exata. Mínimo de 3 caracteres para ativação do índice.</P>
        </Section>

        {/* NAV */}
        <div className="flex justify-between pt-10 border-t border-slate-200">
          <Link href="/docs" className="font-medium text-[0.875rem] text-brand-600 hover:text-brand-700 flex items-center gap-1.5 transition-colors">← Voltar para Docs</Link>
          <Link href="/docs/api/checklists" className="font-medium text-[0.875rem] text-brand-600 hover:text-brand-700 flex items-center gap-1.5 transition-colors">API de Checklists →</Link>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
