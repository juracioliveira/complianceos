'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Clock, ChevronRight, Loader2, ClipboardList } from 'lucide-react'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { useApi } from '@/hooks/useApi'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'

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
        <div className={`card ${title ? 'p-6' : 'p-0'}`}>
            {title && (
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">{title}</h3>
                    <button className="text-xs font-bold text-primary hover:underline" onClick={() => router.push(`/entities/${id}`)}>Ver todos</button>
                </div>
            )}

            {showFilters && (
                <div className="p-4 border-b border-border flex items-center gap-4 bg-muted/10">
                    <input
                        type="text"
                        placeholder="Buscar por template..."
                        className="input-field max-w-xs"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select className="input-field max-w-[150px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">Todos Status</option>
                        <option value="COMPLETED">Concluído</option>
                        <option value="IN_PROGRESS">Em Andamento</option>
                        <option value="CANCELLED">Cancelado</option>
                    </select>
                </div>
            )}

            {loading ? (
                <div className="flex items-center gap-3 p-8 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Carregando avaliações...</span>
                </div>
            ) : displayed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                    <ClipboardList className="w-10 h-10 opacity-20" />
                    <p className="text-sm">Nenhuma avaliação encontrada para esta entidade.</p>
                </div>
            ) : (
                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-[21px] top-6 bottom-6 w-px bg-border hidden md:block" />

                    <div className="flex flex-col gap-4">
                        {displayed.map((item) => (
                            <div
                                key={item.id}
                                className="group relative flex items-start gap-4 p-3 md:p-4 rounded-xl hover:bg-muted/30 transition-all cursor-pointer"
                                onClick={() => router.push(`/checklists/run/${item.id}`)}
                            >
                                {/* Timeline Dot */}
                                <div className={`
                                    relative z-10 w-11 h-11 rounded-full border-4 border-background flex items-center justify-center shrink-0 hidden md:flex
                                    ${item.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}
                                `}>
                                    {item.status === 'COMPLETED' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                </div>

                                <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                                                {item.checklistTitle ?? 'Checklist'}
                                            </span>
                                            {item.status === 'IN_PROGRESS' && (
                                                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase">
                                                    Em andamento
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                                            <span>{item.completedAt ? formatDate(item.completedAt) : item.startedAt ? formatDate(item.startedAt) : '—'}</span>
                                            {item.executedBy && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-border" />
                                                    <span>Executor: {item.executedByName ?? item.executedBy}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {item.score != null ? (
                                            <RiskBadge level={(item.riskLevel ?? 'UNKNOWN') as any} score={item.score} size="xs" />
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
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
