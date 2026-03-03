import Link from 'next/link'
import { Shield, Lock, FileText, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            <header className="fixed top-0 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Compliance<span className="text-blue-600 dark:text-blue-500">OS</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                                Entrar
                            </Link>
                            <Link href="/dashboard" className="inline-flex justify-center items-center py-2 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900 transition-colors">
                                Acessar Plataforma
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow pt-16">
                {/* Hero Section */}
                <section className="relative overflow-hidden pt-24 pb-32">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
                    <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
                        <div className="w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
                    </div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-8">
                            <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
                            Sistema de Nível Regulatório Bancário (BACEN/COAF)
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
                            Compliance Completo,<br className="hidden md:block"/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                                Totalmente Automatizado.
                            </span>
                        </h1>
                        <p className="mt-4 text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10">
                            A plataforma definitiva para PLD/FT, LGPD e Anticorrupção. Rastreie entidades, automatize due diligence e gere trilhas de auditoria imutáveis com um clique.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/dashboard" className="inline-flex justify-center items-center py-3 px-6 text-base font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 gap-2">
                                Experimentar Agora
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link href="/dashboard" className="inline-flex justify-center items-center py-3 px-6 text-base font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                                Agendar Demonstração
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Soluções de Risco e Conformidade</h2>
                            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Três pilares fundamentais, geridos em um único centro de comando criptográfico.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-blue-500/50 transition-colors group">
                                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">PLD/FT e Sanções</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                                    Monitoramento contínuo de listas restritivas (OFAC, ONU), identificação de PEPs e cálculos de risco em tempo real.
                                </p>
                                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Screening Dinâmico</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Detecção PEP</li>
                                </ul>
                            </div>

                            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-blue-500/50 transition-colors group">
                                <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Privacidade LGPD</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                                    Automação do Registro de Atividades de Tratamento (RAT), fluxos de exclusão de dados e adequação imediata para multas ANPD.
                                </p>
                                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Relatórios de Impacto (RIPD)</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Logs Imutáveis</li>
                                </ul>
                            </div>

                            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-blue-500/50 transition-colors group">
                                <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Governança (Anticorrupção)</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                                    Estruture a Due Diligence de fornecedores B2B e gere relatórios exigidos pela Lei 12.846/13 com um único clique.
                                </p>
                                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> Exportação PDF Certificada</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> Checklists Personalizados</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Shield className="w-6 h-6 text-slate-400" />
                        <span className="text-lg font-bold text-slate-900 dark:text-white">ComplianceOS</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-500">
                        &copy; 2026 Chuangxin Tecnologia da Informação Ltda. Reservados os direitos sob a IP.
                    </p>
                    <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
                        <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white">Termos</Link>
                        <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white">Privacidade</Link>
                        <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white">Contato</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
