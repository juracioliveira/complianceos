import Link from 'next/link'
import { ShieldCheck, Lock, FileText, BarChart3, ArrowRight, CheckCircle, Server, Key, Activity } from 'lucide-react'

/* ─── Design tokens ─────────────────────────────── */
const BG = '#FFFFFF'
const SURFACE = '#F9FAFB'
const SURFACE2 = '#F3F4F6'
const CYAN = '#00A3BF'
const AMBER = '#D97706'
const TEXT = '#0F172A'
const MUTED = '#475569'
const LINE = 'rgba(0,0,0,0.06)'
const LINE_STRONG = 'rgba(0,0,0,0.12)'
const MONO = "'IBM Plex Mono', monospace"
const SERIF = "'DM Serif Display', serif"
const UI = "'IBM Plex Sans', sans-serif"
const GREEN = '#10B981'
const RED = '#EF4444'

/* ─── Shared styles ──────────────────────────────── */
const S = {
    section: { borderTop: `1px solid ${LINE}`, padding: '7rem 0' } as React.CSSProperties,
    wrap: { maxWidth: 1200, margin: '0 auto', padding: '0 3rem' } as React.CSSProperties,
    pre: { fontFamily: MONO, fontSize: '.7rem', color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '.12em', marginBottom: '1.25rem' },
    h2: { fontFamily: SERIF, fontSize: 'clamp(1.75rem,3vw,2.75rem)', color: TEXT, marginBottom: '1rem', fontWeight: 'normal' as const, lineHeight: 1.15 },
    p: { color: MUTED, fontSize: '.9375rem', lineHeight: 1.75 },
    btnFill: {
        display: 'inline-flex' as const, alignItems: 'center' as const, gap: '.5rem',
        padding: '.625rem 1.25rem', background: CYAN, color: '#FFFFFF',
        border: `1px solid ${CYAN}`, fontFamily: UI, fontWeight: 500,
        fontSize: '.8125rem', letterSpacing: '.04em', textTransform: 'uppercase' as const,
        textDecoration: 'none', transition: 'all .18s',
    },
    btnLine: {
        display: 'inline-flex' as const, alignItems: 'center' as const, gap: '.5rem',
        padding: '.625rem 1.25rem', background: 'transparent', color: TEXT,
        border: `1px solid ${LINE_STRONG}`, fontFamily: UI, fontWeight: 500,
        fontSize: '.8125rem', letterSpacing: '.04em', textTransform: 'uppercase' as const,
        textDecoration: 'none', transition: 'all .18s',
    },
}

