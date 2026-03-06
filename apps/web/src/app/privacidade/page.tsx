import type { Metadata } from 'next'
import { PublicNav, PublicFooter, PageHero } from '@/components/public/PublicLayout'

export const metadata: Metadata = {
    title: 'Política de Privacidade | ComplianceOS',
    description: 'Política de Privacidade do ComplianceOS — como coletamos, usamos e protegemos seus dados.',
}

const SECTIONS = [
    {
        title: '1. Quem somos',
        content: 'Chuangxin Tecnologia da Informação Ltda. ("ComplianceOS", "nós"), inscrita no CNPJ sob o nº XX.XXX.XXX/0001-XX, com sede em São Paulo — SP, é a controladora dos dados pessoais tratados por meio desta plataforma, nos termos do Art. 5º, VI da Lei 13.709/18 (LGPD).',
    },
    {
        title: '2. Dados que coletamos',
        content: 'Coletamos dados necessários para a prestação dos serviços de compliance: (a) dados de cadastro — nome, e-mail corporativo, CNPJ, cargo; (b) dados de uso — logs de acesso, eventos de plataforma, configurações; (c) dados de entidades monitoradas — CNPJ, razão social e demais informações regulatórias inseridas pelo cliente (operador). Não coletamos dados sensíveis de titulares finais — essa responsabilidade é do cliente como controlador.',
    },
    {
        title: '3. Finalidades e bases legais',
        content: 'Os dados são tratados para: prestação dos serviços contratados (Art. 7º, V — execução de contrato); cumprimento de obrigações regulatórias impostas ao ComplianceOS (Art. 7º, II — obrigação legal); melhoria e segurança da plataforma (Art. 7º, IX — legítimo interesse); comunicações de produto e atualizações (consentimento, Art. 7º, I, revogável a qualquer momento).',
    },
    {
        title: '4. Compartilhamento de dados',
        content: 'Não vendemos dados pessoais. Compartilhamos apenas com: (a) prestadores de serviços técnicos (AWS, Datadog) sob contratos com cláusulas LGPD; (b) autoridades públicas brasileiras quando exigido por lei (BACEN, COAF, ANPD); (c) auditores externos, mediante instrução expressa do cliente. Todo compartilhamento é documentado no Audit Trail da plataforma.',
    },
    {
        title: '5. Retenção de dados',
        content: 'Dados de conta são mantidos pelo período contratual + 5 anos (prazo prescricional cível). Logs de auditoria são mantidos por 10 anos, conforme exigência do BACEN para registros de PLD-FT. Dados de entidades monitoradas seguem a política de retenção configurada pelo cliente. Após o prazo, os dados são eliminados de forma segura ou anonimizados.',
    },
    {
        title: '6. Direitos dos titulares',
        content: 'Você tem direito a: confirmar a existência de tratamento; acessar seus dados; corrigir dados incompletos ou inexatos; anonimizar, bloquear ou eliminar dados desnecessários; obter informações sobre compartilhamento; revogar consentimentos; e apresentar reclamação à ANPD. Solicitações devem ser enviadas para privacidade@complianceos.com.br com prazo de resposta de 15 dias corridos.',
    },
    {
        title: '7. Segurança',
        content: 'Implementamos controles técnicos e organizacionais adequados: criptografia AES-256 em repouso, TLS 1.3 em trânsito, RLS no PostgreSQL, MFA para acesso administrativo e audit trail imutável. Em caso de incidente de segurança, notificaremos a ANPD e os titulares afetados dentro dos prazos legais.',
    },
    {
        title: '8. Transferências internacionais',
        content: 'Alguns serviços de infraestrutura operam em países fora do Brasil (EUA — AWS us-east). Essas transferências ocorrem com base em garantias adequadas, incluindo cláusulas contratuais padrão e avaliação de nível de proteção equivalente, conforme Art. 33, II da LGPD.',
    },
    {
        title: '9. Alterações nesta política',
        content: 'Esta política pode ser atualizada para refletir mudanças regulatórias ou de produto. Notificações de alterações materiais serão enviadas por e-mail com 30 dias de antecedência. A data de última atualização constante no rodapé indica a versão vigente.',
    },
    {
        title: '10. Contato & Encarregado (DPO)',
        content: 'Data Protection Officer: privacidade@complianceos.com.br | Para reclamações junto à ANPD: www.gov.br/anpd | Última atualização: 03 de março de 2026.',
    },
]

export default function PrivacidadePage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
            <PublicNav />
            <PageHero
                breadcrumb="Legal / Privacidade"
                title="Política de Privacidade"
                subtitle="Como o ComplianceOS coleta, usa e protege seus dados pessoais — em total conformidade com a LGPD."
            />
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="flex flex-col md:flex-row gap-16 md:gap-20 items-start">
                    {/* Table of contents */}
                    <div className="hidden md:block w-64 shrink-0 sticky top-24">
                        <div className="font-mono text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-4">Índice</div>
                        <div className="flex flex-col gap-2">
                            {SECTIONS.map(s => (
                                <a key={s.title} href={`#${s.title.replace(/\s/g, '-').toLowerCase()}`}
                                    className="text-[0.8125rem] text-slate-500 hover:text-brand-600 transition-colors">
                                    {s.title}
                                </a>
                            ))}
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-200 font-mono text-[0.65rem] text-slate-400">
                            Última atualização:<br />03 Mar 2026
                        </div>
                    </div>
                    {/* Content */}
                    <div className="flex-1 flex flex-col gap-10">
                        {SECTIONS.map(s => (
                            <div key={s.title} id={s.title.replace(/\s/g, '-').toLowerCase()} className="pb-10 border-b border-slate-200 last:border-0 border-dashed">
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
