import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export function PublicNav() {
    return (
        <nav className="fixed top-0 w-full z-[100] border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 group">
                    <div className="p-1.5 bg-brand-50 rounded-lg group-hover:bg-brand-100 transition-colors">
                        <ShieldCheck className="w-5 h-5 text-brand-600" strokeWidth={2} />
                    </div>
                    Compliance<span className="text-brand-600">OS</span>
                </Link>
                <div className="hidden md:flex items-center gap-10">
                    {([['/', 'Produto'], ['/#pricing', 'Preços'], ['/cobertura', 'Regulações'], ['/docs', 'Docs']] as [string, string][]).map(([h, l]) => (
                        <Link key={l} href={h} className="text-[13px] font-medium text-slate-600 hover:text-brand-600 transition-colors">{l}</Link>
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/login" className="px-6 py-2 text-[13px] font-semibold text-slate-600 rounded-full border border-slate-200 hover:bg-slate-50 transition-all">Entrar</Link>
                    <Link href="/dashboard" className="px-6 py-2 bg-brand-600 text-white text-[13px] font-semibold rounded-full hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 hover:shadow-brand-600/30">Acessar →</Link>
                </div>
            </div>
        </nav>
    )
}

export function PublicFooter() {
    return (
        <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
                    <div className="col-span-2 lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 mb-4 group">
                            <div className="p-1.5 bg-brand-50 rounded-lg group-hover:bg-brand-100 transition-colors">
                                <ShieldCheck className="w-5 h-5 text-brand-600" strokeWidth={2} />
                            </div>
                            Compliance<span className="text-brand-600">OS</span>
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-sm">
                            A infraestrutura regulatória inteligente para empresas que movem a economia do Brasil.
                        </p>
                    </div>
                    {[
                        {
                            title: 'Produto',
                            links: [
                                { label: 'Plataforma', href: '/' },
                                { label: 'Preços', href: '/#pricing' },
                                { label: 'Soluções', href: '/#solutions' },
                                { label: 'Changelog', href: '/changelog' }
                            ]
                        },
                        {
                            title: 'Regulatório',
                            links: [
                                { label: 'Bacen & COAF', href: '/cobertura' },
                                { label: 'LGPD / ANPD', href: '/lgpd' },
                                { label: 'Segurança', href: '/seguranca' },
                                { label: 'Due Diligence', href: '/due-diligence' }
                            ]
                        },
                        {
                            title: 'Empresa',
                            links: [
                                { label: 'Sobre nós', href: '/sobre' },
                                { label: 'Contato', href: '/contato' },
                                { label: 'Privacidade', href: '/privacidade' },
                                { label: 'Termos de Uso', href: '/termos' }
                            ]
                        }
                    ].map(group => (
                        <div key={group.title}>
                            <h4 className="font-semibold text-slate-900 mb-4">{group.title}</h4>
                            <ul className="space-y-3">
                                {group.links.map(l => (
                                    <li key={l.label}>
                                        <Link href={l.href} className="text-sm text-slate-500 hover:text-brand-600 transition-colors">
                                            {l.label}
                                        </Link>
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
                            <span key={badge} className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-500 font-medium">
                                {badge}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}

export function PageHero({ breadcrumb, title, subtitle }: { breadcrumb: string; title: string; subtitle: string }) {
    return (
        <section className="pt-32 pb-20 border-b border-slate-200 relative bg-slate-50 overflow-hidden">
            {/* Grid Pattern Pattern Synthesis */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-grid" />
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <p className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                    <Link href="/" className="hover:text-brand-600 transition-colors">ComplianceOS</Link>
                    <span className="opacity-50">{' / '}</span>
                    {breadcrumb}
                </p>
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-slate-900 mb-6 max-w-3xl leading-[1.1] tracking-tight">{title}</h1>
                <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">{subtitle}</p>
            </div>
        </section>
    )
}