/* ─── SVG icon helpers ───────────────────────────── */
function IconBox({ icon, color = CYAN }: { icon: React.ReactNode; color?: string }) {
    return (
        <div style={{
            width: 44, height: 44, border: `1px solid ${LINE_STRONG}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1.5rem', color,
        }}>
            {icon}
        </div>
    )
}

/* ─── HERO ───────────────────────────────────────── */
function Hero() {
    return (
        <section style={{
            minHeight: '100vh', padding: '10rem 0 6rem',
            display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden',
            backgroundImage: `linear-gradient(${LINE} 1px,transparent 1px),linear-gradient(90deg,${LINE} 1px,transparent 1px)`,
            backgroundSize: '80px 80px',
        }}>
            <div style={S.wrap}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'center' }}>
                    <div>
                        <p style={{ ...S.pre, display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '2rem' }}>
                            <span style={{ display: 'block', width: 24, height: 1, background: CYAN }} />
                            Plataforma regulatória · BACEN / COAF / ANPD
                        </p>
                        <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(2.5rem,4.5vw,4rem)', color: TEXT, marginBottom: '1.75rem', fontWeight: 'normal', lineHeight: 1.1 }}>
                            Conformidade regulatória.<br />
                            <em style={{ color: CYAN, fontStyle: 'italic' }}>Sem travar<br />sua operação.</em>
                        </h1>
                        <p style={{ ...S.p, maxWidth: 480, marginBottom: '2.5rem' }}>
                            O ComplianceOS automatiza PLD-FT, LGPD e Anticorrupção para fintechs e PMEs brasileiras — do KYC ao relatório COAF, com trilha de auditoria imutável.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <Link href="/dashboard" style={S.btnFill}>Começar Grátis <ArrowRight size={14} /></Link>
                            <Link href="#solutions" style={S.btnLine}>Ver a Plataforma</Link>
                        </div>
                    </div>

                    {/* Entity table */}
                    <div style={{ background: SURFACE, border: `1px solid ${LINE_STRONG}`, overflow: 'hidden' }}>
                        <div style={{ padding: '.875rem 1.25rem', borderBottom: `1px solid ${LINE}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontFamily: MONO, fontSize: '.7rem', color: MUTED, textTransform: 'uppercase', letterSpacing: '.06em' }}>Entidades Monitoradas</span>
                            <span style={{ fontFamily: MONO, fontSize: '.65rem', color: CYAN, display: 'flex', alignItems: 'center', gap: '.375rem' }}>
                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: CYAN, display: 'inline-block' }} />
                                Tempo real
                            </span>
                        </div>
                        {/* Column headers */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '.5rem 1.25rem', borderBottom: `1px solid ${LINE}` }}>
                            {['Entidade', 'Score', 'PEP', 'Status'].map(c => (
                                <span key={c} style={{ fontFamily: MONO, fontSize: '.65rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em' }}>{c}</span>
                            ))}
                        </div>
                        {/* Rows */}
                        {[
                            { name: 'Acme Fintech Ltda.', cnpj: '35.123.456/0001-78', score: 91, pep: false, status: 'ok' },
                            { name: 'Beta Holdings S.A.', cnpj: '12.987.654/0001-22', score: 64, pep: true, status: 'warn' },
                            { name: 'LATAM Holdings Int.', cnpj: '98.765.432/0001-01', score: 23, pep: false, status: 'crit' },
                            { name: 'NovaPay Serviços', cnpj: '55.443.221/0001-90', score: 88, pep: false, status: 'ok' },
                        ].map(row => (
                            <div key={row.cnpj} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '.75rem 1.25rem', borderBottom: `1px solid ${LINE}`, alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '.8125rem', color: TEXT }}>{row.name}</div>
                                    <div style={{ fontFamily: MONO, fontSize: '.65rem', color: MUTED }}>{row.cnpj}</div>
                                </div>
                                <span style={{ fontFamily: MONO, fontSize: '.75rem', fontWeight: 500, color: row.score >= 80 ? GREEN : row.score >= 50 ? AMBER : RED }}>{row.score}</span>
                                <span style={{ fontFamily: MONO, fontSize: '.7rem', color: row.pep ? AMBER : '#94A3B8' }}>{row.pep ? 'PEP' : 'Não'}</span>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: row.status === 'ok' ? GREEN : row.status === 'warn' ? AMBER : RED, display: 'inline-block' }} />
                            </div>
                        ))}
                        <div style={{ padding: '.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontFamily: MONO, fontSize: '.65rem', color: '#94A3B8' }}>847 entidades · 3 alertas ativos</span>
                            <Link href="/dashboard" style={{ fontFamily: MONO, fontSize: '.65rem', color: CYAN, textDecoration: 'none' }}>Ver todas →</Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

/* ─── STATS ──────────────────────────────────────── */
function Stats() {
    const items = [
        { num: '70', sup: '%', label: 'Redução no tempo de onboarding KYC/KYB' },
        { num: '12', sup: '+', label: 'Frameworks regulatórios cobertos' },
        { num: '99', sup: '.9%', label: 'Disponibilidade SLA com infra AWS' },
        { num: '0', sup: '', label: 'Planilhas manuais no processo de PLD' },
    ]
    return (
        <section style={{ borderTop: `1px solid ${LINE}`, padding: '4rem 0' }}>
            <div style={S.wrap}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
                    {items.map((s, i) => (
                        <div key={i} style={{ padding: '2.5rem 2rem', borderRight: i < 3 ? `1px solid ${LINE}` : undefined }}>
                            <div style={{ fontFamily: SERIF, fontSize: '3rem', color: TEXT, lineHeight: 1, marginBottom: '.5rem' }}>
                                {s.num}<sup style={{ fontFamily: UI, fontSize: '1rem', color: MUTED, fontWeight: 300 }}>{s.sup}</sup>
                            </div>
                            <div style={{ fontSize: '.8125rem', color: MUTED, maxWidth: 160, lineHeight: 1.5 }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

/* ─── SOLUTIONS ──────────────────────────────────── */
function Solutions() {
    const cards = [
        {
            num: '01', icon: <ShieldCheck size={18} strokeWidth={1.5} />, title: 'PLD-FT & Sanções',
            desc: 'Monitoramento contínuo de listas restritivas, identificação de PEPs e cálculo de risco automatizado — alinhado à Lei 9.613/98 e Res. BCB 50.',
            tags: ['Screening OFAC / ONU / COAF', 'Detecção PEP nacional e internacional', 'Score de risco em tempo real', 'Workflow de investigação integrado'],
            color: CYAN,
        },
        {
            num: '02', icon: <Lock size={18} strokeWidth={1.5} />, title: 'Privacidade LGPD',
            desc: 'Registro de operações de tratamento, gestão de consentimento, resposta a titulares e adequação para multas ANPD — conforme Lei 13.709/18.',
            tags: ['RAT — Registro de Atividades de Tratamento', 'Relatórios de Impacto (RIPD)', 'Fluxo de exclusão de dados', 'Logs imutáveis por titular'],
            color: CYAN,
        },
        {
            num: '03', icon: <FileText size={18} strokeWidth={1.5} />, title: 'Governança & Anticorrupção',
            desc: 'Due diligence de fornecedores B2B, scoring de risco e trilha de auditoria imutável — exigida pela Lei Anticorrupção 12.846/13.',
            tags: ['Due diligence estruturada de fornecedores', 'Exportação PDF certificada para auditores', 'Checklists personalizados por setor', 'Audit Trail criptograficamente seguro'],
            color: AMBER,
        },
    ]
    return (
        <section id="solutions" style={S.section}>
            <div style={S.wrap}>
                <p style={S.pre}>Três módulos. Um centro de controle.</p>
                <h2 style={S.h2}>O cenário regulatório brasileiro é complexo.<br />Nós tornamos gerenciável.</h2>
                <p style={{ ...S.p, maxWidth: 580, marginBottom: '4rem' }}>
                    Conformidade não é opcional para fintechs e PMEs sob escrutínio do BACEN, COAF e ANPD.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', border: `1px solid ${LINE}` }}>
                    {cards.map((c, i) => (
                        <div key={c.num} style={{ padding: '2.5rem', borderRight: i < 2 ? `1px solid ${LINE}` : undefined }}>
                            <div style={{ height: 1, background: LINE, marginBottom: '2rem', transition: 'background .2s' }} />
                            <span style={{ fontFamily: MONO, fontSize: '.65rem', color: '#94A3B8', letterSpacing: '.08em', marginBottom: '1.5rem', display: 'block' }}>{c.num}</span>
                            <IconBox icon={c.icon} color={c.color} />
                            <div style={{ fontFamily: UI, fontWeight: 600, fontSize: '1.0625rem', color: TEXT, marginBottom: '.875rem' }}>{c.title}</div>
                            <p style={{ ...S.p, fontSize: '.9rem', marginBottom: '1.75rem' }}>{c.desc}</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '.375rem' }}>
                                {c.tags.map(t => (
                                    <span key={t} style={{ fontFamily: MONO, fontSize: '.7rem', color: '#94A3B8', paddingLeft: '.875rem', position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: 0 }}>—</span>{t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

/* ─── STACK ──────────────────────────────────────── */
function Stack() {
    const items = [
        { icon: <Key size={20} strokeWidth={1.5} />, name: 'Isolamento de Dados', desc: 'Multi-tenant com RLS no PostgreSQL. Sem compartilhamento entre tenants.' },
        { icon: <Server size={20} strokeWidth={1.5} />, name: 'Alta Disponibilidade', desc: 'SLA 99,9% · AWS ECS Fargate · Multi-AZ · Auto-scaling.' },
        { icon: <ShieldCheck size={20} strokeWidth={1.5} />, name: 'Segurança Zero-Trust', desc: 'JWT RS256 · MFA TOTP · WAF + Shield · Criptografia end-to-end.' },
        { icon: <Activity size={20} strokeWidth={1.5} />, name: 'Observabilidade', desc: 'Datadog APM · Audit logs imutáveis · SOC 2 ready.' },
    ]
    return (
        <section style={{ ...S.section, background: SURFACE }}>
            <div style={S.wrap}>
                <p style={S.pre}>Infraestrutura</p>
                <h2 style={S.h2}>Enterprise-grade, sem overhead enterprise.</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '2rem', marginTop: '4rem' }}>
                    {items.map(s => (
                        <div key={s.name} style={{ padding: '2rem', border: `1px solid ${LINE}`, background: BG }}>
                            <div style={{ color: CYAN, marginBottom: '1rem' }}>{s.icon}</div>
                            <div style={{ fontFamily: UI, fontWeight: 600, fontSize: '.9375rem', color: TEXT, marginBottom: '.5rem' }}>{s.name}</div>
                            <div style={{ fontFamily: MONO, fontSize: '.8rem', color: MUTED, lineHeight: 1.5 }}>{s.desc}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

/* ─── PRICING ────────────────────────────────────── */
function Pricing() {
    const plans = [
        {
            tier: 'Starter', price: 'R$ 890', period: '/ mês',
            desc: 'Para PMEs iniciando a jornada de conformidade regulatória.',
            features: ['Até 100 entidades monitoradas', 'Módulos PLD-FT e LGPD', 'Screening básico OFAC/ONU', 'Audit Trail padrão', 'Exportação PDF', 'Suporte por e-mail'],
            featured: false,
        },
        {
            tier: 'Growth', price: 'R$ 2.490', period: '/ mês',
            desc: 'Para fintechs e empresas com operação regulatória madura e times dedicados.',
            features: ['Até 1.000 entidades + API pública', 'Todos os módulos regulatórios', 'Screening completo + PEP nacional', 'Case Management de investigações', 'Exportação BACEN/COAF', 'Webhooks e integrações', 'Suporte prioritário'],
            featured: true,
        },
        {
            tier: 'Enterprise', price: 'Sob consulta', period: '',
            desc: 'Para grupos financeiros com exigências avançadas de segurança e escala.',
            features: ['Entidades ilimitadas', 'SLA dedicado + suporte 24/7', 'SAML SSO + SCIM provisioning', 'Deploy on-premise disponível', 'Integrações customizadas via API', 'Treinamento da equipe de compliance'],
            featured: false,
        },
    ]
    return (
        <section id="pricing" style={S.section}>
            <div style={S.wrap}>
                <p style={S.pre}>Preços</p>
                <h2 style={S.h2}>Transparente. Sem surpresas.</h2>
                <p style={{ ...S.p, marginBottom: '4rem' }}>Cancelamento a qualquer momento. Sem taxa de setup. Migração assistida inclusa.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', border: `1px solid ${LINE}` }}>
                    {plans.map((p, i) => (
                        <div key={p.tier} style={{
                            padding: '2.5rem', display: 'flex', flexDirection: 'column',
                            borderRight: i < 2 ? `1px solid ${LINE}` : undefined,
                            background: p.featured ? SURFACE2 : undefined,
                        }}>
                            <div style={{ fontFamily: MONO, fontSize: '.7rem', color: MUTED, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '1.25rem' }}>
                                {p.tier}{p.featured && <span style={{ color: CYAN, marginLeft: '.75rem' }}>▲ Popular</span>}
                            </div>
                            <div style={{ fontFamily: SERIF, fontSize: p.price === 'Sob consulta' ? '1.75rem' : '2.5rem', color: TEXT, lineHeight: 1, marginBottom: '.25rem' }}>{p.price}</div>
                            <div style={{ fontFamily: MONO, fontSize: '.7rem', color: '#94A3B8', marginBottom: '1.5rem' }}>{p.period || '\u00a0'}</div>
                            <div style={{ height: 1, background: LINE, marginBottom: '1.5rem' }} />
                            <p style={{ ...S.p, fontSize: '.875rem', marginBottom: '2rem', lineHeight: 1.6 }}>{p.desc}</p>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.625rem', marginBottom: '2.5rem' }}>
                                {p.features.map(f => (
                                    <li key={f} style={{ fontSize: '.8125rem', color: MUTED, display: 'flex', gap: '.625rem', alignItems: 'flex-start' }}>
                                        <CheckCircle size={13} stroke={CYAN} style={{ flexShrink: 0, marginTop: '.15rem' }} />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <div style={{ marginTop: 'auto' }}>
                                <Link href="/dashboard" style={{
                                    ...p.featured ? S.btnFill : S.btnLine,
                                    width: '100%', justifyContent: 'center',
                                }}>
                                    {p.price === 'Sob consulta' ? 'Falar com a Equipe' : 'Começar Agora'}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
                <p style={{ textAlign: 'center', fontSize: '.8125rem', color: '#94A3B8', marginTop: '2rem' }}>
                    Preços em BRL · Cancelamento a qualquer momento · Sem taxa de setup
                </p>
            </div>
        </section>
    )
}

/* ─── QUOTE + CTA ────────────────────────────────── */
function QuoteCTA() {
    return (
        <section style={{ ...S.section, padding: '8rem 0' }}>
            <div style={S.wrap}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8rem', alignItems: 'start' }}>
                    <div>
                        <div style={{ fontFamily: SERIF, fontSize: '5rem', color: LINE_STRONG, lineHeight: .5, marginBottom: '1.5rem' }}>"</div>
                        <p style={{ fontFamily: SERIF, fontSize: 'clamp(1.5rem,2.5vw,2.25rem)', color: TEXT, lineHeight: 1.4, fontStyle: 'italic', marginBottom: '2rem', fontWeight: 'normal' }}>
                            Reduzimos em 70% o tempo de onboarding KYC/KYB e eliminamos planilhas do processo de PLD. O ComplianceOS virou infraestrutura crítica para nós.
                        </p>
                        <div style={{ fontFamily: MONO, fontSize: '.7rem', color: MUTED, letterSpacing: '.04em' }}>
                            <strong style={{ display: 'block', color: TEXT, marginBottom: '.25rem' }}>Rafael M.</strong>
                            CCO · Acme Fintech &nbsp;|&nbsp; São Paulo, SP
                        </div>
                    </div>
                    <div style={{ padding: '2.5rem', border: `1px solid ${LINE}` }}>
                        <h3 style={{ fontFamily: SERIF, fontSize: '1.375rem', color: TEXT, marginBottom: '.875rem', fontWeight: 'normal' }}>Pronto para automatizar seu compliance?</h3>
                        <p style={{ ...S.p, fontSize: '.875rem', marginBottom: '2rem', lineHeight: 1.65 }}>
                            Agende uma demonstração com nossa equipe e veja como o ComplianceOS se adapta ao seu contexto regulatório.
                        </p>
                        <Link href="/dashboard" style={{ ...S.btnFill, width: '100%', justifyContent: 'center' }}>
                            Agendar Demonstração Gratuita →
                        </Link>
                        <p style={{ marginTop: '1rem', fontSize: '.75rem', color: '#94A3B8', textAlign: 'center' }}>
                            Sem compromisso. Resposta em até 24h úteis.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

/* ─── FOOTER ─────────────────────────────────────── */
function Footer() {
    return (
        <footer style={{ borderTop: `1px solid ${LINE}`, padding: '3rem 0', background: BG }}>
            <div style={S.wrap}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '3rem', flexWrap: 'wrap' }}>
                    <div style={{ maxWidth: 260 }}>
                        <strong style={{ display: 'block', color: TEXT, fontFamily: UI, fontWeight: 500, marginBottom: '.5rem' }}>ComplianceOS</strong>
                        <p style={{ ...S.p, fontSize: '.875rem', lineHeight: 1.6 }}>
                            Plataforma de Compliance &amp; Governança para fintechs e PMEs brasileiras.
                        </p>
                        <p style={{ ...S.p, fontSize: '.825rem', marginTop: '.5rem' }}>Desenvolvido por Chuangxin · Grupo Guinle</p>
                    </div>
                    {[
                        { label: 'Produto', links: ['Módulos', 'Plataforma', 'Preços', 'API Reference', 'Status'] },
                        { label: 'Regulatório', links: ['Cobertura', 'Documentação', 'LGPD', 'Segurança'] },
                        { label: 'Legal', links: ['Privacidade', 'Termos de Uso', 'Cookies', 'Contato'] },
                    ].map(g => (
                        <div key={g.label}>
                            <span style={{ fontFamily: MONO, fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.1em', color: '#94A3B8', display: 'block', marginBottom: '.75rem' }}>{g.label}</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                                {g.links.map(l => <Link key={l} href="/dashboard" style={{ fontSize: '.8125rem', color: MUTED, textDecoration: 'none' }}>{l}</Link>)}
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: `1px solid ${LINE}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <span style={{ fontSize: '.75rem', color: '#94A3B8' }}>© 2026 Chuangxin Tecnologia da Informação Ltda.</span>
                    <div style={{ display: 'flex', gap: '.75rem' }}>
                        {['LGPD', 'ISO 27001 Ready', 'AWS Partner', 'SOC 2'].map(b => (
                            <span key={b} style={{ fontFamily: MONO, fontSize: '.65rem', color: '#94A3B8', border: `1px solid ${LINE}`, padding: '.25rem .625rem' }}>{b}</span>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}

/* ─── PAGE ───────────────────────────────────────── */
export default function LandingPage() {
    return (
        <div style={{ background: BG, color: TEXT, fontFamily: UI, overflowX: 'hidden' }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
        a{color:inherit;text-decoration:none;}
      `}</style>

            {/* Navbar */}
            <nav style={{ position: 'fixed', top: 0, width: '100%', zIndex: 100, borderBottom: `1px solid ${LINE}`, background: `rgba(255,255,255,.92)`, backdropFilter: 'blur(16px)' }}>
                <div style={{ ...S.wrap, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '.625rem', fontSize: '1rem', fontWeight: 600, letterSpacing: '-.02em', color: TEXT, textDecoration: 'none' }}>
                        <ShieldCheck size={20} stroke={CYAN} strokeWidth={1.5} />
                        Compliance<span style={{ color: CYAN }}>OS</span>
                    </Link>
                    <div style={{ display: 'flex', gap: '2.5rem' }}>
                        {([['#solutions', 'Produto'], ['#pricing', 'Preços'], ['/dashboard', 'Plataforma']] as [string, string][]).map(([h, l]) => (
                            <Link key={l} href={h} style={{ fontSize: '.8125rem', color: MUTED, textDecoration: 'none' }}>{l}</Link>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '.75rem' }}>
                        <Link href="/login" style={S.btnLine}>Entrar</Link>
                        <Link href="/dashboard" style={S.btnFill}>Agendar Demo →</Link>
                    </div>
                </div>
            </nav>

            <Hero />
            <Stats />
            <Solutions />
            <Stack />
            <Pricing />
            <QuoteCTA />
            <Footer />
        </div>
    )
}
