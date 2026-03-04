import type { Metadata } from 'next'
import { PublicNav, PublicFooter, PageHero, pageStyle, contentWrap, CYAN, SURFACE, LINE, LINE_STRONG, TEXT, MUTED, MUTED as SECONDARY, UI, MONO, SERIF } from '@/components/public/PublicLayout'

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
        <div style={pageStyle}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
            <PublicNav />
            <PageHero
                breadcrumb="Regulatório / Cobertura"
                title="Framework regulatório brasileiro completo"
                subtitle="O ComplianceOS cobre mais de 15 normas e regulamentos, atualizados automaticamente conforme novas resoluções do BACEN, COAF e ANPD."
            />
            <div style={contentWrap}>
                {FRAMEWORKS.map(f => (
                    <div key={f.category} style={{ marginBottom: '4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '.875rem', borderBottom: `1px solid ${LINE}` }}>
                            <span style={{ display: 'block', width: 3, height: 18, background: f.color }} />
                            <h2 style={{ fontFamily: UI, fontWeight: 600, fontSize: '1rem', color: TEXT }}>{f.category}</h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(380px,1fr))', gap: '1px', background: LINE }}>
                            {f.items.map(item => (
                                <div key={item.code} style={{ background: SURFACE, padding: '1.5rem 2rem' }}>
                                    <div style={{ fontFamily: MONO, fontSize: '.8rem', color: CYAN, marginBottom: '.5rem' }}>{item.code}</div>
                                    <div style={{ fontFamily: UI, fontSize: '.875rem', color: MUTED, lineHeight: 1.65 }}>{item.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div style={{ marginTop: '4rem', padding: '2rem', border: `1px solid ${LINE_STRONG}`, background: SURFACE }}>
                    <div style={{ fontFamily: MONO, fontSize: '.7rem', color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '.1em', marginBottom: '.875rem' }}>Atualização contínua</div>
                    <p style={{ fontFamily: UI, fontSize: '.9375rem', color: MUTED, lineHeight: 1.75, maxWidth: 700 }}>
                        O ComplianceOS monitora e incorpora automaticamente novas resoluções publicadas pelo BACEN, ANPD, COAF e demais órgãos reguladores. Nosso time jurídico avalia cada nova norma e atualiza os workflows, checklists e relatórios da plataforma dentro de 30 dias da publicação no Diário Oficial.
                    </p>
                </div>
            </div>
            <PublicFooter />
        </div>
    )
}
