'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, SlidersHorizontal, Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { formatCNPJ, formatDate, KYC_LABELS } from '@/lib/utils'
import { useApi } from '@/hooks/useApi'
import { usePermissions } from '@/hooks/use-permissions'
import { ProtectedAction } from '@/components/rbac/ProtectedAction'

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

import { KycStatusBadge } from '@/components/ui/KycStatusBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'

export default function EntitiesPage() {
    const { fetchWithAuth } = useApi()
    const { role, can } = usePermissions()
    const isReadOnly = role === 'READONLY'
    const [entities, setEntities] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isExporting, setIsExporting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    useEffect(() => {
        async function loadEntities() {
            try {
                const { data } = await fetchWithAuth('/v1/entities')
                setEntities(data)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }
        loadEntities()
    }, [fetchWithAuth])

    const handleExport = async (format: 'PDF' | 'JSON' = 'PDF') => {
        try {
            setIsExporting(true)
            const res = await fetchWithAuth('/v1/documents/generate', {
                method: 'POST',
                body: JSON.stringify({
                    type: 'REGISTRO_ENTIDADES',
                    parameters: { listOnly: true },
                    format: format,
                })
            })
            const { url, id } = res.data

            if (url) {
                const link = document.createElement('a')
                link.href = url
                link.download = `export-${id}.${format.toLowerCase()}`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            } else {
                setExportMessage({ type: 'success', text: `Exportação ${format} solicitada. O arquivo estará disponível na seção de Auditoria em breve.` })
                setTimeout(() => setExportMessage(null), 5000)
            }

        } catch (err) {
            setExportMessage({ type: 'error', text: 'Falha na exportação: ' + (err as Error).message })
            setTimeout(() => setExportMessage(null), 5000)
        } finally {
            setIsExporting(false)
        }
    }

    const RISK_ORDER: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, UNKNOWN: 4 }
    const sorted = [...entities].sort((a, b) => RISK_ORDER[a.riskLevel]! - RISK_ORDER[b.riskLevel]!)

    const summary = {
        CRITICAL: entities.filter(e => e.riskLevel === 'CRITICAL').length,
        HIGH: entities.filter(e => e.riskLevel === 'HIGH').length,
        MEDIUM: entities.filter(e => e.riskLevel === 'MEDIUM').length,
        LOW: entities.filter(e => e.riskLevel === 'LOW' || e.riskLevel === 'UNKNOWN').length,
    }

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            {exportMessage && (
                <div className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium ${
                    exportMessage.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400'
                        : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400'
                }`}>
                    {exportMessage.type === 'success'
                        ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                        : <AlertCircle className="w-4 h-4 shrink-0" />}
                    {exportMessage.text}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-bold tracking-wider uppercase mb-3 shadow-sm">
                        Governança de Dados · Entidades
                    </div>
                    <h1 className="font-display text-5xl text-slate-900 leading-none tracking-tight">
                        Gestão de <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-cyan-500">Entidades</span>
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-3">
                        {entities.length} entidades cadastradas baseadas em conformidade regulatória
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ProtectedAction action="export" resource="entities">
                        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                            <button
                                onClick={() => handleExport('PDF')}
                                disabled={isExporting}
                                className="btn-ghost btn-sm h-8 px-3 text-[11px] font-bold uppercase tracking-wider gap-1.5"
                            >
                                {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                                PDF
                            </button>
                            <button
                                onClick={() => handleExport('JSON')}
                                disabled={isExporting}
                                className="btn-ghost btn-sm h-8 px-3 text-[11px] font-bold uppercase tracking-wider gap-1.5"
                            >
                                <Download className="w-3.5 h-3.5" />
                                JSON
                            </button>
                        </div>
                    </ProtectedAction>

                    <ProtectedAction action="create" resource="entities">
                        <a href="/entities/new" className="btn-primary btn-sm shadow-brand-600/20 px-6">
                            <Plus className="w-4 h-4" />
                            Nova Entidade
                        </a>
                    </ProtectedAction>
                </div>
            </div>

            {/* Summary cards compactos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Crítico', count: summary.CRITICAL, color: 'border-l-red-500 bg-white', textCount: 'text-red-600', sub: 'Ação Imediata' },
                    { label: 'Alto Risco', count: summary.HIGH, color: 'border-l-amber-600 bg-white', textCount: 'text-amber-600', sub: 'Monitoramento+' },
                    { label: 'Médio Risco', count: summary.MEDIUM, color: 'border-l-amber-400 bg-white', textCount: 'text-amber-500', sub: 'Preventivo' },
                    { label: 'Baixo Risco', count: summary.LOW, color: 'border-l-emerald-500 bg-white', textCount: 'text-emerald-600', sub: 'Conforme' },
                ].map((s) => (
                    <div key={s.label} className={`card p-4 border-l-4 ${s.color} hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group relative overflow-hidden`}>
                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-grid" />
                        <div className="relative z-10">
                            <p className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                            <div className="flex items-end justify-between mt-1">
                                <p className={`text-3xl font-mono font-bold ${s.textCount} tracking-tighter`}>{s.count}</p>
                                <p className="text-[10px] text-slate-400 font-medium mb-1">{s.sub}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-4 flex-wrap bg-slate-50/50 p-2 rounded-2xl border border-slate-200/60 shadow-inner">
                <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex-1 min-w-[300px] shadow-sm group focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-500/5 transition-all">
                    <Search className="w-4 h-4 text-slate-400 group-focus-within:text-brand-500 shrink-0 transition-colors" />
                    <input
                        type="text"
                        placeholder="Pesquisar por razão social, nome fantasia ou CNPJ..."
                        className="bg-transparent text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
                    />
                </div>
                <button className="btn-secondary h-11 gap-2 px-5 rounded-xl border-slate-200 bg-white shadow-sm hover:shadow-md transition-all text-[13px] font-bold">
                    <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                    Filtros Avançados
                </button>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
                    <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest mr-2">Nível:</span>
                    {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((level) => (
                        <RiskBadge key={level} level={level} size="xs" className="cursor-pointer hover:scale-105 transition-transform" />
                    ))}
                </div>
            </div>

            {/* Tabela */}
            <div className="card shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden bg-white border-slate-200/60">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="pl-8">Entidade / Identificador</th>
                                <th>Tipo · Setor</th>
                                <th>Cálculo de Risco</th>
                                <th>Status KYC/KYB</th>
                                <th>Governança</th>
                                <th className="text-right pr-8">Operações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {sorted.map((e) => (
                                <tr key={e.id} className="group transition-colors hover:bg-slate-50/30">
                                    <td className="pl-8">
                                        <div className="flex items-start gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-[13px] font-bold text-slate-500 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all">
                                                {e.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-slate-900 text-[13px] truncate tracking-tight uppercase group-hover:text-brand-600 transition-colors">{e.name}</p>
                                                    {e.isPep && !isReadOnly && (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-red-50 text-red-600 text-[9px] font-bold border border-red-100 animate-pulse">PEP</span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-400 font-mono font-bold mt-1 tracking-wider uppercase">
                                                    {isReadOnly ? '•••••••••••' : formatCNPJ(e.cnpj || e.cpf || '')}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <p className="text-[13px] font-bold text-slate-700 tracking-tight">{TYPE_LABELS[e.entityType]}</p>
                                        <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{e.sector}</p>
                                    </td>
                                    <td>
                                        <RiskBadge level={e.riskLevel} score={e.riskScore} />
                                    </td>
                                    <td>
                                        <KycStatusBadge status={e.kycStatus} />
                                    </td>
                                    <td>
                                        <StatusBadge status={e.status} />
                                    </td>
                                    <td className="text-right pr-8">
                                        <a href={`/entities/${e.id}`} className="btn-ghost btn-sm h-8 px-4 hover:bg-brand-50 hover:text-brand-700 font-bold text-[11px] uppercase tracking-widest">
                                            Perfil →
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Paginação */}
                <div className="px-8 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-[11px] font-bold font-mono text-slate-400 uppercase tracking-widest">
                        Exibindo {entities.length} entidades cadastradas
                    </p>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-brand-50 text-brand-700 text-[9px] font-bold uppercase tracking-widest border border-brand-100/50 shadow-sm">
                        Total Segregado
                    </div>
                </div>
            </div>
        </div>
    )
}
