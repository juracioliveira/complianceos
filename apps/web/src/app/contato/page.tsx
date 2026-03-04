'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PublicNav, PublicFooter, PageHero, pageStyle, contentWrap, CYAN, SURFACE, LINE, LINE_STRONG, TEXT, MUTED, UI, MONO } from '@/components/public/PublicLayout'

const TOPICS = [
    'Demonstração da plataforma',
    'Plano Enterprise (preços e SLA)',
    'Migração de sistema existente',
    'Integração via API',
    'Dúvidas sobre compliance regulatório',
    'Suporte técnico',
    'Outro',
]

export default function ContatoPage() {
    const [topic, setTopic] = useState('')
    const [sent, setSent] = useState(false)

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSent(true)
    }

    return (
        <div style={pageStyle}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
            <PublicNav />
            <PageHero breadcrumb="Contato" title="Fale com a nossa equipe" subtitle="Resposta em até 24 horas úteis. Para suporte urgente de clientes, acesse o chat dentro da plataforma." />
            <div style={contentWrap}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '6rem', alignItems: 'start' }}>

                    {/* Left — info */}
                    <div>
                        <div style={{ marginBottom: '3rem' }}>
                            <div style={{ fontFamily: MONO, fontSize: '.65rem', color: '#3A4152', textTransform: 'uppercase' as const, letterSpacing: '.1em', marginBottom: '1.25rem' }}>Vendas & Demonstrações</div>
                            <div style={{ fontFamily: UI, fontSize: '.875rem', color: MUTED, lineHeight: 1.75, marginBottom: '.5rem' }}>Para agendar uma demonstração personalizada ou falar sobre planos Enterprise:</div>
                            <div style={{ fontFamily: MONO, fontSize: '.8rem', color: CYAN }}>comercial@complianceos.com.br</div>
                        </div>
                        <div style={{ marginBottom: '3rem', paddingTop: '2rem', borderTop: `1px solid ${LINE}` }}>
                            <div style={{ fontFamily: MONO, fontSize: '.65rem', color: '#3A4152', textTransform: 'uppercase' as const, letterSpacing: '.1em', marginBottom: '1.25rem' }}>Suporte Técnico</div>
                            <div style={{ fontFamily: UI, fontSize: '.875rem', color: MUTED, lineHeight: 1.75, marginBottom: '.5rem' }}>Clientes com plano ativo: acesse o suporte direto no dashboard ou envie para:</div>
                            <div style={{ fontFamily: MONO, fontSize: '.8rem', color: CYAN }}>suporte@complianceos.com.br</div>
                        </div>
                        <div style={{ marginBottom: '3rem', paddingTop: '2rem', borderTop: `1px solid ${LINE}` }}>
                            <div style={{ fontFamily: MONO, fontSize: '.65rem', color: '#3A4152', textTransform: 'uppercase' as const, letterSpacing: '.1em', marginBottom: '1.25rem' }}>Privacidade & Legal</div>
                            <div style={{ fontFamily: MONO, fontSize: '.8rem', color: MUTED, marginBottom: '.25rem' }}>privacidade@complianceos.com.br</div>
                            <div style={{ fontFamily: MONO, fontSize: '.8rem', color: MUTED }}>legal@complianceos.com.br</div>
                        </div>
                        <div style={{ paddingTop: '2rem', borderTop: `1px solid ${LINE}` }}>
                            <div style={{ fontFamily: MONO, fontSize: '.65rem', color: '#3A4152', textTransform: 'uppercase' as const, letterSpacing: '.1em', marginBottom: '1.25rem' }}>Segurança</div>
                            <div style={{ fontFamily: UI, fontSize: '.8125rem', color: MUTED, lineHeight: 1.65 }}>Para relatar vulnerabilidades de segurança de forma responsável:</div>
                            <div style={{ fontFamily: MONO, fontSize: '.8rem', color: CYAN, marginTop: '.25rem' }}>security@complianceos.com.br</div>
                        </div>
                    </div>

                    {/* Right — form */}
                    {sent ? (
                        <div style={{ padding: '3rem', border: `1px solid rgba(0,200,224,.2)`, background: 'rgba(0,200,224,0.03)', textAlign: 'center' as const }}>
                            <div style={{ fontFamily: MONO, fontSize: '.75rem', color: CYAN, marginBottom: '1rem' }}>✓ Mensagem enviada</div>
                            <h3 style={{ fontFamily: UI, fontWeight: 600, fontSize: '1.125rem', color: TEXT, marginBottom: '.875rem' }}>Obrigado pelo contato!</h3>
                            <p style={{ fontFamily: UI, fontSize: '.875rem', color: MUTED, lineHeight: 1.7, marginBottom: '2rem' }}>Nossa equipe responderá em até 24 horas úteis. Se for urgente, entre em contato direto por e-mail.</p>
                            <button onClick={() => setSent(false)} style={{ background: 'transparent', border: `1px solid ${LINE_STRONG}`, color: TEXT, fontFamily: UI, fontSize: '.8125rem', padding: '.625rem 1.25rem', cursor: 'pointer' }}>
                                Nova mensagem
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' as const, gap: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontFamily: MONO, fontSize: '.65rem', color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '.08em', display: 'block', marginBottom: '.5rem' }}>Nome *</label>
                                    <input required type="text" placeholder="Rafael Mendes" style={{ width: '100%', padding: '.75rem 1rem', background: SURFACE, border: `1px solid ${LINE}`, color: TEXT, fontFamily: UI, fontSize: '.875rem', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ fontFamily: MONO, fontSize: '.65rem', color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '.08em', display: 'block', marginBottom: '.5rem' }}>Cargo *</label>
                                    <input required type="text" placeholder="CCO / Compliance Manager" style={{ width: '100%', padding: '.75rem 1rem', background: SURFACE, border: `1px solid ${LINE}`, color: TEXT, fontFamily: UI, fontSize: '.875rem', outline: 'none' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontFamily: MONO, fontSize: '.65rem', color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '.08em', display: 'block', marginBottom: '.5rem' }}>E-mail corporativo *</label>
                                    <input required type="email" placeholder="rafael@acmefintech.com.br" style={{ width: '100%', padding: '.75rem 1rem', background: SURFACE, border: `1px solid ${LINE}`, color: TEXT, fontFamily: UI, fontSize: '.875rem', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ fontFamily: MONO, fontSize: '.65rem', color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '.08em', display: 'block', marginBottom: '.5rem' }}>Empresa</label>
                                    <input type="text" placeholder="Acme Fintech Ltda." style={{ width: '100%', padding: '.75rem 1rem', background: SURFACE, border: `1px solid ${LINE}`, color: TEXT, fontFamily: UI, fontSize: '.875rem', outline: 'none' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontFamily: MONO, fontSize: '.65rem', color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '.08em', display: 'block', marginBottom: '.5rem' }}>Assunto *</label>
                                <select required value={topic} onChange={e => setTopic(e.target.value)} style={{ width: '100%', padding: '.75rem 1rem', background: SURFACE, border: `1px solid ${LINE}`, color: topic ? TEXT : MUTED, fontFamily: UI, fontSize: '.875rem', outline: 'none', appearance: 'none' as const }}>
                                    <option value="" disabled>Selecione o tema</option>
                                    {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontFamily: MONO, fontSize: '.65rem', color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '.08em', display: 'block', marginBottom: '.5rem' }}>Mensagem *</label>
                                <textarea required rows={5} placeholder="Descreva sua necessidade..." style={{ width: '100%', padding: '.75rem 1rem', background: SURFACE, border: `1px solid ${LINE}`, color: TEXT, fontFamily: UI, fontSize: '.875rem', outline: 'none', resize: 'vertical' as const }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                                <input required type="checkbox" id="consent" style={{ accentColor: CYAN }} />
                                <label htmlFor="consent" style={{ fontFamily: UI, fontSize: '.8125rem', color: MUTED, lineHeight: 1.5 }}>
                                    Li e aceito a <Link href="/privacidade" style={{ color: CYAN }}>Política de Privacidade</Link> e concordo com o tratamento dos meus dados para retorno do contato.
                                </label>
                            </div>
                            <button type="submit" style={{ padding: '.75rem 1.5rem', background: CYAN, color: '#FFFFFF', border: 'none', fontFamily: UI, fontWeight: 600, fontSize: '.875rem', letterSpacing: '.04em', textTransform: 'uppercase' as const, cursor: 'pointer', alignSelf: 'flex-start' as const }}>
                                Enviar mensagem →
                            </button>
                        </form>
                    )}
                </div>
            </div>
            <PublicFooter />
        </div>
    )
}
