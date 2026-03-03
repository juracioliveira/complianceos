import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

const CYAN = '#00C8E0'
const BG = '#0A0C10'
const SURFACE = '#111318'
const LINE = 'rgba(255,255,255,0.08)'
const TEXT = '#EDF0F4'
const MUTED = '#7A8494'
const UI = "'IBM Plex Sans', sans-serif"
const MONO = "'IBM Plex Mono', monospace"

export function PublicNav() {
    return (
        <nav style={{
            position: 'fixed', top: 0, width: '100%', zIndex: 100,
            borderBottom: `1px solid ${LINE}`,
            background: 'rgba(10,12,16,0.95)',
            backdropFilter: 'blur(16px)',
        }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 3rem', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '.625rem', fontSize: '1rem', fontWeight: 600, letterSpacing: '-.02em', color: TEXT, textDecoration: 'none', fontFamily: UI }}>
                    <ShieldCheck size={20} stroke={CYAN} strokeWidth={1.5} />
                    Compliance<span style={{ color: CYAN }}>OS</span>
                </Link>
                <div style={{ display: 'flex', gap: '2.5rem' }}>
                    {[['/', 'Produto'], ['/#pricing', 'Preços'], ['/cobertura', 'Regulações'], ['/docs', 'Docs']].map(([h, l]) => (
                        <Link key={l} href={h} style={{ fontSize: '.8125rem', color: MUTED, textDecoration: 'none', fontFamily: UI }}>{l}</Link>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '.75rem' }}>
                    <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', padding: '.6rem 1.2rem', background: 'transparent', color: TEXT, border: `1px solid ${LINE}`, fontFamily: UI, fontWeight: 500, fontSize: '.8125rem', letterSpacing: '.04em', textTransform: 'uppercase' as const, textDecoration: 'none' }}>Entrar</Link>
                    <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', padding: '.6rem 1.2rem', background: CYAN, color: BG, border: `1px solid ${CYAN}`, fontFamily: UI, fontWeight: 500, fontSize: '.8125rem', letterSpacing: '.04em', textTransform: 'uppercase' as const, textDecoration: 'none' }}>Acessar →</Link>
                </div>
            </div>
        </nav>
    )
}

export function PublicFooter() {
    return (
        <footer style={{ borderTop: `1px solid ${LINE}`, padding: '3rem 0', background: SURFACE }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem' }}>
                    <ShieldCheck size={18} stroke={MUTED} strokeWidth={1.5} />
                    <span style={{ fontFamily: UI, fontWeight: 600, color: TEXT, fontSize: '.9rem' }}>ComplianceOS</span>
                </div>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    {[
                        ['/cobertura', 'Cobertura'], ['/docs', 'Docs'], ['/seguranca', 'Segurança'],
                        ['/privacidade', 'Privacidade'], ['/termos', 'Termos'], ['/contato', 'Contato'],
                    ].map(([h, l]) => (
                        <Link key={l} href={h} style={{ fontFamily: UI, fontSize: '.8125rem', color: MUTED, textDecoration: 'none' }}>{l}</Link>
                    ))}
                </div>
                <span style={{ fontFamily: MONO, fontSize: '.7rem', color: '#3A4152' }}>© 2026 Chuangxin Tecnologia</span>
            </div>
        </footer>
    )
}

export function PageHero({ breadcrumb, title, subtitle }: { breadcrumb: string; title: string; subtitle: string }) {
    return (
        <section style={{
            paddingTop: '8rem', paddingBottom: '5rem',
            borderBottom: `1px solid ${LINE}`,
            backgroundImage: `linear-gradient(${LINE} 1px,transparent 1px),linear-gradient(90deg,${LINE} 1px,transparent 1px)`,
            backgroundSize: '80px 80px',
        }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 3rem' }}>
                <p style={{ fontFamily: MONO, fontSize: '.7rem', color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '.1em', marginBottom: '1.5rem' }}>
                    <Link href="/" style={{ color: MUTED, textDecoration: 'none' }}>ComplianceOS</Link>
                    {' / '}{breadcrumb}
                </p>
                <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2rem,4vw,3.5rem)', color: TEXT, fontWeight: 'normal', marginBottom: '1rem', maxWidth: 700 }}>{title}</h1>
                <p style={{ fontFamily: UI, fontSize: '1.0625rem', color: MUTED, maxWidth: 560, lineHeight: 1.75 }}>{subtitle}</p>
            </div>
        </section>
    )
}

export const pageStyle = {
    background: BG, color: TEXT, fontFamily: UI, minHeight: '100vh',
}

export const contentWrap = {
    maxWidth: 1200, margin: '0 auto', padding: '5rem 3rem',
}

export { CYAN, BG, SURFACE, SURFACE2: '#16191f', LINE, LINE_STRONG: 'rgba(255,255,255,0.14)', TEXT, MUTED, UI, MONO, SERIF: "'DM Serif Display', serif" }
