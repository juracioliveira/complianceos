'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
    ShieldCheck, Lock, FileText, ArrowRight,
    CheckCircle, Activity, Zap, Globe
} from 'lucide-react'

/* ─── Design Tokens (from complianceos-landing.html) ────── */
const C = {
    bgBase: '#0A0C10',
    bgSurface: '#111318',
    accent: '#00E5FF',
    accentGlow: 'rgba(0,229,255,0.15)',
    accentHover: 'rgba(0,229,255,0.8)',
    amber: '#F5A623',
    textPrimary: '#F0F2F5',
    textSecondary: '#8892A4',
    border: 'rgba(255,255,255,0.07)',
    borderHover: 'rgba(0,229,255,0.3)',
}

/* ─── Scroll Progress Bar ────────────────────────────────── */
function ScrollProgress() {
    const [progress, setProgress] = useState(0)
    useEffect(() => {
        const update = () => {
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement
            setProgress((scrollTop / (scrollHeight - clientHeight)) * 100)
        }
        window.addEventListener('scroll', update)
        return () => window.removeEventListener('scroll', update)
    }, [])
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, zIndex: 1000,
            width: `${progress}%`, height: 2,
            background: C.accent,
            boxShadow: `0 0 10px ${C.accent}`,
            transition: 'width 0.1s ease-out',
        }} />
    )
}

/* ─── Navbar ─────────────────────────────────────────────── */
function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    useEffect(() => {
        const update = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', update)
        return () => window.removeEventListener('scroll', update)
    }, [])

    return (
        <nav style={{
            position: 'fixed', top: 0, width: '100%', zIndex: 100,
            padding: '1.25rem 2rem',
            transition: 'all 0.3s',
            borderBottom: scrolled ? `1px solid ${C.border}` : '1px solid transparent',
            background: scrolled ? 'rgba(10,12,16,0.85)' : 'transparent',
            backdropFilter: scrolled ? 'blur(12px)' : 'none',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1280, margin: '0 auto' }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px', color: C.textPrimary }}>
                        Compliance<span style={{ color: C.accent }}>OS</span>
                    </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <Link href="/login" style={{ fontSize: '0.9rem', fontWeight: 500, color: C.textSecondary, textDecoration: 'none', transition: 'color 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = C.textPrimary)}
                        onMouseLeave={e => (e.currentTarget.style.color = C.textSecondary)}>
                        Entrar
                    </Link>
                    <Link href="/dashboard" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.625rem 1.25rem',
                        background: C.accent, color: C.bgBase,
                        border: '1px solid transparent', borderRadius: 4,
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        fontWeight: 600, fontSize: '0.875rem',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        textDecoration: 'none',
                        boxShadow: `0 0 20px ${C.accentGlow}`,
                        transition: 'all 0.2s ease',
                    }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.accentHover; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.accent; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
                        Acessar Plataforma
                    </Link>
                </div>
            </div>
        </nav>
    )
}

/* ─── Hero Section ───────────────────────────────────────── */
function Hero() {
    return (
        <section style={{
            position: 'relative', minHeight: '100vh',
            padding: '12rem 2rem 8rem',
            display: 'flex', alignItems: 'center',
            backgroundImage: `linear-gradient(45deg, ${C.border} 1px, transparent 1px), linear-gradient(-45deg, ${C.border} 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            overflow: 'hidden',
        }}>
            {/* Radial glow – top right */}
            <div style={{
                position: 'absolute', top: '-50%', right: '-25%',
                width: '80vw', height: '80vw', borderRadius: '50%',
                background: `radial-gradient(circle, rgba(0,229,255,0.1) 0%, transparent 60%)`,
                pointerEvents: 'none',
            }} />

            <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', textAlign: 'center', position: 'relative', zIndex: 2 }}>
                {/* Badge */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(17,19,24,0.8)', border: `1px solid ${C.border}`,
                    borderRadius: 50, marginBottom: '2rem',
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: C.textSecondary,
                    animation: 'float 6s ease-in-out infinite',
                }}>
                    <span style={{ color: C.accent }}>◉</span>
                    Sistema de Nível Regulatório Bancário (BACEN/COAF)
                </div>

                {/* Headline */}
                <h1 style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: 'clamp(3rem, 7vw, 5rem)',
                    fontWeight: 'normal', lineHeight: 1.1,
                    color: C.textPrimary, marginBottom: '1.5rem',
                }}>
                    Compliance Completo,<br />
                    <span style={{ color: C.accent }}>Totalmente Automatizado.</span>
                </h1>

                <p style={{
                    fontSize: '1.25rem', color: C.textSecondary, lineHeight: 1.6,
                    maxWidth: 640, margin: '0 auto 2.5rem',
                    fontFamily: "'IBM Plex Sans', sans-serif",
                }}>
                    A plataforma definitiva para PLD/FT, LGPD e Anticorrupção. Rastreie entidades, automatize due diligence e gere trilhas de auditoria imutáveis com um clique.
                </p>

                {/* CTAs */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <Link href="/dashboard" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        background: C.accent, color: C.bgBase,
                        borderRadius: 4, border: '1px solid transparent',
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        fontWeight: 600, fontSize: '0.875rem',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        textDecoration: 'none',
                        boxShadow: `0 0 20px ${C.accentGlow}`,
                        transition: 'all 0.2s ease',
                    }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.accentHover; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 25px rgba(0,229,255,0.25)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.accent; (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${C.accentGlow}` }}>
                        Experimentar Agora <ArrowRight size={16} />
                    </Link>
                    <Link href="/dashboard" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        background: 'transparent', color: C.accent,
                        borderRadius: 4, border: `1px solid ${C.accent}`,
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        fontWeight: 600, fontSize: '0.875rem',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        textDecoration: 'none', transition: 'all 0.2s ease',
                    }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,229,255,0.05)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.transform = '' }}>
                        Agendar Demonstração
                    </Link>
                </div>
            </div>
        </section>
    )
}

