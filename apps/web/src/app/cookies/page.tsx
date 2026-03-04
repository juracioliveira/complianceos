import type { Metadata } from 'next'
import { PublicNav, PublicFooter, PageHero, pageStyle, contentWrap, CYAN, SURFACE, LINE, TEXT, MUTED, UI, MONO } from '@/components/public/PublicLayout'

export const metadata: Metadata = {
    title: 'Política de Cookies | ComplianceOS',
    description: 'Como o ComplianceOS usa cookies e tecnologias similares.',
}

const COOKIES = [
    {
        type: 'Essenciais', required: true, cookies: [
            { name: 'cos_session', purpose: 'Sessão autenticada do usuário', duration: 'Sessão / 24h', party: '1ª parte' },
            { name: 'cos_csrf', purpose: 'Proteção contra Cross-Site Request Forgery', duration: 'Sessão', party: '1ª parte' },
            { name: 'cos_tenant', purpose: 'Identificação do tenant ativo', duration: '30 dias', party: '1ª parte' },
        ]
    },
    {
        type: 'Funcionais', required: false, cookies: [
            { name: 'cos_prefs', purpose: 'Preferências de interface (tema, idioma)', duration: '1 ano', party: '1ª parte' },
            { name: 'cos_last_route', purpose: 'Última rota acessada para redirecionamento', duration: '7 dias', party: '1ª parte' },
        ]
    },
    {
        type: 'Desempenho & Análise', required: false, cookies: [
            { name: 'dd_rum_*', purpose: 'Monitoramento de performance (Datadog RUM)', duration: 'Sessão', party: '3ª parte' },
            { name: '__hstc', purpose: 'Análise de comportamento de usuário (HubSpot)', duration: '13 meses', party: '3ª parte' },
        ]
    },
]

export default function CookiesPage() {
    return (
        <div style={pageStyle}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
            <PublicNav />
            <PageHero breadcrumb="Legal / Cookies" title="Política de Cookies" subtitle="Quais cookies utilizamos, por quê e como você pode controlá-los." />
            <div style={contentWrap}>
                <p style={{ fontFamily: UI, fontSize: '.9375rem', color: MUTED, lineHeight: 1.8, maxWidth: 720, marginBottom: '3rem' }}>
                    O ComplianceOS usa cookies e tecnologias similares para garantir o funcionamento da plataforma, lembrar suas preferências e, com seu consentimento, analisar o desempenho. Cookies essenciais não podem ser desativados pois são necessários para a operação básica do sistema.
                </p>

                {COOKIES.map(cat => (
                    <div key={cat.type} style={{ marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.875rem', marginBottom: '1.25rem' }}>
                            <h2 style={{ fontFamily: UI, fontWeight: 600, fontSize: '1rem', color: TEXT }}>{cat.type}</h2>
                            <span style={{ fontFamily: MONO, fontSize: '.65rem', padding: '.2rem .5rem', border: `1px solid ${cat.required ? 'rgba(0,163,191,.3)' : LINE}`, color: cat.required ? CYAN : MUTED }}>
                                {cat.required ? 'Sempre Ativo' : 'Opcional'}
                            </span>
                        </div>
                        {/* Table */}
                        <div style={{ border: `1px solid ${LINE}`, overflow: 'hidden' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 1fr', padding: '.5rem 1rem', background: SURFACE, borderBottom: `1px solid ${LINE}` }}>
                                {['Cookie', 'Finalidade', 'Duração', 'Parte'].map(h => (
                                    <span key={h} style={{ fontFamily: MONO, fontSize: '.65rem', color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '.06em' }}>{h}</span>
                                ))}
                            </div>
                            {cat.cookies.map((c, i) => (
                                <div key={c.name} style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 1fr', padding: '.875rem 1rem', borderBottom: i < cat.cookies.length - 1 ? `1px solid ${LINE}` : undefined, alignItems: 'center' }}>
                                    <span style={{ fontFamily: MONO, fontSize: '.75rem', color: CYAN }}>{c.name}</span>
                                    <span style={{ fontFamily: UI, fontSize: '.8125rem', color: MUTED }}>{c.purpose}</span>
                                    <span style={{ fontFamily: MONO, fontSize: '.7rem', color: MUTED }}>{c.duration}</span>
                                    <span style={{ fontFamily: MONO, fontSize: '.7rem', color: MUTED }}>{c.party}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div style={{ padding: '2rem', border: `1px solid ${LINE}`, background: SURFACE, marginTop: '1rem' }}>
                    <h3 style={{ fontFamily: UI, fontWeight: 600, fontSize: '.9375rem', color: TEXT, marginBottom: '.875rem' }}>Como gerenciar cookies</h3>
                    <p style={{ fontFamily: UI, fontSize: '.875rem', color: MUTED, lineHeight: 1.75 }}>
                        Cookies opcionais podem ser desativados pelo painel de preferências disponível no rodapé da plataforma ou nas configurações do seu navegador. A desativação de cookies essenciais impede o funcionamento da plataforma. Para cookies de terceiros, consulte as políticas de privacidade das respectivas empresas.
                    </p>
                </div>
            </div>
            <PublicFooter />
        </div>
    )
}
