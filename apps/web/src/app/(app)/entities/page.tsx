'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, SlidersHorizontal, Download, Loader2 } from 'lucide-react'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { formatCNPJ, formatDate, KYC_LABELS } from '@/lib/utils'
import { useApi } from '@/hooks/useApi'

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

export default function EntitiesPage() {
    const { fetchWithAuth } = useApi()
    const [entities, setEntities] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isExporting, setIsExporting] = useState(false)
    const [error, setError] = useState<string | null>(null)

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
            // Create a document generation job
            const res = await fetchWithAuth('/v1/documents/generate', {
                method: 'POST',
                body: JSON.stringify({
                    type: 'REGISTRO_ENTIDADES',
                    parameters: { listOnly: true },
                    format: format,
                })
            })
            const { url, id } = res.data

            // if API returns direct buffer or async URL
            if (url) {
                const link = document.createElement('a')
                link.href = url
                link.download = `export-${id}.${format.toLowerCase()}`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            } else {
                alert(`Exportação ${format} solicitada. O arquivo estará disponível na seção de Auditoria em breve.`)
            }

        } catch (err) {
            console.error('Falha na exportação', err)
            alert('Falha na exportação: ' + (err as Error).message)
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
                    <button
                        onClick={() => handleExport('PDF')}
                        disabled={isExporting}
                        className="btn-secondary btn-sm gap-1.5 disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                        Exportar PDF
                    </button>
                    <button
                        onClick={() => handleExport('JSON')}
                        disabled={isExporting}
                        className="btn-secondary btn-sm gap-1.5 disabled:opacity-50"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Exportar JSON
                    </button>
                    <a href="/entities/new" className="btn-primary btn-sm gap-1.5 flex items-center">
                        <Plus className="w-3.5 h-3.5" />
                        Nova Entidade
                    </a>
                </div>
            </div>

            {/* Summary strips */}
            <div className="grid grid-cols-4 gap-3">
                {[
                    { label: 'Crítico', count: summary.CRITICAL, color: 'border-red-200 bg-red-50', textCount: 'text-red-700' },
                    { label: 'Alto', count: summary.HIGH, color: 'border-orange-200 bg-orange-50', textCount: 'text-orange-700' },
                    { label: 'Médio', count: summary.MEDIUM, color: 'border-amber-200 bg-amber-50', textCount: 'text-amber-700' },
                    { label: 'Baixo', count: summary.LOW, color: 'border-emerald-200 bg-emerald-50', textCount: 'text-emerald-700' },
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
                                            <p className="text-[11px] text-muted-foreground font-mono">{formatCNPJ(e.cnpj || e.cpf || '')}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <p className="text-sm text-foreground">{TYPE_LABELS[e.entityType]}</p>
                                    <p className="text-xs text-muted-foreground">{e.sector}</p>
                                </td>
                                <td>
                                    <RiskBadge level={e.riskLevel} score={e.riskScore} />
                                </td>
                                <td>
                                    <span className={KYC_BADGE[e.kycStatus] ?? 'badge badge-slate'}>
                                        {KYC_LABELS[e.kycStatus] ?? e.kycStatus}
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
                        Mostrando {entities.length} de {entities.length} entidades
                    </p>
                </div>
            </div>
        </div>
    )
}
