import type { Metadata } from 'next'
import Link from 'next/link'
import { PublicNav, PublicFooter, PageHero, pageStyle, contentWrap, CYAN, SURFACE, LINE, LINE_STRONG, TEXT, MUTED, UI, MONO } from '@/components/public/PublicLayout'

export const metadata: Metadata = {
    title: 'LGPD — Adequação & Privacidade | ComplianceOS',
    description: 'Como o ComplianceOS te ajuda a estar em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/18).',
}

const RIGHTS = [
    { code: 'Art. 18, I', right: 'Confirmação e acesso', desc: 'O titular pode solicitar confirmação sobre o tratamento de seus dados e acesso ao conteúdo.' },
    { code: 'Art. 18, II', right: 'Correção de dados', desc: 'Dados incompletos, inexatos ou desatualizados devem ser corrigidos mediante solicitação.' },
    { code: 'Art. 18, IV', right: 'Anonimização ou eliminação', desc: 'Dados desnecessários ou tratados sem consentimento devem ser anonimizados ou eliminados.' },
    { code: 'Art. 18, V', right: 'Portabilidade', desc: 'Mediante regulamentação da ANPD, o titular pode solicitar a portabilidade dos seus dados.' },
    { code: 'Art. 18, VI', right: 'Eliminação após consentimento', desc: 'Dados tratados com consentimento podem ser eliminados a pedido do titular.' },
    { code: 'Art. 18, VII', right: 'Informações sobre compartilhamento', desc: 'O titular tem direito a saber com quais entidades seus dados foram compartilhados.' },
]

const MODULES = [
    { title: 'RAT — Registro de Atividades de Tratamento', desc: 'Crie e mantenha o Registro de Atividades de Tratamento exigido pelo Art. 37 da LGPD. O ComplianceOS organiza finalidades, bases legais, categorias de dados e medidas de segurança por operação de tratamento.' },
    { title: 'Gestão de Consentimento', desc: 'Rastreie e documente os consentimentos coletados, sua base legal, data de coleta e eventuais revogações. Logs imutáveis com trilha de auditoria por titular.' },
    { title: 'Resposta a Titulares (DSR)', desc: 'Fluxo automatizado para receber, priorizar e responder solicitações de direitos de titulares dentro do prazo legal (15 dias corridos). Notificações automáticas e histórico por titular.' },
    { title: 'RIPD — Relatório de Impacto', desc: 'Gere Relatórios de Impacto à Proteção de Dados (Art. 38) com templates estruturados por tipo de operação de tratamento, já nos formatos aguardados pela ANPD.' },
    { title: 'Mapeamento de Dados Pessoais', desc: 'Identifique, classifique e documente todos os dados pessoais tratados pela organização — incluindo dados sensíveis (Art. 11) e dados de crianças e adolescentes (Art. 14).' },
    { title: 'Incidentes de Segurança', desc: 'Registre e gerencie incidentes envolvendo dados pessoais (Art. 48). O sistema calcula prazos de comunicação à ANPD e aos titulares afetados automaticamente.' },
]

export default function LgpdPage() {
    return (
        <div style={pageStyle}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
            <PublicNav />
            <PageHero
                breadcrumb="Regulatório / LGPD"
                title="Adequação à LGPD sem fricção operacional"
                subtitle="O ComplianceOS automatiza os requisitos práticos da Lei 13.709/18 — do RAT ao atendimento de titulares, com trilha imutável para a ANPD."
            />
            <div style={contentWrap}>
                <section style={{ marginBottom: '5rem' }}>
                    <h2 style={{ fontFamily: UI, fontWeight: 600, fontSize: '1.0625rem', color: TEXT, marginBottom: '2rem', paddingBottom: '.875rem', borderBottom: `1px solid ${LINE}` }}>
                        Módulos de Adequação LGPD
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1px', background: LINE }}>
                        {MODULES.map(m => (
                            <div key={m.title} style={{ background: '#0A0C10', padding: '2rem' }}>
                                <div style={{ fontFamily: UI, fontWeight: 600, fontSize: '.9rem', color: CYAN, marginBottom: '.625rem' }}>{m.title}</div>
                                <div style={{ fontFamily: UI, fontSize: '.875rem', color: MUTED, lineHeight: 1.7 }}>{m.desc}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <section style={{ marginBottom: '5rem' }}>
                    <h2 style={{ fontFamily: UI, fontWeight: 600, fontSize: '1.0625rem', color: TEXT, marginBottom: '2rem', paddingBottom: '.875rem', borderBottom: `1px solid ${LINE}` }}>
                        Direitos dos Titulares — Art. 18 LGPD
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: LINE }}>
                        {RIGHTS.map(r => (
                            <div key={r.code} style={{ background: '#0A0C10', padding: '1.5rem' }}>
                                <div style={{ fontFamily: MONO, fontSize: '.65rem', color: '#3A4152', marginBottom: '.25rem' }}>{r.code}</div>
                                <div style={{ fontFamily: UI, fontWeight: 600, fontSize: '.875rem', color: TEXT, marginBottom: '.5rem' }}>{r.right}</div>
                                <div style={{ fontFamily: UI, fontSize: '.8125rem', color: MUTED, lineHeight: 1.6 }}>{r.desc}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <div style={{ padding: '2rem', border: `1px solid ${LINE_STRONG}`, background: SURFACE, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: '1.5rem' }}>
                    <div>
                        <div style={{ fontFamily: UI, fontWeight: 600, fontSize: '1rem', color: TEXT, marginBottom: '.375rem' }}>Precisa do Data Processing Agreement?</div>
                        <p style={{ fontFamily: UI, fontSize: '.875rem', color: MUTED }}>O DPA do ComplianceOS está disponível para todos os planos. Acesse pelo dashboard ou solicite via e-mail.</p>
                    </div>
                    <Link href="/dashboard" style={{ display: 'inline-flex', padding: '.625rem 1.25rem', background: CYAN, color: '#0A0C10', fontFamily: UI, fontWeight: 500, fontSize: '.8125rem', letterSpacing: '.04em', textTransform: 'uppercase' as const, textDecoration: 'none' }}>
                        Acessar DPA →
                    </Link>
                </div>
            </div>
            <PublicFooter />
        </div>
    )
}
