import type { Metadata } from 'next'
import Link from 'next/link'
import { PublicNav, PublicFooter, PageHero } from '@/components/public/PublicLayout'

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
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
            <PublicNav />
            <PageHero
                breadcrumb="Regulatório / LGPD"
                title="Adequação à LGPD sem fricção operacional"
                subtitle="O ComplianceOS automatiza os requisitos práticos da Lei 13.709/18 — do RAT ao atendimento de titulares, com trilha imutável para a ANPD."
            />
            <div className="max-w-7xl mx-auto px-6 py-20">
                <section className="mb-20">
                    <h2 className="font-semibold text-lg text-slate-900 mb-8 pb-3 border-b border-slate-200">
                        Módulos de Adequação LGPD
                    </h2>
                    <div className="grid md:grid-cols-2 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                        {MODULES.map(m => (
                            <div key={m.title} className="bg-white p-8 hover:bg-slate-50 transition-colors">
                                <div className="font-semibold text-[0.9375rem] text-brand-600 mb-3">{m.title}</div>
                                <div className="text-[0.9375rem] text-slate-600 leading-relaxed">{m.desc}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-20">
                    <h2 className="font-semibold text-lg text-slate-900 mb-8 pb-3 border-b border-slate-200">
                        Direitos dos Titulares — Art. 18 LGPD
                    </h2>
                    <div className="grid md:grid-cols-3 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                        {RIGHTS.map(r => (
                            <div key={r.code} className="bg-white p-6 hover:bg-slate-50 transition-colors">
                                <div className="font-mono text-[0.65rem] font-medium text-slate-500 mb-2 tracking-wide uppercase">{r.code}</div>
                                <div className="font-semibold text-[0.9375rem] text-slate-900 mb-2">{r.right}</div>
                                <div className="text-[0.875rem] text-slate-600 leading-relaxed">{r.desc}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="p-8 border border-slate-200 bg-white rounded-xl shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-6">
                    <div>
                        <div className="font-semibold text-base text-slate-900 mb-2">Precisa do Data Processing Agreement?</div>
                        <p className="text-[0.9375rem] text-slate-600">O DPA do ComplianceOS está disponível para todos os planos. Acesse pelo dashboard ou solicite via e-mail.</p>
                    </div>
                    <Link href="/dashboard" className="shrink-0 inline-flex items-center justify-center px-6 py-3 bg-brand-600 text-white font-medium text-[0.875rem] rounded-lg shadow-sm shadow-brand-600/20 hover:bg-brand-700 transition-colors">
                        Acessar DPA →
                    </Link>
                </div>
            </div>
            <PublicFooter />
        </div>
    )
}
