import type { Metadata } from 'next'
import Link from 'next/link'
import { PublicNav, PublicFooter, PageHero, pageStyle, contentWrap, CYAN, SURFACE, LINE, LINE_STRONG, TEXT, MUTED, UI, MONO } from '@/components/public/PublicLayout'

export const metadata: Metadata = {
    title: 'Documentação | ComplianceOS',
    description: 'Guias, referência de API e integrações para desenvolvedores ComplianceOS.',
}

const SECTIONS = [
    {
        title: 'Primeiros Passos', icon: '→',
        links: [
            { label: 'Introdução à Plataforma', desc: 'Visão geral e conceitos fundamentais do ComplianceOS.' },
            { label: 'Configuração do Tenant', desc: 'Como criar e configurar seu ambiente de compliance.' },
            { label: 'Importação de Entidades', desc: 'Importe sua base de empresas e pessoas via CSV ou API.' },
            { label: 'Primeiro KYB', desc: 'Execute sua primeira diligência em menos de 5 minutos.' },
        ],
    },
    {
        title: 'API Reference', icon: '⬡',
        links: [
            { label: 'Autenticação JWT', desc: 'Como autenticar suas requisições com tokens RS256.' },
            { label: 'Entidades — /entities', desc: 'CRUD completo para pessoas físicas e jurídicas.' },
            { label: 'Sanções — /screening', desc: 'Endpoint de screening contra listas OFAC, ONU e COAF.' },
            { label: 'Audit Trail — /audit', desc: 'Consulte e exporte o log imutável de eventos.' },
        ],
    },
    {
        title: 'Integrações', icon: '⟳',
        links: [
            { label: 'Webhooks', desc: 'Receba eventos em tempo real no seu sistema.' },
            { label: 'Receita Federal', desc: 'Integração automática para consulta de CNPJ.' },
            { label: 'SAML SSO', desc: 'Single sign-on com seu provedor de identidade corporativo.' },
            { label: 'SCIM Provisioning', desc: 'Provisionamento automático de usuários via SCIM 2.0.' },
        ],
    },
    {
        title: 'Módulos', icon: '◈',
        links: [
            { label: 'KYC/KYB Automatizado', desc: 'Referência completa do módulo de diligência.' },
            { label: 'Screening de Sanções', desc: 'Como funciona o matching e os scores de risco.' },
            { label: 'LGPD & Privacidade', desc: 'Gestão de titulares, RAT e relatórios RIPD.' },
            { label: 'Audit Trail', desc: 'Estrutura dos eventos e exportação para auditores.' },
        ],
    },
]

export default function DocsPage() {
    return (
        <div style={pageStyle}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
            <PublicNav />
            <PageHero
                breadcrumb="Documentação"
                title="Documentação técnica"
                subtitle="Guias, referência de API e integrações para equipes de desenvolvimento e compliance."
            />
            <div style={contentWrap}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '3rem' }}>
                    {SECTIONS.map(s => (
                        <div key={s.title}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.5rem', paddingBottom: '.875rem', borderBottom: `1px solid ${LINE}` }}>
                                <span style={{ fontFamily: MONO, fontSize: '.9rem', color: CYAN }}>{s.icon}</span>
                                <h2 style={{ fontFamily: UI, fontWeight: 600, fontSize: '1rem', color: TEXT }}>{s.title}</h2>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1px', background: LINE }}>
                                {s.links.map(l => (
                                    <div key={l.label} style={{ background: SURFACE, padding: '1rem 1.25rem' }}>
                                        <div style={{ fontFamily: UI, fontWeight: 500, fontSize: '.875rem', color: CYAN, marginBottom: '.25rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                            {l.label} <span style={{ color: MUTED, fontSize: '.75rem' }}>→</span>
                                        </div>
                                        <div style={{ fontFamily: UI, fontSize: '.8125rem', color: MUTED, lineHeight: 1.55 }}>{l.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '4rem', padding: '2rem', border: `1px solid ${LINE}`, background: SURFACE, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div>
                        <div style={{ fontFamily: UI, fontWeight: 600, fontSize: '1rem', color: TEXT, marginBottom: '.375rem' }}>Precisa de ajuda personalizada?</div>
                        <p style={{ fontFamily: UI, fontSize: '.875rem', color: MUTED }}>Nossa equipe de soluções está disponível para integrações complexas e customizações.</p>
                    </div>
                    <Link href="/contato" style={{ display: 'inline-flex', alignItems: 'center' as const, padding: '.625rem 1.25rem', background: CYAN, color: '#FFFFFF', fontFamily: UI, fontWeight: 500, fontSize: '.8125rem', letterSpacing: '.04em', textTransform: 'uppercase' as const, textDecoration: 'none' }}>
                        Falar com especialista →
                    </Link>
                </div>
            </div>
            <PublicFooter />
        </div>
    )
}
