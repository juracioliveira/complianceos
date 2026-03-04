'use client'

import { useEffect, useState } from 'react'

/**
 * MobileWall — blocks access to the authenticated app on mobile devices.
 * The landing page (/), login (/login) and public routes are NOT wrapped by this.
 * Only the (app) layout group uses this component.
 */
export function MobileWall({ children }: { children: React.ReactNode }) {
    const [isMobile, setIsMobile] = useState(false)
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        const check = () => {
            setIsMobile(window.innerWidth < 1024)
            setChecked(true)
        }
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    // Avoid hydration flash
    if (!checked) return null

    if (isMobile) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                textAlign: 'center',
                fontFamily: "'IBM Plex Sans', sans-serif",
                color: '#0F172A',
            }}>
                {/* Grid background */}
                <div style={{
                    position: 'fixed', inset: 0, pointerEvents: 'none',
                    backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(-45deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }} />

                {/* Glow */}
                <div style={{
                    position: 'fixed', top: '-30%', left: '50%', transform: 'translateX(-50%)',
                    width: '80vw', height: '80vw', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0,163,191,0.05) 0%, transparent 60%)',
                    pointerEvents: 'none',
                }} />

                <div style={{ position: 'relative', zIndex: 2, maxWidth: 360 }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00A3BF" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.5px' }}>
                            Compliance<span style={{ color: '#00A3BF' }}>OS</span>
                        </span>
                    </div>

                    {/* Monitor icon */}
                    <div style={{
                        width: 64, height: 64, borderRadius: 12, margin: '0 auto 1.5rem',
                        background: 'rgba(0,163,191,0.05)', border: '1px solid rgba(0,163,191,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00A3BF" strokeWidth="1.5">
                            <rect x="2" y="3" width="20" height="14" rx="2" />
                            <path d="M8 21h8M12 17v4" />
                        </svg>
                    </div>

                    <h1 style={{
                        fontFamily: "'DM Serif Display', serif",
                        fontSize: '1.75rem', fontWeight: 'normal', lineHeight: 1.2,
                        color: '#0F172A', marginBottom: '1rem',
                    }}>
                        Use o ComplianceOS<br />no desktop
                    </h1>

                    <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                        A plataforma de compliance foi projetada para telas maiores. Acesse por um computador ou notebook para a melhor experiência.
                    </p>

                    <div style={{
                        padding: '1rem', borderRadius: 8,
                        background: 'rgba(0,163,191,0.02)', border: '1px solid rgba(0,163,191,0.05)',
                        fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#475569',
                        marginBottom: '2rem',
                    }}>
                        Resolução mínima recomendada: <span style={{ color: '#00A3BF' }}>1024px</span>
                    </div>

                    <a
                        href="/"
                        style={{
                            display: 'inline-block', padding: '0.75rem 1.5rem',
                            background: 'transparent', border: '1px solid rgba(0,163,191,0.4)',
                            borderRadius: 4, color: '#00A3BF',
                            fontFamily: "'IBM Plex Sans', sans-serif",
                            fontWeight: 600, fontSize: '0.875rem',
                            textTransform: 'uppercase', letterSpacing: '0.5px',
                            textDecoration: 'none',
                        }}
                    >
                        ← Voltar ao início
                    </a>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
