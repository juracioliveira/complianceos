'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PublicNav, PublicFooter, PageHero } from '@/components/public/PublicLayout'

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
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
            <PublicNav />
            <PageHero breadcrumb="Contato" title="Fale com a nossa equipe" subtitle="Resposta em até 24 horas úteis. Para suporte urgente de clientes, acesse o chat dentro da plataforma." />
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid md:grid-cols-[1fr_1.5fr] gap-24 items-start">

                    {/* Left — info */}
                    <div className="space-y-16">
                        <div className="group">
                            <div className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 group-hover:text-brand-600 transition-colors">Vendas & Demonstrações</div>
                            <div className="text-lg text-slate-600 leading-relaxed mb-4 font-sans">Para agendar uma demonstração personalizada ou falar sobre planos Enterprise:</div>
                            <div className="font-mono text-sm font-bold text-brand-600 bg-brand-50/50 px-3 py-1.5 rounded-full w-fit border border-brand-100/50">comercial@complianceos.com.br</div>
                        </div>
                        <div className="pt-12 border-t border-slate-200/80 group">
                            <div className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 group-hover:text-brand-600 transition-colors">Suporte Técnico</div>
                            <div className="text-lg text-slate-600 leading-relaxed mb-4 font-sans">Clientes com plano ativo: acesse o suporte direto no dashboard ou envie para:</div>
                            <div className="font-mono text-sm font-bold text-brand-600 bg-brand-50/50 px-3 py-1.5 rounded-full w-fit border border-brand-100/50">suporte@complianceos.com.br</div>
                        </div>
                        <div className="pt-12 border-t border-slate-200/80 group">
                            <div className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 group-hover:text-brand-600 transition-colors">Privacidade & Legal</div>
                            <div className="space-y-2">
                                <div className="font-mono text-sm text-slate-500 font-medium">privacidade@complianceos.com.br</div>
                                <div className="font-mono text-sm text-slate-500 font-medium">legal@complianceos.com.br</div>
                            </div>
                        </div>
                        <div className="pt-12 border-t border-slate-200/80 group">
                            <div className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 group-hover:text-brand-600 transition-colors">Segurança</div>
                            <div className="text-lg text-slate-600 leading-relaxed mb-4 font-sans">Para relatar vulnerabilidades de segurança de forma responsável:</div>
                            <div className="font-mono text-sm font-bold text-brand-600 bg-brand-50/50 px-3 py-1.5 rounded-full w-fit border border-brand-100/50">security@complianceos.com.br</div>
                        </div>
                    </div>

                    {/* Right — form */}
                    {sent ? (
                        <div className="p-16 border border-brand-100 bg-brand-50/20 backdrop-blur-sm rounded-[2.5rem] text-center shadow-2xl shadow-brand-600/5 animate-in fade-in zoom-in duration-500 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 blur-3xl rounded-full" />
                            <div className="font-mono text-[10px] font-bold text-brand-600 mb-6 uppercase tracking-widest">✓ Mensagem enviada</div>
                            <h3 className="font-display text-4xl text-slate-900 mb-6 tracking-tight">Obrigado pelo contato!</h3>
                            <p className="text-lg text-slate-600 leading-relaxed mb-10 font-sans">Nossa equipe responderá em até 24 horas úteis. Se for urgente, entre em contato direto por e-mail.</p>
                            <button onClick={() => setSent(false)} className="px-8 py-3.5 bg-white border border-slate-200 hover:border-brand-600 hover:text-brand-600 text-slate-700 font-bold text-sm rounded-full shadow-lg shadow-slate-200/50 transition-all active:scale-95">
                                Nova mensagem
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-8 bg-white p-10 rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/40">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Nome *</label>
                                    <input required type="text" placeholder="Rafael Mendes" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-900 text-sm outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all" />
                                </div>
                                <div>
                                    <label className="block font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Cargo *</label>
                                    <input required type="text" placeholder="CCO / Compliance Manager" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-900 text-sm outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all" />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">E-mail corporativo *</label>
                                    <input required type="email" placeholder="rafael@acmefintech.com.br" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-900 text-sm outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all" />
                                </div>
                                <div>
                                    <label className="block font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Empresa</label>
                                    <input type="text" placeholder="Acme Fintech Ltda." className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-900 text-sm outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="block font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Assunto *</label>
                                <select required value={topic} onChange={e => setTopic(e.target.value)} className={`w-full px-5 py-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all appearance-none ${topic ? 'text-slate-900' : 'text-slate-400'}`}>
                                    <option value="" disabled>Selecione o tema</option>
                                    {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Mensagem *</label>
                                <textarea required rows={5} placeholder="Descreva sua necessidade..." className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-900 text-sm outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all resize-y" />
                            </div>
                            <div className="flex items-start gap-3">
                                <input required type="checkbox" id="consent" className="mt-1 w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                                <label htmlFor="consent" className="text-[0.8125rem] text-slate-500 leading-relaxed">
                                    Li e aceito a <Link href="/privacidade" className="text-brand-600 hover:text-brand-700 font-medium">Política de Privacidade</Link> e concordo com o tratamento dos meus dados para retorno do contato.
                                </label>
                            </div>
                            <button type="submit" className="self-start px-10 py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-full shadow-xl shadow-brand-600/25 transition-all active:scale-95 uppercase tracking-[0.15em]">
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
