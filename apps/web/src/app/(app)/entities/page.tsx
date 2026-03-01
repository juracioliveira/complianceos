import type { Metadata } from 'next'
import { Plus, Search, SlidersHorizontal, Download } from 'lucide-react'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { formatCNPJ, formatDate, KYC_LABELS } from '@/lib/utils'

export const metadata: Metadata = { title: 'Entidades' }

const entities = [
    { id: '1', name: 'Alpha Pagamentos S.A.', cnpj: '11111111000101', type: 'CLIENTE', sector: 'Serviços Financeiros', risk: 'CRITICAL', score: 18, kyc: 'APPROVED', status: 'ACTIVE', createdAt: '2024-01-15', isPep: false },
    { id: '2', name: 'Beta Distribuidora Ltda', cnpj: '22222222000102', type: 'FORNECEDOR', sector: 'Comércio', risk: 'LOW', score: 88, kyc: 'APPROVED', status: 'ACTIVE', createdAt: '2024-02-20', isPep: false },
    { id: '3', name: 'Gama Construções Eireli', cnpj: '33333333000103', type: 'PARCEIRO', sector: 'Construção Civil', risk: 'MEDIUM', score: 62, kyc: 'PENDING', status: 'ACTIVE', createdAt: '2024-03-10', isPep: false },
    { id: '4', name: 'Delta Energia Corp.', cnpj: '44444444000104', type: 'CLIENTE', sector: 'Energia', risk: 'CRITICAL', score: 22, kyc: 'IN_PROGRESS', status: 'ACTIVE', createdAt: '2024-04-05', isPep: true },
    { id: '5', name: 'Epsilon Consultoria S.A.', cnpj: '55555555000105', type: 'FORNECEDOR', sector: 'Consultoria', risk: 'HIGH', score: 45, kyc: 'APPROVED', status: 'ACTIVE', createdAt: '2024-05-18', isPep: false },
    { id: '6', name: 'Sigma Exportações Ltda', cnpj: '66666666000106', type: 'PARCEIRO', sector: 'Comércio Exterior', risk: 'CRITICAL', score: 15, kyc: 'PENDING', status: 'ACTIVE', createdAt: '2024-06-30', isPep: false },
    { id: '7', name: 'Omega Holdings S.A.', cnpj: '77777777000107', type: 'FORNECEDOR', sector: 'Holding', risk: 'CRITICAL', score: 29, kyc: 'REJECTED', status: 'BLOCKED', createdAt: '2024-07-12', isPep: true },
    { id: '8', name: 'Phi Tecnologia Ltda', cnpj: '88888888000108', type: 'PARCEIRO', sector: 'Tecnologia', risk: 'LOW', score: 91, kyc: 'APPROVED', status: 'ACTIVE', createdAt: '2024-08-01', isPep: false },
]

const TYPE_LABELS: Record<string, string> = {
    CLIENTE: 'Cliente', FORNECEDOR: 'Fornecedor', PARCEIRO: 'Parceiro', COLABORADOR: 'Colaborador',
}

const KYC_BADGE: Record<string, string> = {
    PENDING: 'badge badge-amber',
    IN_PROGRESS: 'badge badge-blue',
    APPROVED: 'badge badge-green',
    REJECTED: 'badge badge-red',
}

const STATUS_BADGE: Record<string, string> = {
    ACTIVE: 'badge badge-green',
    INACTIVE: 'badge badge-slate',
    BLOCKED: 'badge badge-red',
}

const RISK_ORDER: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, UNKNOWN: 4 }
const sorted = [...entities].sort((a, b) => RISK_ORDER[a.risk]! - RISK_ORDER[b.risk]!)

const summary = {
    CRITICAL: entities.filter(e => e.risk === 'CRITICAL').length,
    HIGH: entities.filter(e => e.risk === 'HIGH').length,
    MEDIUM: entities.filter(e => e.risk === 'MEDIUM').length,
    LOW: entities.filter(e => e.risk === 'LOW' || e.risk === 'UNKNOWN').length,
}

