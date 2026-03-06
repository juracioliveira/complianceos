import type { Metadata } from 'next'
import { PublicNav, PublicFooter, PageHero } from '@/components/public/PublicLayout'

export const metadata: Metadata = {
    title: 'Cobertura Regulatória | ComplianceOS',
    description: 'Todos os frameworks regulatórios cobertos pelo ComplianceOS — BACEN, COAF, LGPD, Anticorrupção e muito mais.',
}

const FRAMEWORKS = [
    {
        category: 'PLD-FT', items: [
            { code: 'Lei 9.613/98', desc: 'Lei de Lavagem de Dinheiro — obrigações PLDFT para instituições financeiras e demais setores obrigados.' },
            { code: 'Res. BCB 50/2021', desc: 'Regulamenta as políticas e os procedimentos de prevenção à lavagem de dinheiro e ao financiamento do terrorismo.' },
            { code: 'Circ. BACEN 3.978/2020', desc: 'Dispõe sobre a política, os procedimentos e os controles internos a serem adotados pelas instituições autorizadas.' },
            { code: 'COAF Res. 36/2021', desc: 'Disciplina os procedimentos de comunicação de operações ao COAF.' },
        ]
    },
    {
        category: 'Privacidade', items: [
            { code: 'LGPD — Lei 13.709/18', desc: 'Lei Geral de Proteção de Dados — regula o tratamento de dados pessoais no Brasil.' },
            { code: 'ANPD CD/ANPD 02/2022', desc: 'Regulamento de aplicação da LGPD para agentes de tratamento de pequeno porte.' },
            { code: 'ISO 27701:2019', desc: 'Sistema de Gestão de Informações de Privacidade — extensão da ISO 27001.' },
        ]
    },
    {
        category: 'Anticorrupção', items: [
            { code: 'Lei 12.846/13', desc: 'Lei Anticorrupção — responsabiliza pessoas jurídicas por atos lesivos à administração pública.' },
            { code: 'Decreto 8.420/2015', desc: 'Regulamenta a Lei Anticorrupção — define os critérios para avaliação de programas de integridade.' },
            { code: 'Decreto 11.129/22', desc: 'Atualiza as diretrizes para programas de integridade das empresas estatais.' },
        ]
    },
    {
        category: 'Sanções Internacionais', items: [
            { code: 'OFAC SDN List', desc: 'Lista de nacionais especialmente designados do Office of Foreign Assets Control (EUA).' },
            { code: 'ONU Consolidated List', desc: 'Lista consolidada de sanções do Conselho de Segurança das Nações Unidas.' },
            { code: 'UE Sanctions List', desc: 'Regulamentos de sanções da União Europeia com aplicação extra-territorial.' },
            { code: 'PEP Nacional', desc: 'Pessoas Expostas Politicamente — conforme definição do BACEN e regulamentação brasileira.' },
        ]
    },
    {
        category: 'Segurança & Infraestrutura', items: [
            { code: 'ISO 27001:2022', desc: 'Padrão internacional para Sistemas de Gestão de Segurança da Informação (SGSI).' },
            { code: 'SOC 2 Type II', desc: 'Relatório de controles de segurança, disponibilidade, integridade, confidencialidade e privacidade.' },
            { code: 'CVM 50/2021', desc: 'Instrução CVM sobre prevenção à lavagem de dinheiro para participantes do mercado de capitais.' },
        ]
    },
]

export default function CoberturaPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
            <PublicNav />
            <PageHero
                breadcrumb="Regulatório / Cobertura"
                title="Framework regulatório brasileiro completo"
                subtitle="O ComplianceOS cobre mais de 15 normas e regulamentos, atualizados automaticamente conforme novas resoluções do BACEN, COAF e ANPD."
            />
            <div className="max-w-7xl mx-auto px-6 py-20 pb-32">
                {FRAMEWORKS.map(f => (
                    <div key={f.category} className="mb-20">
                        <div className="flex items-center gap-4 mb-8 pb-3 border-b border-slate-200/80">
                            <span className="block w-2 h-8 rounded-full bg-brand-600" />
                            <h2 className="font-display text-2xl lg:text-3xl text-slate-900 tracking-tight">{f.category}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {f.items.map(item => (
                                <div key={item.code} className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:shadow-brand-600/5 hover:-translate-y-0.5 transition-all group">
                                    <div className="font-mono text-[10px] font-bold text-brand-600 mb-3 tracking-widest uppercase group-hover:text-brand-700 transition-colors">{item.code}</div>
                                    <div className="text-[15px] text-slate-600 leading-relaxed font-sans">{item.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="mt-24 p-12 border border-brand-100 bg-brand-50/20 backdrop-blur-sm rounded-[3rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/5 blur-3xl rounded-full translate-x-12 -translate-y-12 group-hover:scale-110 transition-transform duration-700" />
                    <div className="relative z-10 max-w-4xl">
                        <div className="font-mono text-[10px] font-bold text-brand-600 uppercase tracking-[0.25em] mb-6">Atualização contínua</div>
                        <p className="text-xl text-slate-700 leading-relaxed font-sans">
                            O ComplianceOS monitora e incorpora automaticamente novas resoluções publicadas pelo <span className="text-brand-600 font-bold underline decoration-brand-200 underline-offset-4">BACEN, ANPD, COAF</span> e demais órgãos reguladores. Nosso time jurídico avalia cada nova norma e atualiza os workflows, checklists e relatórios da plataforma dentro de 30 dias da publicação no Diário Oficial.
                        </p>
                    </div>
                </div>
            </div>
            <PublicFooter />
        </div>
    )
}
