import type { Metadata } from 'next'
import { PublicNav, PublicFooter, PageHero } from '@/components/public/PublicLayout'

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
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
            <PublicNav />
            <PageHero breadcrumb="Legal / Termos de Uso" title="Termos de Uso" subtitle="Condições que regem o uso da plataforma ComplianceOS." />
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="flex flex-col md:flex-row gap-16 md:gap-20 items-start">
                    <div className="hidden md:block w-64 shrink-0 sticky top-24">
                        <div className="font-mono text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-4">Índice</div>
                        <div className="flex flex-col gap-2">
                            {SECTIONS.map(s => <a key={s.title} href="#" className="text-[0.8125rem] text-slate-500 hover:text-brand-600 transition-colors">{s.title}</a>)}
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-200 font-mono text-[0.65rem] text-slate-400">
                            Última atualização:<br />03 Mar 2026
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-10">
                        {SECTIONS.map(s => (
                            <div key={s.title} className="pb-10 border-b border-slate-200 last:border-0 border-dashed text-pretty">
                                <h2 className="font-display text-2xl text-slate-900 mb-4">{s.title}</h2>
                                <p className="text-[0.9375rem] text-slate-600 leading-relaxed font-sans">{s.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <PublicFooter />
        </div>
    )
}
