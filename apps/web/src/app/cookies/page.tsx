import type { Metadata } from 'next'
import { PublicNav, PublicFooter, PageHero } from '@/components/public/PublicLayout'

export const metadata: Metadata = {
    title: 'Política de Cookies | ComplianceOS',
    description: 'Como o ComplianceOS usa cookies e tecnologias similares.',
}

const COOKIES = [
    {
        type: 'Essenciais', required: true, cookies: [
            { name: 'cos_session', purpose: 'Sessão autenticada do usuário', duration: 'Sessão / 24h', party: '1ª parte' },
            { name: 'cos_csrf', purpose: 'Proteção contra Cross-Site Request Forgery', duration: 'Sessão', party: '1ª parte' },
            { name: 'cos_tenant', purpose: 'Identificação do tenant ativo', duration: '30 dias', party: '1ª parte' },
        ]
    },
    {
        type: 'Funcionais', required: false, cookies: [
            { name: 'cos_prefs', purpose: 'Preferências de interface (tema, idioma)', duration: '1 ano', party: '1ª parte' },
            { name: 'cos_last_route', purpose: 'Última rota acessada para redirecionamento', duration: '7 dias', party: '1ª parte' },
        ]
    },
    {
        type: 'Desempenho & Análise', required: false, cookies: [
            { name: 'dd_rum_*', purpose: 'Monitoramento de performance (Datadog RUM)', duration: 'Sessão', party: '3ª parte' },
            { name: '__hstc', purpose: 'Análise de comportamento de usuário (HubSpot)', duration: '13 meses', party: '3ª parte' },
        ]
    },
]

export default function CookiesPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
            <PublicNav />
            <PageHero breadcrumb="Legal / Cookies" title="Política de Cookies" subtitle="Quais cookies utilizamos, por quê e como você pode controlá-los." />
            <div className="max-w-7xl mx-auto px-6 py-20">
                <p className="text-[0.9375rem] text-slate-600 leading-relaxed max-w-3xl mb-12">
                    O ComplianceOS usa cookies e tecnologias similares para garantir o funcionamento da plataforma, lembrar suas preferências e, com seu consentimento, analisar o desempenho. Cookies essenciais não podem ser desativados pois são necessários para a operação básica do sistema.
                </p>

                {COOKIES.map(cat => (
                    <div key={cat.type} className="mb-12">
                        <div className="flex items-center gap-3 mb-5">
                            <h2 className="font-semibold text-base text-slate-900">{cat.type}</h2>
                            <span className={`font-mono text-[0.65rem] px-2 py-0.5 border rounded uppercase tracking-wide ${cat.required ? 'border-brand-200 text-brand-600 bg-brand-50' : 'border-slate-200 text-slate-500 bg-slate-50'}`}>
                                {cat.required ? 'Sempre Ativo' : 'Opcional'}
                            </span>
                        </div>
                        {/* Table */}
                        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                            <div className="grid grid-cols-[1.5fr_2fr_1fr_1fr] p-4 bg-slate-50 border-b border-slate-200 gap-4">
                                {['Cookie', 'Finalidade', 'Duração', 'Parte'].map(h => (
                                    <span key={h} className="font-mono text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">{h}</span>
                                ))}
                            </div>
                            {cat.cookies.map((c, i) => (
                                <div key={c.name} className={`grid grid-cols-[1.5fr_2fr_1fr_1fr] p-4 gap-4 items-center ${i < cat.cookies.length - 1 ? 'border-b border-slate-100' : ''}`}>
                                    <span className="font-mono text-[0.75rem] font-medium text-brand-600 break-all">{c.name}</span>
                                    <span className="text-[0.8125rem] text-slate-600 leading-relaxed">{c.purpose}</span>
                                    <span className="font-mono text-[0.7rem] text-slate-500">{c.duration}</span>
                                    <span className="font-mono text-[0.7rem] text-slate-500">{c.party}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="p-8 border border-slate-200 bg-white rounded-xl shadow-sm mt-8">
                    <h3 className="font-semibold text-[0.9375rem] text-slate-900 mb-3">Como gerenciar cookies</h3>
                    <p className="text-[0.875rem] text-slate-600 leading-relaxed">
                        Cookies opcionais podem ser desativados pelo painel de preferências disponível no rodapé da plataforma ou nas configurações do seu navegador. A desativação de cookies essenciais impede o funcionamento da plataforma. Para cookies de terceiros, consulte as políticas de privacidade das respectivas empresas.
                    </p>
                </div>
            </div>
            <PublicFooter />
        </div>
    )
}
