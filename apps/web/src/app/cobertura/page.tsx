import type { Metadata } from 'next'
import { PublicNav, PublicFooter, PageHero } from '@/components/public/PublicLayout'
import { CYAN } from '@/components/public/PublicLayout'

export const metadata: Metadata = {
    title: 'Cobertura Regulatória | ComplianceOS',
    description: 'Todos os frameworks regulatórios cobertos pelo ComplianceOS — BACEN, COAF, LGPD, Anticorrupção e muito mais.',
}

const FRAMEWORKS = [
    {
        category: 'PLD-FT', color: CYAN, items: [
            { code: 'Lei 9.613/98', desc: 'Lei de Lavagem de Dinheiro — obrigações PLDFT para instituições financeiras e demais setores obrigados.' },
            { code: 'Res. BCB 50/2021', desc: 'Regulamenta as políticas e os procedimentos de prevenção à lavagem de dinheiro e ao financiamento do terrorismo.' },
            { code: 'Circ. BACEN 3.978/2020', desc: 'Dispõe sobre a política, os procedimentos e os controles internos a serem adotados pelas instituições autorizadas.' },
            { code: 'COAF Res. 36/2021', desc: 'Disciplina os procedimentos de comunicação de operações ao COAF.' },
        ]
    },
    {
        category: 'Privacidade', color: CYAN, items: [
            { code: 'LGPD — Lei 13.709/18', desc: 'Lei Geral de Proteção de Dados — regula o tratamento de dados pessoais no Brasil.' },
            { code: 'ANPD CD/ANPD 02/2022', desc: 'Regulamento de aplicação da LGPD para agentes de tratamento de pequeno porte.' },
            { code: 'ISO 27701:2019', desc: 'Sistema de Gestão de Informações de Privacidade — extensão da ISO 27001.' },
        ]
    },
    {
        category: 'Anticorrupção', color: '#E8941A', items: [
            { code: 'Lei 12.846/13', desc: 'Lei Anticorrupção — responsabiliza pessoas jurídicas por atos lesivos à administração pública.' },
            { code: 'Decreto 8.420/2015', desc: 'Regulamenta a Lei Anticorrupção — define os critérios para avaliação de programas de integridade.' },
            { code: 'Decreto 11.129/22', desc: 'Atualiza as diretrizes para programas de integridade das empresas estatais.' },
        ]
    },
    {
        category: 'Sanções Internacionais', color: CYAN, items: [
            { code: 'OFAC SDN List', desc: 'Lista de nacionais especialmente designados do Office of Foreign Assets Control (EUA).' },
            { code: 'ONU Consolidated List', desc: 'Lista consolidada de sanções do Conselho de Segurança das Nações Unidas.' },
            { code: 'UE Sanctions List', desc: 'Regulamentos de sanções da União Europeia com aplicação extra-territorial.' },
            { code: 'PEP Nacional', desc: 'Pessoas Expostas Politicamente — conforme definição do BACEN e regulamentação brasileira.' },
        ]
    },
    {
        category: 'Segurança & Infraestrutura', color: CYAN, items: [
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
            <div className="max-w-7xl mx-auto px-6 py-20">
                {FRAMEWORKS.map(f => (
                    <div key={f.category} className="mb-16">
                        <div className="flex items-center gap-4 mb-6 pb-3 border-b border-slate-200">
                            <span className="block w-1.5 h-6 rounded-full" style={{ background: f.color }} />
                            <h2 className="font-semibold text-lg text-slate-900">{f.category}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                            {f.items.map(item => (
                                <div key={item.code} className="bg-white p-6 hover:bg-slate-50 transition-colors">
                                    <div className="font-mono text-[0.8rem] font-medium text-brand-600 mb-2">{item.code}</div>
                                    <div className="text-[0.875rem] text-slate-600 leading-relaxed">{item.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="mt-16 p-8 border border-slate-200 bg-white rounded-xl shadow-sm">
                    <div className="font-mono text-[0.7rem] font-medium text-slate-500 uppercase tracking-widest mb-3">Atualização contínua</div>
                    <p className="text-[0.9375rem] text-slate-600 leading-relaxed max-w-3xl">
                        O ComplianceOS monitora e incorpora automaticamente novas resoluções publicadas pelo BACEN, ANPD, COAF e demais órgãos reguladores. Nosso time jurídico avalia cada nova norma e atualiza os workflows, checklists e relatórios da plataforma dentro de 30 dias da publicação no Diário Oficial.
                    </p>
                </div>
            </div>
            <PublicFooter />
        </div>
    )
}
