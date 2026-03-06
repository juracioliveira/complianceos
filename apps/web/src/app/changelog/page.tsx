import type { Metadata } from 'next'
import { PublicNav, PublicFooter, PageHero } from '@/components/public/PublicLayout'

export const metadata: Metadata = {
    title: 'Changelog | ComplianceOS',
    description: 'Acompanhe as últimas atualizações e novidades da plataforma ComplianceOS.',
}

const RELEASES = [
    {
        version: 'v1.4.0',
        date: '05 Mar 2026',
        badge: 'Feature',
        title: 'Novo Motor de Scoring e Interface UX/UI',
        description: 'Lançamento do nosso novo motor de regras para due diligence com uma interface completamente renovada para facilitar a navegação em relatórios complexos de PLD-FT.',
        features: [
            'Novo layout centralizado na identidade visual "ComplianceOS".',
            'Sincronização automática em background com as listas ONU, OFAC e EU.',
            'Nova tela de bloqueio para acessos via dispositivos móveis não suportados.'
        ]
    },
    {
        version: 'v1.3.2',
        date: '15 Fev 2026',
        badge: 'Melhoria',
        title: 'Estabilidade da Trilha de Auditoria (Audit Trail)',
        description: 'Otimizações no banco de dados para garantir que a consulta da trilha de auditoria ocorra em menos de 200ms mesmo com milhões de registros.',
        features: [
            'Paginação via cursores nativa na API.',
            'Geração de PDF agora roda em background sem travar a interface do usuário.'
        ]
    },
    {
        version: 'v1.3.0',
        date: '10 Jan 2026',
        badge: 'Feature',
        title: 'Compliance LGPD Integrado',
        description: 'Módulo dedicado para o mapeamento de processos de tratamento de dados pessoais de acordo com as exigências da ANPD.',
        features: [
            'Geração automática de Relatórios de Impacto (RIPD).',
            'Gestão de incidentes centralizada na plataforma.'
        ]
    }
]

export default function ChangelogPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
            <PublicNav />
            <PageHero
                breadcrumb="Produto / Changelog"
                title="Changelog"
                subtitle="Todas as atualizações, melhorias e novos recursos que lançamos para tornar a sua operação de compliance mais eficiente."
            />

            <div className="max-w-4xl mx-auto px-6 py-20">
                <div className="space-y-16">
                    {RELEASES.map((release, index) => (
                        <div key={index} className="relative pl-8 md:pl-0">
                            {/* Decorative line for non-mobile */}
                            <div className="hidden md:block absolute left-[22%] top-0 bottom-0 w-px bg-slate-200" />

                            <div className="md:grid md:grid-cols-4 md:gap-8 items-start">
                                <div className="md:col-span-1 mb-4 md:mb-0 md:text-right md:pr-8 relative">
                                    <div className="hidden md:block absolute right-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-brand-500 border-2 border-slate-50 shadow-sm" />
                                    <p className="font-mono text-sm font-bold text-slate-900">{release.version}</p>
                                    <p className="text-sm text-slate-500 mt-1">{release.date}</p>
                                    <span className="inline-block mt-3 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-100 rounded-md">
                                        {release.badge}
                                    </span>
                                </div>
                                <div className="md:col-span-3 bg-white border border-slate-200/60 rounded-3xl p-10 shadow-xl shadow-slate-200/30 hover:shadow-2xl hover:shadow-brand-600/5 hover:-translate-y-1 transition-all group/card overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                                    <h2 className="font-display text-2xl lg:text-3xl text-slate-900 mb-4 tracking-tight group-hover/card:text-brand-600 transition-colors">{release.title}</h2>
                                    <p className="text-[15px] text-slate-600 mb-8 leading-relaxed font-sans">
                                        {release.description}
                                    </p>
                                    <div className="pt-8 border-t border-slate-100">
                                        <h4 className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Atualizações principais</h4>
                                        <ul className="space-y-4">
                                            {release.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-3.5 text-sm text-slate-700">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-[7px] shrink-0" />
                                                    <span className="leading-relaxed font-medium">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <PublicFooter />
        </div>
    )
}
