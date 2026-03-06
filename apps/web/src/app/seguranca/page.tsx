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
            <div className="max-w-7xl mx-auto px-6 py-20 pb-32">
                {CONTROLS.map(c => (
                    <div key={c.category} className="mb-20">
                        <h2 className="font-display text-2xl text-slate-900 mb-8 pb-3 border-b border-slate-200/80">{c.category}</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {c.items.map(item => (
                                <div key={item.title} className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:shadow-brand-600/5 hover:-translate-y-0.5 transition-all group">
                                    <div className="font-mono text-[10px] font-bold text-brand-600 mb-3 tracking-widest uppercase group-hover:text-brand-700 transition-colors">{item.title}</div>
                                    <div className="text-[15px] text-slate-600 leading-relaxed font-sans">{item.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="p-10 border border-brand-100 bg-brand-50/20 backdrop-blur-sm rounded-[2rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500/5 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-700" />
                    <div className="relative z-10">
                        <div className="font-mono text-[10px] font-bold text-brand-600 uppercase tracking-[0.2em] mb-4">Reporte uma vulnerabilidade</div>
                        <p className="text-lg text-slate-700 leading-relaxed max-w-4xl font-sans">
                            Se você encontrou uma vulnerabilidade de segurança no ComplianceOS, entre em contato de forma responsável via <span className="text-brand-600 font-bold underline decoration-brand-200 underline-offset-4">security@complianceos.com.br</span>. Comprometemo-nos a responder em até 72 horas e a tratar o relato com confidencialidade extrema.
                        </p>
                    </div>
                </div>
            </div>
            <PublicFooter />
        </div>
    )
}
