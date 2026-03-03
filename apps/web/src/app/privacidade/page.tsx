import type { Metadata } from 'next'
import { PublicNav, PublicFooter, PageHero, pageStyle, contentWrap, CYAN, SURFACE, LINE, LINE_STRONG, TEXT, MUTED, UI, MONO } from '@/components/public/PublicLayout'

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
        <div style={pageStyle}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
            <PublicNav />
            <PageHero
                breadcrumb="Legal / Privacidade"
                title="Política de Privacidade"
                subtitle="Como o ComplianceOS coleta, usa e protege seus dados pessoais — em total conformidade com a LGPD."
            />
            <div style={contentWrap}>
                <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '5rem', alignItems: 'start' }}>
                    {/* Table of contents */}
                    <div style={{ position: 'sticky', top: '6rem' }}>
                        <div style={{ fontFamily: MONO, fontSize: '.65rem', color: '#3A4152', textTransform: 'uppercase' as const, letterSpacing: '.1em', marginBottom: '1rem' }}>Índice</div>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '.5rem' }}>
                            {SECTIONS.map(s => (
                                <a key={s.title} href={`#${s.title.replace(/\s/g, '-').toLowerCase()}`}
                                    style={{ fontFamily: UI, fontSize: '.8125rem', color: MUTED, textDecoration: 'none' }}>
                                    {s.title}
                                </a>
                            ))}
                        </div>
                        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: `1px solid ${LINE}`, fontFamily: MONO, fontSize: '.65rem', color: '#3A4152' }}>
                            Última atualização:<br />03 Mar 2026
                        </div>
                    </div>
                    {/* Content */}
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '2.5rem' }}>
                        {SECTIONS.map(s => (
                            <div key={s.title} id={s.title.replace(/\s/g, '-').toLowerCase()} style={{ paddingBottom: '2.5rem', borderBottom: `1px solid ${LINE}` }}>
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