/* ─── Solution Cards ─────────────────────────────────────── */
const SOLUTIONS = [
    {
        icon: <ShieldCheck size={24} style={{ stroke: C.accent }} />,
        title: 'PLD/FT e Sanções',
        desc: 'Monitoramento contínuo de listas restritivas (OFAC, ONU), identificação de PEPs e cálculos de risco em tempo real.',
        items: ['Screening Dinâmico', 'Detecção PEP', 'Listas OFAC/ONU', 'Score de Risco'],
    },
    {
        icon: <Lock size={24} style={{ stroke: C.accent }} />,
        title: 'Privacidade LGPD',
        desc: 'Automação do Registro de Atividades de Tratamento (RAT), fluxos de exclusão de dados e adequação imediata.',
        items: ['Relatórios de Impacto (RIPD)', 'Logs Imutáveis', 'Fluxo de Exclusão', 'Adequação ANPD'],
    },
    {
        icon: <FileText size={24} style={{ stroke: C.amber }} />,
        title: 'Governança (Anticorrupção)',
        desc: 'Estruture a Due Diligence de fornecedores B2B e gere relatórios exigidos pela Lei 12.846/13 com um único clique.',
        items: ['Exportação PDF Certificada', 'Checklists Personalizados', 'Audit Trail', 'Lei 12.846/13'],
    },
]

function SolutionCard({ icon, title, desc, items }: typeof SOLUTIONS[0]) {
    const [hovered, setHovered] = useState(false)
    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: hovered ? '#14171d' : C.bgSurface,
                border: `1px solid ${C.border}`,
                padding: '3rem 2rem',
                borderRadius: 8,
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
                boxShadow: hovered ? `inset 0 20px 40px -20px rgba(0,229,255,0.1)` : 'none',
            }}>
            {/* Inner glow border on hover */}
            <div style={{
                position: 'absolute', inset: 0, borderRadius: 8,
                boxShadow: `inset 0 0 0 1px ${C.accent}`,
                opacity: hovered ? 1 : 0,
                transition: 'opacity 0.3s',
                pointerEvents: 'none',
            }} />

            {/* Icon */}
            <div style={{
                width: 48, height: 48, borderRadius: 8,
                background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '2rem',
            }}>
                {icon}
            </div>

            <h3 style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontWeight: 600, fontSize: '1.25rem',
                color: C.textPrimary, marginBottom: '1rem',
            }}>{title}</h3>

            <p style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                color: C.textSecondary, fontSize: '0.95rem', lineHeight: 1.6,
                marginBottom: '1.5rem',
            }}>{desc}</p>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {items.map(item => (
                    <li key={item} style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        marginBottom: '0.75rem', color: C.textSecondary,
                        fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '0.9rem',
                    }}>
                        <span style={{
                            display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                            background: C.accent, boxShadow: `0 0 8px ${C.accent}`,
                            flexShrink: 0,
                        }} />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    )
}

/* ─── Tech Stack Section ─────────────────────────────────── */
const STACK = [
    { icon: '⚡', name: 'Next.js 14', desc: 'App Router + RSC' },
    { icon: '🔐', name: 'Fastify', desc: 'API de alta performance' },
    { icon: '🗄️', name: 'PostgreSQL', desc: 'Drizzle ORM + migrations' },
    { icon: '📡', name: 'Redis', desc: 'Cache + filas de jobs' },
]

/* ─── Regulation Badges ──────────────────────────────────── */
const REGS = ['PLD/FT', 'LGPD', 'BACEN 3.909', 'COAF', 'CVM', 'SUSEP', 'Lei 12.846/13', 'OFAC', 'ONU Sanctions', 'ISO 27001', 'ISO 27701', 'SOC 2']

