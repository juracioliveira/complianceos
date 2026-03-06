import type { Metadata } from 'next'
import { PublicNav, PublicFooter, PageHero } from '@/components/public/PublicLayout'

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
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
            <PublicNav />
            <PageHero
                breadcrumb="Regulatório / Segurança"
                title="Segurança por design, não por adesivo"
                subtitle="Infraestrutura enterprise-grade construída desde o primeiro dia para dados regulatórios críticos. Zero concessões em segurança."
            />
            <div className="max-w-7xl mx-auto px-6 py-20">
                {CONTROLS.map(c => (
                    <div key={c.category} className="mb-16">
                        <h2 className="font-semibold text-lg text-slate-900 mb-6 pb-3 border-b border-slate-200">{c.category}</h2>
                        <div className="grid md:grid-cols-2 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                            {c.items.map(item => (
                                <div key={item.title} className="bg-white p-6 hover:bg-slate-50 transition-colors">
                                    <div className="font-mono text-[0.75rem] font-medium text-brand-600 mb-2">{item.title}</div>
                                    <div className="text-[0.875rem] text-slate-600 leading-relaxed">{item.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="p-8 border border-brand-100 bg-brand-50/50 rounded-xl">
                    <div className="font-mono text-[0.7rem] font-semibold text-brand-600 uppercase tracking-widest mb-3">Reporte uma vulnerabilidade</div>
                    <p className="text-[0.875rem] text-slate-600 leading-relaxed max-w-3xl">
                        Se você encontrou uma vulnerabilidade de segurança no ComplianceOS, entre em contato de forma responsável via <span className="text-brand-600 font-medium">security@complianceos.com.br</span>. Comprometemo-nos a responder em até 72 horas e a tratar o relato com confidencialidade.
                    </p>
                </div>
            </div>
            <PublicFooter />
        </div>
    )
}
