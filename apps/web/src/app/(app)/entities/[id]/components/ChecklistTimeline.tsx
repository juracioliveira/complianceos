'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Clock, ChevronRight, Loader2, ClipboardList } from 'lucide-react'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { useApi } from '@/hooks/useApi'
import { useRouter } from 'next/navigation'
import { formatDate, cn } from '@/lib/utils'

interface ChecklistTimelineProps {
    id: string
    limit?: number
    title?: string
    showFilters?: boolean
}

export default function ChecklistTimeline({ id, limit, title, showFilters }: ChecklistTimelineProps) {
    const { fetchWithAuth } = useApi()
    const router = useRouter()
    const [runs, setRuns] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')

    useEffect(() => {
        if (!id) return
        setLoading(true)
        const params = new URLSearchParams()
        if (limit) params.set('limit', String(limit))
        fetchWithAuth(`/v1/entities/${id}/checklist-runs?${params.toString()}`)
            .then((res) => setRuns(res?.data ?? []))
            .catch((err) => console.error('ChecklistTimeline fetch error', err))
            .finally(() => setLoading(false))
    }, [id, limit, fetchWithAuth])

    const displayed = runs
        .filter(r => !search || r.checklistTitle?.toLowerCase().includes(search.toLowerCase()))
        .filter(r => !statusFilter || r.status === statusFilter)

    return (
        <div className={cn("card overflow-hidden border-slate-200/60 shadow-md", title ? "p-0" : "")}>
            {title && (
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/30">
                    <h3 className="font-display text-xl text-slate-900 tracking-tight">{title}</h3>
                    <button
                        className="text-[10px] font-bold text-brand-600 hover:text-brand-700 uppercase tracking-widest px-3 py-1 rounded-lg hover:bg-brand-50 transition-colors"
                        onClick={() => router.push(`/entities/${id}/checklists`)}
                    >
                        Ver Histórico Completo →
                    </button>
                </div>
            )}

            {showFilters && (
                <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50/20">
                    <div className="relative flex-1 max-w-sm">
                        <input
                            type="text"
                            placeholder="Buscar por template..."
                            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs w-full focus:outline-none focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center p-16 text-slate-400 gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Recuperando registros...</span>
                </div>
            ) : displayed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4 bg-slate-50/30">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-inner">
                        <ClipboardList className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-widest">Nenhuma avaliação registrada</p>
                </div>
            ) : (
                <div className="relative p-6">
                    {/* Vertical Line */}
                    <div className="absolute left-[47px] top-6 bottom-6 w-px bg-slate-100" />

                    <div className="flex flex-col gap-6">
                        {displayed.map((item) => (
                            <div
                                key={item.id}
                                className="group relative flex items-start gap-6 cursor-pointer"
                                onClick={() => router.push(`/checklists/run/${item.id}`)}
                            >
                                {/* Timeline Dot */}
                                <div className={cn(
                                    "relative z-10 w-11 h-11 rounded-2xl border border-white shadow-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3",
                                    item.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 shadow-emerald-500/10' : 'bg-amber-50 text-amber-600 shadow-amber-500/10'
                                )}>
                                    {item.status === 'COMPLETED' ? <CheckCircle2 className="w-5 h-5" strokeWidth={2.5} /> : <Clock className="w-5 h-5" strokeWidth={2.5} />}
                                </div>

                                <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm group-hover:shadow-xl group-hover:shadow-slate-200/50 group-hover:border-brand-200 transition-all duration-300">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[13px] font-bold text-slate-900 group-hover:text-brand-700 transition-colors tracking-tight uppercase">
                                                    {item.checklistTitle ?? 'Protocolo de Verificação'}
                                                </span>
                                                {item.status === 'IN_PROGRESS' && (
                                                    <span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                                                        Em andamento
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold uppercase tracking-widest font-mono">
                                                    <Clock className="w-3 h-3 opacity-40 text-slate-500" />
                                                    {item.completedAt ? formatDate(item.completedAt) : item.startedAt ? formatDate(item.startedAt) : '—'}
                                                </div>
                                                {item.executedBy && (
                                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                                                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                        <span>CCO: {item.executedByName ?? item.executedBy}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {item.score != null ? (
                                                <RiskBadge level={(item.riskLevel ?? 'UNKNOWN') as any} score={item.score} size="xs" />
                                            ) : (
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100 px-3 py-1 rounded-lg">Cálculo Pendente</div>
                                            )}
                                            <ChevronRight className="w-4 h-4 text-slate-300 translate-x-0 group-hover:translate-x-1 group-hover:text-brand-500 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
