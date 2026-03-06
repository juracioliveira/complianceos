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
                    <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Entrar</Link>
                    <Link href="/dashboard" className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors shadow-sm shadow-brand-600/20">Acessar →</Link>
                </div>
            </div>
        </nav>
    )
}

export function PublicFooter() {
    return (
        <footer className="border-t border-slate-200 py-12 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
                    <ShieldCheck className="w-5 h-5 text-slate-400" strokeWidth={2} />
                    Compliance<span className="text-slate-400">OS</span>
                </div>
                <div className="flex flex-wrap gap-6 justify-center">
                    {([
                        ['/cobertura', 'Cobertura'], ['/docs', 'Docs'], ['/seguranca', 'Segurança'],
                        ['/privacidade', 'Privacidade'], ['/termos', 'Termos'], ['/contato', 'Contato'],
                    ] as [string, string][]).map(([h, l]) => (
                        <Link key={l} href={h} className="text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors">{l}</Link>
                    ))}
                </div>
                <span className="font-mono text-xs text-slate-400">© 2026 Chuangxin Tecnologia</span>
            </div>
        </footer>
    )
}

export function PageHero({ breadcrumb, title, subtitle }: { breadcrumb: string; title: string; subtitle: string }) {
    return (
        <section className="pt-32 pb-20 border-b border-slate-200 relative bg-slate-50">
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <p className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                    <Link href="/" className="hover:text-brand-600 transition-colors">ComplianceOS</Link>
                    {' / '}{breadcrumb}
                </p>
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-slate-900 mb-6 max-w-3xl leading-tight">{title}</h1>
                <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">{subtitle}</p>
            </div>
        </section>
    )
}

export const pageStyle = {
    // Legacy export, safely ignored if fully swapped
}

export const contentWrap = {
    // Legacy export
}

export const CYAN = '#1E5DB8'
export const BG = '#F8FAFC'
export const SURFACE = '#F1F5F9'
export const LINE = '#E2E8F0'
export const TEXT = '#0F172A'
export const MUTED = '#64748B'
export const UI = "ui-sans-serif, system-ui, sans-serif"
export const MONO = "ui-monospace, SFMono-Regular, monospace"