/* ─── Main Page ──────────────────────────────────────────── */
export default function LandingPage() {
    return (
        <div style={{
            background: C.bgBase, color: C.textPrimary,
            fontFamily: "'IBM Plex Sans', sans-serif",
            lineHeight: 1.6, overflowX: 'hidden',
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
                * { margin: 0; padding: 0; box-sizing: border-box; -webkit-font-smoothing: antialiased; }
                a { color: inherit; text-decoration: none; }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>

            <ScrollProgress />
            <Navbar />
            <Hero />

            {/* ── Solutions Section ── */}
            <section style={{ padding: '8rem 2rem', background: C.bgSurface }}>
                <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '3rem', color: C.textPrimary, marginBottom: '1rem' }}>
                            Soluções de Risco e Conformidade
                        </h2>
                        <p style={{ color: C.textSecondary, fontSize: '1.1rem', maxWidth: 600, margin: '0 auto' }}>
                            Três pilares fundamentais, geridos em um único centro de comando criptográfico.
                        </p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {SOLUTIONS.map(s => <SolutionCard key={s.title} {...s} />)}
                    </div>
                </div>
            </section>

            {/* ── Regulations section ── */}
            <section style={{ padding: '8rem 2rem', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '3rem', color: C.textPrimary, marginBottom: '1rem' }}>
                            Cobertura Regulatória Completa
                        </h2>
                        <p style={{ color: C.textSecondary }}>
                            Atenda às principais normas e frameworks internacionais e brasileiros.
                        </p>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', maxWidth: 900, margin: '0 auto 2rem' }}>
                        {REGS.map(reg => (
                            <span key={reg} style={{
                                padding: '0.75rem 1.5rem',
                                border: `1px solid ${C.border}`, borderRadius: 4,
                                fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem',
                                color: C.textPrimary, background: 'rgba(255,255,255,0.02)',
                                transition: 'all 0.2s', cursor: 'default',
                            }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.textSecondary; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)' }}>
                                {reg}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Stack Section ── */}
            <section style={{ padding: '8rem 2rem', background: C.bgSurface }}>
                <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
                            Stack Tecnológico
                        </p>
                        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '3rem', color: C.textPrimary }}>
                            Construído para Escala e Segurança
                        </h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
                        {STACK.map(s => (
                            <div key={s.name} style={{
                                padding: '2rem', borderRadius: 8,
                                border: `1px solid ${C.border}`, background: C.bgBase,
                                display: 'flex', flexDirection: 'column', gap: '1rem',
                            }}>
                                <div style={{ fontSize: '2rem' }}>{s.icon}</div>
                                <div>
                                    <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, color: C.textPrimary, marginBottom: '0.25rem' }}>{s.name}</p>
                                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: C.textSecondary }}>{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Final ── */}
            <section style={{ padding: '8rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                    width: '60vw', height: '60vw', borderRadius: '50%',
                    background: `radial-gradient(circle, rgba(0,229,255,0.07) 0%, transparent 60%)`,
                    pointerEvents: 'none',
                }} />
                <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative', zIndex: 2 }}>
                    <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: C.textPrimary, marginBottom: '1.5rem' }}>
                        Pronto para Automatizar o seu Compliance?
                    </h2>
                    <p style={{ color: C.textSecondary, fontSize: '1.1rem', marginBottom: '2.5rem' }}>
                        Comece agora e tenha controle total sobre riscos regulatórios, privacidade e governança.
                    </p>
                    <Link href="/dashboard" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.875rem 2rem',
                        background: C.accent, color: C.bgBase,
                        borderRadius: 4, border: '1px solid transparent',
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        fontWeight: 600, fontSize: '0.875rem',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        textDecoration: 'none',
                        boxShadow: `0 0 30px ${C.accentGlow}`,
                        transition: 'all 0.2s ease',
                    }}>
                        Acessar Plataforma <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer style={{
                background: C.bgSurface,
                borderTop: `1px solid ${C.border}`,
                padding: '3rem 2rem',
            }}>
                <div style={{
                    maxWidth: 1280, margin: '0 auto',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.textSecondary} strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: C.textPrimary }}>ComplianceOS</span>
                    </div>
                    <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '0.85rem', color: C.textSecondary }}>
                        © 2026 Chuangxin Tecnologia da Informação Ltda. Reservados os direitos sob a IP.
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        {['Termos', 'Privacidade', 'Contato'].map(l => (
                            <Link key={l} href="/dashboard" style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '0.875rem', color: C.textSecondary, transition: 'color 0.2s' }}
                                onMouseEnter={e => (e.currentTarget.style.color = C.textPrimary)}
                                onMouseLeave={e => (e.currentTarget.style.color = C.textSecondary)}>
                                {l}
                            </Link>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    )
}
