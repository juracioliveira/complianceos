import Link from 'next/link'
import { ShieldCheck, Lock, FileText, BarChart3, ArrowRight, CheckCircle, Server, Key, Activity, ArrowUpRight, Check } from 'lucide-react'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden selection:bg-brand-500 selection:text-white">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-all">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 group">
                        <div className="p-1.5 bg-brand-50 rounded-lg group-hover:bg-brand-100 transition-colors">
                            <ShieldCheck className="w-5 h-5 text-brand-600" strokeWidth={2} />
                        </div>
                        Compliance<span className="text-brand-600">OS</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8">
                        {[
                            { href: '#solutions', label: 'Produto' },
                            { href: '#pricing', label: 'Preços' },
                            { href: '/docs', label: 'API' }
                        ].map(({ href, label }) => (
                            <Link key={label} href={href} className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
                                {label}
                            </Link>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="hidden md:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                            Entrar
                        </Link>
                        <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-full shadow-sm shadow-brand-600/20 transition-all hover:-translate-y-0.5">
                            Agendar Demo <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 flex items-center min-h-[90vh]">
                {/* Background glow effects */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-brand-400/20 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold tracking-wide uppercase mb-6 shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                                Plataforma regulatória · BACEN / COAF / ANPD
                            </div>
                            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.1] text-slate-900 mb-6 tracking-tight">
                                Conformidade regulatória.<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-cyan-500">Sem travar sua operação.</span>
                            </h1>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
                                O ComplianceOS automatiza PLD-FT, LGPD e Anticorrupção para fintechs e PMEs brasileiras — do KYC ao relatório COAF, com trilha de auditoria criptograficamente segura.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-full shadow-lg shadow-brand-600/25 transition-all hover:shadow-brand-600/40 hover:-translate-y-0.5">
                                    Começar Grátis <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link href="#solutions" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-full border border-slate-200 shadow-sm transition-all hover:-translate-y-0.5">
                                    Ver a Plataforma
                                </Link>
                            </div>
                        </div>

                        {/* Interactive UI Mockup */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-brand-100 to-cyan-50 transform rotate-3 rounded-[2rem] shadow-inner" />
                            <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col">
                                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-slate-200" />
                                            <div className="w-3 h-3 rounded-full bg-slate-200" />
                                            <div className="w-3 h-3 rounded-full bg-slate-200" />
                                        </div>
                                        <span className="ml-4 text-xs font-mono text-slate-500 uppercase tracking-widest">Live Monitor</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded-md text-[10px] font-bold uppercase tracking-wider border border-green-200/50">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        Tempo Real
                                    </div>
                                </div>
                                <div className="p-5 flex-1">
                                    <div className="grid grid-cols-12 gap-4 pb-3 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        <div className="col-span-6">Entidade</div>
                                        <div className="col-span-2 text-center">Score</div>
                                        <div className="col-span-2 text-center">PEP</div>
                                        <div className="col-span-2 text-right">Status</div>
                                    </div>
                                    <div className="flex flex-col divide-y divide-slate-50">
                                        {[
                                            { name: 'Acme Fintech Ltda.', cnpj: '35.123.456/0001-78', score: 91, pep: false, status: 'ok' },
                                            { name: 'Beta Holdings S.A.', cnpj: '12.987.654/0001-22', score: 64, pep: true, status: 'warn' },
                                            { name: 'LATAM Holdings Int.', cnpj: '98.765.432/0001-01', score: 23, pep: false, status: 'crit' },
                                            { name: 'NovaPay Serviços', cnpj: '55.443.221/0001-90', score: 88, pep: false, status: 'ok' },
                                        ].map((row, i) => (
                                            <div key={i} className="grid grid-cols-12 gap-4 py-3 items-center hover:bg-slate-50/80 transition-colors -mx-2 px-2 rounded-lg cursor-default">
                                                <div className="col-span-6">
                                                    <div className="text-sm font-medium text-slate-900 truncate">{row.name}</div>
                                                    <div className="text-xs font-mono text-slate-500">{row.cnpj}</div>
                                                </div>
                                                <div className="col-span-2 flex justify-center">
                                                    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold font-mono ${row.score >= 80 ? 'bg-green-50 text-green-700' :
                                                        row.score >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                                                        }`}>
                                                        {row.score}
                                                    </span>
                                                </div>
                                                <div className="col-span-2 flex justify-center">
                                                    {row.pep ? (
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100/50 text-amber-700 border border-amber-200/50">PEP</span>
                                                    ) : (
                                                        <span className="text-xs text-slate-300">-</span>
                                                    )}
                                                </div>
                                                <div className="col-span-2 flex justify-end pr-2">
                                                    <div className={`w-2.5 h-2.5 rounded-full ${row.status === 'ok' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' :
                                                        row.status === 'warn' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' :
                                                            'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                                                        }`} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-slate-50/80 border-t border-slate-100 px-5 py-3 flex items-center justify-between">
                                    <div className="text-xs text-slate-500 font-medium">847 entidades monitoradas</div>
                                    <Link href="/dashboard" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group">
                                        Ver Painel Completo <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="border-y border-slate-200 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100">
                        {[
                            { num: '70', sup: '%', label: 'Redução no tempo de onboarding KYC/KYB' },
                            { num: '12', sup: '+', label: 'Frameworks regulatórios cobertos nativamente' },
                            { num: '99', sup: '.9%', label: 'Disponibilidade SLA com infraestrutura AWS' },
                            { num: '0', sup: '', label: 'Planilhas manuais no seu processo de PLD' },
                        ].map((s, i) => (
                            <div key={i} className="p-8 lg:p-10 flex flex-col items-center text-center">
                                <div className="font-display text-4xl lg:text-5xl text-slate-900 mb-2 flex items-baseline">
                                    {s.num}<span className="text-xl lg:text-2xl text-brand-600 font-sans font-medium">{s.sup}</span>
                                </div>
                                <p className="text-sm text-slate-500 leading-snug">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Solutions */}
            <section id="solutions" className="py-24 bg-slate-50 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="max-w-3xl mb-16">
                        <h2 className="text-brand-600 font-bold uppercase tracking-wider text-sm mb-3">Módulos Inteligentes</h2>
                        <h3 className="font-display text-4xl md:text-5xl text-slate-900 mb-6 leading-tight">
                            O cenário regulatório é complexo.<br />
                            Nós o tornamos gerenciável.
                        </h3>
                        <p className="text-lg text-slate-600">
                            Conformidade não é opcional para fintechs e PMEs sob escrutínio do BACEN, COAF e ANPD. Centralize todas as suas obrigações em uma única plataforma.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: ShieldCheck, title: 'PLD-FT & Sanções', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100',
                                desc: 'Monitoramento contínuo de listas restritivas, identificação de PEPs e cálculo de risco automatizado (Lei 9.613/98 e Res. BCB 50).',
                                tags: ['Screening OFAC / ONU / COAF', 'Detecção PEP inteligente', 'Score de risco em tempo real']
                            },
                            {
                                icon: Lock, title: 'Privacidade LGPD', color: 'text-brand-600', bg: 'bg-brand-50', border: 'border-brand-100',
                                desc: 'Registro de operações de tratamento, gestão de consentimento e adequação processual completa para evitar multas da ANPD.',
                                tags: ['RAT Automatizado', 'Relatórios de Impacto (RIPD)', 'Fluxo de exclusão de dados']
                            },
                            {
                                icon: FileText, title: 'Governança & Anticorrupção', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100',
                                desc: 'Due diligence de fornecedores B2B, scoring de risco de terceiros e trilha de auditoria imutável (Lei Anticorrupção 12.846/13).',
                                tags: ['Due diligence de fornecedores', 'Exportação PDF certificada', 'Audit Trail criptografado']
                            },
                        ].map((c, i) => (
                            <div key={i} className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
                                <div className={`w-14 h-14 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <c.icon className={`w-7 h-7 ${c.color}`} strokeWidth={1.5} />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">{c.title}</h4>
                                <p className="text-slate-600 text-sm leading-relaxed mb-6">{c.desc}</p>
                                <ul className="space-y-3">
                                    {c.tags.map(t => (
                                        <li key={t} className="flex items-start gap-3 text-sm text-slate-600">
                                            <Check className={`w-4 h-4 mt-0.5 shrink-0 ${c.color}`} />
                                            {t}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stack */}
            <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/10 blur-[100px] rounded-full" />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-brand-400 font-bold uppercase tracking-wider text-sm mb-3">Infraestrutura</h2>
                        <h3 className="font-display text-4xl md:text-5xl mb-6">Enterprise-grade, sem o overhead.</h3>
                        <p className="text-slate-400 text-lg">Construímos nossa arquitetura para atender aos requisitos mais rígidos de bancos centrais e órgãos reguladores globais.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { icon: Key, title: 'Isolamento de Dados', desc: 'Arquitetura multi-tenant com RLS rígido no PostgreSQL. Sem vazamento.' },
                            { icon: Server, title: 'Alta Disponibilidade', desc: 'AWS ECS Fargate com auto-scaling automático e redundância Multi-AZ.' },
                            { icon: ShieldCheck, title: 'Zero-Trust Security', desc: 'MFA Opcional, tokens JWT RS256 de curta duração e WAF integrado.' },
                            { icon: Activity, title: 'Observabilidade', desc: 'Trilhas de auditoria imutáveis (apend-only) integradas com Datadog.' },
                        ].map((s, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 transition-colors">
                                <s.icon className="w-8 h-8 text-brand-400 mb-4" />
                                <h4 className="font-semibold text-lg mb-2">{s.title}</h4>
                                <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-brand-600 font-bold uppercase tracking-wider text-sm mb-3">Planos e Preços</h2>
                        <h3 className="font-display text-4xl md:text-5xl text-slate-900 mb-6">Transparente. Sem surpresas.</h3>
                        <p className="text-lg text-slate-600 mb-6">Assinatura mensal com tudo que sua operação de compliance precisa.</p>
                        <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-medium">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-100/50">15% OFF no plano anual pré-pago</span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/50">Trial de 14 dias (sem cartão)</span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100/50">Setup grátis (anual Professional+)</span>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                        {[
                            {
                                name: 'Starter', price: 'R$ 1.490', period: '/mês',
                                desc: 'Para operações iniciais.',
                                features: ['Até 100 entidades monitoradas', '3 usuários inclusos', 'KYC/KYB Onboarding', 'Checklists Regulatórios', 'Screening de Sanções', 'Trilha de Auditoria', 'Motor de Score Básico', 'SLA 99,5%', 'Onboarding Self-service'],
                                popular: false
                            },
                            {
                                name: 'Professional', price: 'R$ 3.900', period: '/mês',
                                desc: 'Para operações maduras e times dedicados.',
                                features: ['Até 500 entidades monitoradas', '10 usuários inclusos', 'KYC/KYB Onboarding', 'Checklists Regulatórios', 'Screening de Sanções (Tempo Real)', 'Trilha de Auditoria (Imutável)', 'Case Management', 'Motor de Score Avançado', 'Geração de Documentos', 'SLA 99,9%', 'Onboarding Guiado (4h)'],
                                popular: true
                            },
                            {
                                name: 'Enterprise', price: 'Sob medida', period: '',
                                desc: 'Para instituições com exigências complexas.',
                                features: ['Entidades e usuários ilimitados', 'KYC/KYB Onboarding', 'Checklists Regulatórios', 'Screening de Sanções (Tempo Real)', 'Trilha de Auditoria (Imutável)', 'Case Management', 'Motor de Score Configurável', 'Geração de Documentos', 'API Pública', 'SSO SAML / LDAP', 'SLA 99,95% + suporte dedicado', 'Onboarding Dedicado (20h)'],
                                popular: false
                            }
                        ].map((p, i) => (
                            <div key={i} className={`relative rounded-3xl p-8 bg-white border flex flex-col ${p.popular ? 'border-brand-500 shadow-2xl shadow-brand-500/10 scale-105 z-10' : 'border-slate-200 shadow-sm'}`}>
                                {p.popular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                                        Mais Escolhido
                                    </div>
                                )}
                                <h4 className="text-lg font-semibold text-slate-900 mb-2">{p.name}</h4>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="font-display text-4xl text-slate-900">{p.price}</span>
                                    {p.period && <span className="text-slate-500 font-medium">{p.period}</span>}
                                </div>
                                <p className="text-sm text-slate-600 mb-6 h-10">{p.desc}</p>
                                <ul className="space-y-4 mb-8 flex-1">
                                    {p.features.map(f => (
                                        <li key={f} className="flex items-start gap-3 text-sm text-slate-700">
                                            <CheckCircle className={`w-5 h-5 shrink-0 ${p.popular ? 'text-brand-500' : 'text-slate-400'}`} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/dashboard" className={`block w-full py-3 px-4 rounded-xl text-center text-sm font-semibold transition-all mt-auto ${p.popular
                                    ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-md hover:shadow-lg'
                                    : 'bg-slate-50 text-slate-900 border border-slate-200 hover:bg-slate-100'
                                    }`}>
                                    Começar Agora
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
                        <div className="col-span-2 lg:col-span-2">
                            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 mb-4">
                                <ShieldCheck className="w-6 h-6 text-brand-600" strokeWidth={2.5} />
                                Compliance<span className="text-brand-600">OS</span>
                            </Link>
                            <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-sm">
                                A infraestrutura regulatória inteligente para empresas que movem a economia do Brasil.
                            </p>
                        </div>
                        {[
                            { title: 'Produto', links: ['Plataforma', 'Preços', 'Soluções', 'Changelog'] },
                            { title: 'Regulatório', links: ['Bacen & COAF', 'LGPD / ANPD', 'Segurança', 'Due Diligence'] },
                            { title: 'Empresa', links: ['Sobre nós', 'Contato', 'Privacidade', 'Termos de Uso'] }
                        ].map(group => (
                            <div key={group.title}>
                                <h4 className="font-semibold text-slate-900 mb-4">{group.title}</h4>
                                <ul className="space-y-3">
                                    {group.links.map(l => (
                                        <li key={l}>
                                            <Link href="#" className="text-sm text-slate-500 hover:text-brand-600 transition-colors">{l}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-slate-400">© 2026 Chuangxin Tecnologia da Informação Ltda. Todos os direitos reservados.</p>
                        <div className="flex gap-2">
                            {['ISO 27001 Ready', 'AWS Partner', 'SOC 2'].map(badge => (
                                <span key={badge} className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-500 font-medium">
                                    {badge}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
