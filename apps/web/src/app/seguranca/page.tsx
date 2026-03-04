import type { Metadata } from 'next'
import { PublicNav, PublicFooter, PageHero, pageStyle, contentWrap, CYAN, SURFACE, LINE, LINE_STRONG, TEXT, MUTED, UI, MONO } from '@/components/public/PublicLayout'

export const metadata: Metadata = {
    title: 'Segurança | ComplianceOS',
    description: 'Como o ComplianceOS protege seus dados com infraestrutura enterprise-grade.',
}

const CONTROLS = [
    {
        category: 'Identidade & Acesso',
        items: [
            { title: 'JWT RS256 + Rotação de Chaves', desc: 'Todos os tokens de acesso são assinados com RSA 256-bit. Chaves rotacionadas automaticamente a cada 24h.' },
            { title: 'MFA TOTP', desc: 'Multi-fator via TOTP (RFC 6238) obrigatório para todos os usuários administrativos.' },
            { title: 'RBAC Granular', desc: 'Controle de acesso baseado em papéis com permissões no nível de recurso e operação.' },
            { title: 'SAML SSO', desc: 'Integração com provedores corporativos (Okta, Azure AD, Google Workspace) via SAML 2.0.' },
        ],
    },
    {
        category: 'Infraestrutura',
        items: [
            { title: 'AWS ECS Fargate Multi-AZ', desc: 'Workloads em múltiplas zonas de disponibilidade na região sa-east-1 (São Paulo).' },
            { title: 'WAF + AWS Shield Standard', desc: 'Proteção contra DDoS, injeções SQL, XSS e ataques OWASP Top 10.' },
            { title: 'VPC Isolada por Tenant', desc: 'Cada tenant opera em rede virtual privada isolada, sem tráfego compartilhado.' },
            { title: 'TLS 1.3 End-to-End', desc: 'Todo tráfego em trânsito criptografado com TLS 1.3 — sem suporte a versões legadas.' },
        ],
    },
    {
        category: 'Dados & Auditoria',
        items: [
            { title: 'RLS no PostgreSQL', desc: 'Row Level Security garante isolamento total de dados entre tenants no nível do banco.' },
            { title: 'Criptografia AES-256 em Repouso', desc: 'Todos os dados armazenados criptografados com AES-256. Chaves gerenciadas via AWS KMS.' },
            { title: 'Audit Trail Imutável', desc: 'Cada ação registrada com timestamp, usuário, tenant e hash SHA-256 — impossível alterar retroativamente.' },
            { title: 'Backups com PITR', desc: 'Point-in-time recovery com retenção de 30 dias e backup cross-region automático.' },
        ],
    },
    {
        category: 'Conformidade & Certificações',
        items: [
            { title: 'ISO 27001 Ready', desc: 'Controles mapeados para ISO 27001:2022. Relatório de conformidade disponível via dashboard.' },
            { title: 'SOC 2 Type II', desc: 'Relatório SOC 2 disponível para clientes Enterprise mediante NDA.' },
            { title: 'LGPD DPA', desc: 'Data Processing Agreement disponível para todos os planos, definindo responsabilidades de controlador e operador.' },
            { title: 'Vulnerability Disclosure', desc: 'Programa de divulgação responsável de vulnerabilidades com SLA de resposta de 72h.' },
        ],
    },
]

export default function SegurancaPage() {
    return (
        <div style={pageStyle}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
            <PublicNav />
            <PageHero
                breadcrumb="Regulatório / Segurança"
                title="Segurança por design, não por adesivo"
                subtitle="Infraestrutura enterprise-grade construída desde o primeiro dia para dados regulatórios críticos. Zero concessões em segurança."
            />
            <div style={contentWrap}>
                {CONTROLS.map(c => (
                    <div key={c.category} style={{ marginBottom: '4rem' }}>
                        <h2 style={{ fontFamily: UI, fontWeight: 600, fontSize: '1rem', color: TEXT, marginBottom: '1.5rem', paddingBottom: '.875rem', borderBottom: `1px solid ${LINE}` }}>{c.category}</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1px', background: LINE }}>
                            {c.items.map(item => (
                                <div key={item.title} style={{ background: SURFACE, padding: '1.5rem 2rem' }}>
                                    <div style={{ fontFamily: MONO, fontSize: '.75rem', color: CYAN, marginBottom: '.5rem' }}>{item.title}</div>
                                    <div style={{ fontFamily: UI, fontSize: '.875rem', color: MUTED, lineHeight: 1.65 }}>{item.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div style={{ padding: '2rem', border: `1px solid rgba(0,200,224,0.2)`, background: 'rgba(0,200,224,0.03)' }}>
                    <div style={{ fontFamily: MONO, fontSize: '.7rem', color: CYAN, textTransform: 'uppercase' as const, letterSpacing: '.1em', marginBottom: '.875rem' }}>Reporte uma vulnerabilidade</div>
                    <p style={{ fontFamily: UI, fontSize: '.875rem', color: MUTED, lineHeight: 1.75, maxWidth: 700 }}>
                        Se você encontrou uma vulnerabilidade de segurança no ComplianceOS, entre em contato de forma responsável via <span style={{ color: CYAN }}>security@complianceos.com.br</span>. Comprometemo-nos a responder em até 72 horas e a tratar o relato com confidencialidade.
                    </p>
                </div>
            </div>
            <PublicFooter />
        </div>
    )
}
