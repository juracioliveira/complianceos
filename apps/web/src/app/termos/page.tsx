import type { Metadata } from 'next'
import { PublicNav, PublicFooter, PageHero, pageStyle, contentWrap, LINE, TEXT, MUTED, UI, MONO } from '@/components/public/PublicLayout'

export const metadata: Metadata = {
    title: 'Termos de Uso | ComplianceOS',
    description: 'Termos e condições de uso da plataforma ComplianceOS.',
}

const SECTIONS = [
    { title: '1. Aceitação dos Termos', content: 'Ao criar uma conta ou utilizar a plataforma ComplianceOS, o Usuário declara ter lido, compreendido e aceito integralmente estes Termos de Uso e a Política de Privacidade. O acesso e uso são condicionados à aceitação prévia. Se você não concordar com qualquer disposição, não utilize o serviço.' },
    { title: '2. Descrição do Serviço', content: 'O ComplianceOS é uma plataforma SaaS de compliance regulatório voltada para fintechs e PMEs brasileiras, oferecendo funcionalidades de KYC/KYB, monitoramento de sanções internacionais, gestão de conformidade com a LGPD, anticorrupção e geração de trilhas de auditoria imutáveis. O serviço é prestado na modalidade de Software como Serviço (SaaS), sujeito ao plano contratado.' },
    { title: '3. Planos e Pagamento', content: 'Os planos e preços vigentes estão disponíveis em complianceos.com.br. O faturamento é mensal, em Reais (BRL), com cobrança antecipada. Em caso de atraso superior a 5 dias úteis, o acesso poderá ser suspenso. O cancelamento pode ocorrer a qualquer momento; não há reembolso proporcional pela fração do mês em vigor, salvo disposição legal em contrário.' },
    { title: '4. Responsabilidades do Usuário', content: 'O Usuário é responsável por: (a) manter confidenciais suas credenciais de acesso; (b) garantir que o uso está em conformidade com a legislação aplicável; (c) inserir apenas dados sobre os quais possui legitimidade regulatória; (d) não utilizar a plataforma para fins ilícitos ou que violem direitos de terceiros; (e) notificar imediatamente qualquer acesso não autorizado.' },
    { title: '5. Propriedade Intelectual', content: 'Todo o software, design, código-fonte, documentação, marcas e conteúdo da plataforma são de propriedade exclusiva da Chuangxin Tecnologia da Informação Ltda. ou de seus licenciadores. É proibida a reprodução, distribuição, engenharia reversa ou criação de obras derivadas sem autorização expressa por escrito.' },
    { title: '6. Dados e Privacidade', content: 'O tratamento de dados pessoais é regido pela Política de Privacidade, disponível em complianceos.com.br/privacidade, e pelo Data Processing Agreement (DPA) assinado no momento da contratação. O ComplianceOS atua como operador dos dados de entidades monitoradas inseridos pelo cliente (controlador).' },
    { title: '7. SLA e Disponibilidade', content: 'Compromete-se-se com SLA de 99,9% de disponibilidade mensal, excluindo janelas de manutenção programada (comunicadas com 72h de antecedência) e eventos de força maior. Créditos por falha de SLA são aplicados conforme tabela do plano Enterprise. Usuários Starter e Growth recebem notificação e priorização de correção.' },
    { title: '8. Limitação de Responsabilidade', content: 'O ComplianceOS não se responsabiliza por: perdas indiretas, lucros cessantes, danos emergentes resultantes do uso ou impossibilidade de uso da plataforma; decisões tomadas com base nas análises geradas; falhas causadas por fatores externos (infraestrutura de terceiros, alterações normativas emergenciais). A responsabilidade total está limitada ao valor pago nos 3 meses anteriores ao evento danoso.' },
    { title: '9. Vigência e Rescisão', content: 'O contrato vigora enquanto o plano estiver ativo. O ComplianceOS pode rescindir unilateralmente em caso de: violação destes Termos, uso fraudulento ou ilegal, chargebacks sem fundamento. Após rescisão, o cliente tem 30 dias para exportar seus dados. Passado esse prazo, os dados são eliminados conforme política de retenção.' },
    { title: '10. Disposições Gerais', content: 'Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o Foro Central da Comarca de São Paulo — SP para dirimir quaisquer controvérsias. Última atualização: 03 de março de 2026. Contato jurídico: legal@complianceos.com.br.' },
]

export default function TermosPage() {
    return (
        <div style={pageStyle}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
            <PublicNav />
            <PageHero breadcrumb="Legal / Termos de Uso" title="Termos de Uso" subtitle="Condições que regem o uso da plataforma ComplianceOS." />
            <div style={contentWrap}>
                <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '5rem', alignItems: 'start' }}>
                    <div style={{ position: 'sticky', top: '6rem' }}>
                        <div style={{ fontFamily: MONO, fontSize: '.65rem', color: '#3A4152', textTransform: 'uppercase' as const, letterSpacing: '.1em', marginBottom: '1rem' }}>Índice</div>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '.5rem' }}>
                            {SECTIONS.map(s => <a key={s.title} href="#" style={{ fontFamily: UI, fontSize: '.8125rem', color: MUTED, textDecoration: 'none' }}>{s.title}</a>)}
                        </div>
                        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: `1px solid ${LINE}`, fontFamily: MONO, fontSize: '.65rem', color: '#3A4152' }}>
                            Última atualização:<br />03 Mar 2026
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '2.5rem' }}>
                        {SECTIONS.map(s => (
                            <div key={s.title} style={{ paddingBottom: '2.5rem', borderBottom: `1px solid ${LINE}` }}>
                                <h2 style={{ fontFamily: UI, fontWeight: 600, fontSize: '1rem', color: TEXT, marginBottom: '1rem' }}>{s.title}</h2>
                                <p style={{ fontFamily: UI, fontSize: '.9375rem', color: MUTED, lineHeight: 1.8 }}>{s.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <PublicFooter />
        </div>
    )
}
