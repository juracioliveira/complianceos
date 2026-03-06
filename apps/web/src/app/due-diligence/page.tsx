import type { Metadata } from 'next'
import { PublicNav, PublicFooter, PageHero } from '@/components/public/PublicLayout'
import { ShieldCheck, Search, FileText, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Due Diligence de Terceiros | ComplianceOS',
    description: 'Automatize a avaliação de riscos dos seus fornecedores e clientes B2B.',
}

export default function DueDiligencePage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
            <PublicNav />
            <PageHero
                breadcrumb="Regulatório / Due Diligence"
                title="Due Diligence Inteligente"
                subtitle="Automatize a avaliação de riscos de fornecedores e parceiros de negócios (KYB) cruzando dezenas de bases de dados exclusivas."
            />

            <div className="max-w-7xl mx-auto px-6 py-20 pb-32">
                <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
                    <div>
                        <h2 className="text-brand-600 font-bold uppercase tracking-wider text-sm mb-3">Lei Anticorrupção & PLD</h2>
                        <h3 className="font-display text-4xl text-slate-900 mb-6 leading-tight">
                            Não deixe terceiros colocarem sua operação em risco.
                        </h3>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            A responsabilidade solidária em casos de lavagem de dinheiro e corrupção exige que sua empresa conheça exatamente quem são seus parceiros. Nosso motor realiza Background Checks em tempo real para expor mídias negativas, envolvimento político, sanções e trabalho escravo.
                        </p>
                        <div className="space-y-4">
                            {[
                                'Análise de Mídias Negativas (Google/Bing News)',
                                'Detecção de PEPs e Relacionados (COAF)',
                                'Trabalho Escravo e IBAMA',
                                'Processos Judiciais (Jusbrasil / Tribunais)'
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-brand-500 shrink-0" />
                                    <span className="text-slate-700 font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-brand-100 rounded-[2rem] transform rotate-3" />
                        <div className="relative bg-white border border-slate-200 shadow-xl rounded-2xl p-8">
                            <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-6">
                                <Search className="w-8 h-8 text-brand-600" />
                                <div>
                                    <div className="text-sm font-bold text-slate-900">Background Check B2B</div>
                                    <div className="text-xs text-slate-500">Monitoramento Contínuo</div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3.5 bg-green-50 rounded-xl border border-green-100">
                                    <span className="text-sm font-medium text-green-900">Receita Federal (Situação Cadastral)</span>
                                    <span className="text-xs font-bold text-green-700 px-2 py-1 bg-green-100/50 rounded">ATIVA</span>
                                </div>
                                <div className="flex justify-between items-center p-3.5 bg-red-50 rounded-xl border border-red-100">
                                    <span className="text-sm font-medium text-red-900">Listas Restritivas (OFAC / ONU)</span>
                                    <span className="text-xs font-bold text-red-700 px-2 py-1 bg-red-100/50 rounded">ALERTA</span>
                                </div>
                                <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-sm font-medium text-slate-700">Mídias Negativas Adicionais</span>
                                    <span className="text-xs font-bold text-slate-500 px-2 py-1 bg-slate-100/50 rounded">NADA CONSTA</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 text-center pt-8 border-t border-slate-200">
                    <div className="p-6">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-3">Conformidade BACEN</h4>
                        <p className="text-sm text-slate-600">Alinhamento completo com a Circular Nº 3.978 para procedimentos de prevenção à lavagem de dinheiro.</p>
                    </div>
                    <div className="p-6">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-3">Workflow Customizado</h4>
                        <p className="text-sm text-slate-600">Crie regras e pesos específicos para aprovar, bloquear ou jogar terceiros para análise manual (fila de compliance).</p>
                    </div>
                    <div className="p-6">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-3">Auditoria Completa</h4>
                        <p className="text-sm text-slate-600">Guarde um dossiê imutável em PDF da avaliação feita no momento da contratação (valioso para fiscalização).</p>
                    </div>
                </div>
            </div>
            <PublicFooter />
        </div>
    )
}
