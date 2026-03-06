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
                        <h2 className="text-brand-600 font-bold uppercase tracking-widest text-[10px] mb-4 font-mono">Lei Anticorrupção & PLD</h2>
                        <h3 className="font-display text-4xl lg:text-5xl text-slate-900 mb-8 leading-[1.1] tracking-tight">
                            Não deixe terceiros colocarem sua operação em risco.
                        </h3>
                        <p className="text-lg text-slate-600 mb-10 leading-relaxed font-sans">
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
                    <div className="relative group">
                        <div className="absolute inset-0 bg-brand-600 opacity-[0.03] rounded-[2rem] transform rotate-3 scale-105 group-hover:rotate-1 transition-transform duration-700" />
                        <div className="relative bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-2xl shadow-slate-200/50 rounded-2xl p-8 overflow-hidden hover:scale-[1.01] transition-transform">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 blur-3xl rounded-full" />
                            <div className="flex items-center gap-4 border-b border-slate-100/80 pb-6 mb-6">
                                <Search className="w-8 h-8 text-brand-600" />
                                <div>
                                    <div className="text-sm font-bold text-slate-900 font-display">Background Check B2B</div>
                                    <div className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-tight">Monitoramento Contínuo</div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3.5 bg-green-50/50 rounded-xl border border-green-200/50 group/item hover:bg-green-50 transition-colors">
                                    <span className="text-xs font-semibold text-green-900 font-sans">Receita Federal (Situação Cadastral)</span>
                                    <span className="text-[10px] font-bold text-green-700 px-2 py-1 bg-white border border-green-200 rounded font-mono">ATIVA</span>
                                </div>
                                <div className="flex justify-between items-center p-3.5 bg-rose-50/50 rounded-xl border border-rose-200/50 hover:bg-rose-50 transition-colors">
                                    <span className="text-xs font-semibold text-rose-900 font-sans">Listas Restritivas (OFAC / ONU)</span>
                                    <span className="text-[10px] font-bold text-rose-700 px-2 py-1 bg-white border border-rose-200 rounded font-mono">ALERTA</span>
                                </div>
                                <div className="flex justify-between items-center p-3.5 bg-slate-50/50 rounded-xl border border-slate-200/50 hover:bg-slate-50 transition-colors">
                                    <span className="text-xs font-semibold text-slate-700 font-sans">Mídias Negativas Adicionais</span>
                                    <span className="text-[10px] font-bold text-slate-500 px-2 py-1 bg-white border border-slate-200 rounded font-mono">NADA CONSTA</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-12 text-center pt-16 border-t border-slate-200">
                    <div className="group">
                        <div className="w-14 h-14 bg-slate-100 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <h4 className="font-display text-xl text-slate-900 mb-4 tracking-tight">Conformidade BACEN</h4>
                        <p className="text-sm text-slate-500 leading-relaxed font-sans">Alinhamento completo com a Circular Nº 3.978 para procedimentos de prevenção à lavagem de dinheiro.</p>
                    </div>
                    <div className="group">
                        <div className="w-14 h-14 bg-slate-100 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                            <FileText className="w-7 h-7" />
                        </div>
                        <h4 className="font-display text-xl text-slate-900 mb-4 tracking-tight">Workflow Customizado</h4>
                        <p className="text-sm text-slate-500 leading-relaxed font-sans">Crie regras e pesos específicos para aprovar, bloquear ou jogar terceiros para análise manual (fila de compliance).</p>
                    </div>
                    <div className="group">
                        <div className="w-14 h-14 bg-slate-100 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                            <CheckCircle className="w-7 h-7" />
                        </div>
                        <h4 className="font-display text-xl text-slate-900 mb-4 tracking-tight">Auditoria Completa</h4>
                        <p className="text-sm text-slate-500 leading-relaxed font-sans">Guarde um dossiê imutável em PDF da avaliação feita no momento da contratação (valioso para fiscalização).</p>
                    </div>
                </div>
            </div>
            <PublicFooter />
        </div>
    )
}
