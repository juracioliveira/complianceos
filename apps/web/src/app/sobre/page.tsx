import type { Metadata } from 'next'
import { PublicNav, PublicFooter, PageHero } from '@/components/public/PublicLayout'
import { ShieldCheck, Heart, Users, Globe2 } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Sobre a Empresa | ComplianceOS',
    description: 'Nossa missão, valores e visão sobre o mercado de compliance no Brasil.',
}

export default function SobrePage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
            <PublicNav />
            <PageHero
                breadcrumb="Empresa / Sobre nós"
                title="Simplificando a Regulação no Brasil."
                subtitle="Construímos o ComplianceOS para democratizar o acesso à inteligência regulatória de nível bancário para fintechs, securitizadoras e PMEs."
            />

            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-display text-slate-900 leading-tight">Nossa História</h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Fundada em 2026 pelo **Grupo Guinle & Chuangxin Tecnologia**, a ComplianceOS nasceu de uma dor real: cumprir regulações do Banco Central, COAF e CVM era caro, manual e extremamente burocrático para operações lean.
                        </p>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Apenas os grandes bancos possuíam tecnologia de ponta para prevenção de lavagem de dinheiro (PLD-FT). Decidimos mudar isso criando um motor de compliance em nuvem, pronto para plugar via API em qualquer operação financeira.
                        </p>
                    </div>
                    <div className="bg-white border border-slate-200/60 rounded-3xl p-10 relative overflow-hidden shadow-2xl shadow-slate-200/50 group hover:scale-[1.01] transition-transform duration-500">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                        <div className="relative z-10">
                            <ShieldCheck className="w-16 h-16 text-brand-600 mb-8 animate-pulse" strokeWidth={1.5} />
                            <h3 className="font-display text-3xl text-slate-900 mb-4">Nossa Missão</h3>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                Proteger o ecossistema financeiro brasileiro através de tecnologia acessível, automatizando 100% da esteira de compliance e permitindo que empreendedores foquem no que importa: <span className="text-brand-600 font-semibold text-accent">crescimento e inovação.</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="py-16">
                    <h2 className="text-center font-display text-4xl mb-4">Nossos Valores Base</h2>
                    <p className="text-center text-slate-500 mb-16 max-w-xl mx-auto font-sans">A cultura que molda cada linha de código do ComplianceOS.</p>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm text-center">
                            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Heart className="w-6 h-6 text-rose-500" />
                            </div>
                            <h4 className="text-xl font-bold mb-3">Customer Trust</h4>
                            <p className="text-slate-600 text-sm">A confiança é nosso ativo principal. Protegemos os dados dos nossos parceiros como se fossem nossos, com auditorias SOC 2 e ISO 27001.</p>
                        </div>
                        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm text-center">
                            <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Users className="w-6 h-6 text-brand-600" />
                            </div>
                            <h4 className="text-xl font-bold mb-3">Colaboração Radical</h4>
                            <p className="text-slate-600 text-sm">Compliance não é para centralizar, é para permear. Construímos ferramentas onde advogados, POs e Devs falam a mesma língua.</p>
                        </div>
                        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm text-center">
                            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Globe2 className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h4 className="text-xl font-bold mb-3">Impacto Sistêmico</h4>
                            <p className="text-slate-600 text-sm">Ao blindar PMEs e fintechs contra más práticas, estamos ajudando a remover dinheiro ilícito do Brasil e do mundo num contexto global.</p>
                        </div>
                    </div>
                </div>
            </div>

            <PublicFooter />
        </div>
    )
}