export default function EntitiesPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-5 animate-fade-in">

            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Entidades</h1>
                    <p className="page-subtitle">
                        {entities.length} entidades cadastradas • {summary.CRITICAL} críticas • {summary.HIGH} alto risco
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="btn-secondary btn-sm gap-1.5">
                        <Download className="w-3.5 h-3.5" />
                        Exportar
                    </button>
                    <button className="btn-primary btn-sm gap-1.5">
                        <Plus className="w-3.5 h-3.5" />
                        Nova Entidade
                    </button>
                </div>
            </div>

            {/* Summary strips */}
            <div className="grid grid-cols-4 gap-3">
                {[
                    { label: 'Crítico', count: summary.CRITICAL, color: 'border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900', textCount: 'text-red-700 dark:text-red-400' },
                    { label: 'Alto', count: summary.HIGH, color: 'border-orange-200 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-900', textCount: 'text-orange-700 dark:text-orange-400' },
                    { label: 'Médio', count: summary.MEDIUM, color: 'border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900', textCount: 'text-amber-700 dark:text-amber-400' },
                    { label: 'Baixo', count: summary.LOW, color: 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900', textCount: 'text-emerald-700 dark:text-emerald-400' },
                ].map((s) => (
                    <div key={s.label} className={`rounded-xl border px-4 py-3 cursor-pointer hover:opacity-80 transition-opacity ${s.color}`}>
                        <p className={`text-2xl font-bold ${s.textCount}`}>{s.count}</p>
                        <p className="text-xs text-muted-foreground font-medium">{s.label} risco</p>
                    </div>
                ))}
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 min-w-[200px] max-w-sm">
                    <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou CNPJ..."
                        className="bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none w-full"
                    />
                </div>
                <button className="btn-secondary btn-sm gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Filtros
                </button>
                {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((level) => (
                    <RiskBadge key={level} level={level} size="sm" className="cursor-pointer hover:opacity-70 transition-opacity" />
                ))}
            </div>

            {/* Tabela */}
            <div className="card overflow-hidden">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Entidade</th>
                            <th>Tipo · Setor</th>
                            <th>Nível de Risco</th>
                            <th>KYC</th>
                            <th>Status</th>
                            <th>Cadastrado</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((e) => (
                            <tr key={e.id}>
                                <td>
                                    <div className="flex items-start gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-muted-foreground">
                                            {e.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <p className="font-semibold text-foreground text-sm truncate">{e.name}</p>
                                                {e.isPep && (
                                                    <span className="badge badge-red text-[10px]">PEP</span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-muted-foreground font-mono">{formatCNPJ(e.cnpj)}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <p className="text-sm text-foreground">{TYPE_LABELS[e.type]}</p>
                                    <p className="text-xs text-muted-foreground">{e.sector}</p>
                                </td>
                                <td>
                                    <RiskBadge level={e.risk} score={e.score} />
                                </td>
                                <td>
                                    <span className={KYC_BADGE[e.kyc] ?? 'badge badge-slate'}>
                                        {KYC_LABELS[e.kyc] ?? e.kyc}
                                    </span>
                                </td>
                                <td>
                                    <span className={STATUS_BADGE[e.status] ?? 'badge badge-slate'}>
                                        {e.status === 'ACTIVE' ? 'Ativo' : e.status === 'BLOCKED' ? 'Bloqueado' : 'Inativo'}
                                    </span>
                                </td>
                                <td className="text-xs text-muted-foreground">
                                    {formatDate(e.createdAt)}
                                </td>
                                <td className="text-right">
                                    <a href={`/entities/${e.id}`} className="btn-ghost btn-sm text-primary font-medium">
                                        Ver →
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Paginação */}
                <div className="px-5 py-3 border-t border-border flex items-center justify-between bg-muted/20">
                    <p className="text-xs text-muted-foreground">
                        Mostrando {entities.length} de 138 entidades
                    </p>
                    <div className="flex items-center gap-1">
                        {['Anterior', '1', '2', '3', 'Próxima'].map((p, i) => (
                            <button
                                key={p}
                                className={p === '1'
                                    ? 'w-8 h-7 rounded text-xs bg-primary text-primary-foreground font-medium'
                                    : 'w-8 h-7 rounded text-xs text-muted-foreground hover:bg-accent transition-colors border border-border bg-card'}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
