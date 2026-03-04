'use client'

import { useEffect, useState, useCallback } from 'react'
import {
    ClipboardList, Play, CheckCircle2, Clock, ChevronRight, Loader2,
    AlertTriangle, X, Building2, Search
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { useApi } from '@/hooks/useApi'
import { useRouter, useSearchParams } from 'next/navigation'

const MODULE_LABEL: Record<string, { label: string; color: string }> = {
    PLD_FT: { label: 'PLD/FT', color: 'badge-blue' },
    LGPD: { label: 'LGPD', color: 'badge-amber' },
    ANTICORRUPCAO: { label: 'Anticorrupção', color: 'badge-green' },
}

/* ─── Entity Selector Modal ─────────────────────────────────────────── */
function EntitySelectorModal({ onSelect, onClose }: { onSelect: (entity: any) => void; onClose: () => void }) {
    const { fetchWithAuth } = useApi()
    const [entities, setEntities] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchWithAuth('/v1/entities?status=ACTIVE&limit=50')
            .then(res => setEntities(res?.data ?? []))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [fetchWithAuth])

    const filtered = entities.filter(e =>
        !search ||
        e.name?.toLowerCase().includes(search.toLowerCase()) ||
        e.cnpj?.includes(search)
    )

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <div>
                        <h2 className="font-bold text-foreground">Selecionar Entidade</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Para qual entidade deseja executar o checklist?</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg text-muted-foreground">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-border">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou CNPJ..."
                            className="input-field pl-10 w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Entity List */}
                <div className="max-h-72 overflow-y-auto divide-y divide-border/50">
                    {loading ? (
                        <div className="flex items-center justify-center gap-3 py-10 text-muted-foreground">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-sm">Carregando entidades...</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                            <Building2 className="w-8 h-8 opacity-20 mb-2" />
                            <p className="text-sm">Nenhuma entidade encontrada.</p>
                        </div>
                    ) : filtered.map(entity => (
                        <button
                            key={entity.id}
                            onClick={() => onSelect(entity)}
                            className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors text-left"
                        >
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <Building2 className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-foreground truncate">{entity.name}</span>
                                <span className="text-xs text-muted-foreground">{entity.cnpj ?? entity.cpf ?? 'Sem CNPJ'}</span>
                            </div>
                            {entity.riskLevel && entity.riskLevel !== 'UNKNOWN' && (
                                <RiskBadge level={entity.riskLevel as any} size="xs" className="ml-auto shrink-0" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

/* ─── Main Page ─────────────────────────────────────────────────────── */
export default function ChecklistsPage() {
    const { fetchWithAuth } = useApi()
    const router = useRouter()
    const searchParams = useSearchParams()
    const preselectedEntityId = searchParams.get('entityId')

    const [systemChecklists, setSystemChecklists] = useState<any[]>([])
    const [recentRuns, setRecentRuns] = useState<any[]>([])
    const [summary, setSummary] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Modal state
    const [pendingChecklistId, setPendingChecklistId] = useState<string | null>(null)
    const [showEntityModal, setShowEntityModal] = useState(false)
    const [startingRun, setStartingRun] = useState(false)

    const loadData = useCallback(async () => {
        try {
            const [checklistsRes, runsRes, dashRes] = await Promise.allSettled([
                fetchWithAuth('/v1/checklists?status=ACTIVE'),
                fetchWithAuth('/v1/checklist-runs?limit=10'),
                fetchWithAuth('/v1/dashboard/summary'),
            ])
            if (checklistsRes.status === 'fulfilled') setSystemChecklists(checklistsRes.value?.data ?? [])
            if (runsRes.status === 'fulfilled') setRecentRuns(runsRes.value?.data ?? [])
            if (dashRes.status === 'fulfilled') setSummary(dashRes.value?.data ?? null)
        } catch (err) {
            console.error('Error loading checklists page', err)
        } finally {
            setIsLoading(false)
        }
    }, [fetchWithAuth])

    useEffect(() => { loadData() }, [loadData])

    const startChecklist = async (checklistId: string) => {
        // If entity was pre-selected via URL param, skip modal
        if (preselectedEntityId) {
            await doStartRun(checklistId, preselectedEntityId)
            return
        }
        setPendingChecklistId(checklistId)
        setShowEntityModal(true)
    }

    const doStartRun = async (checklistId: string, entityId: string) => {
        setStartingRun(true)
        try {
            const res = await fetchWithAuth('/v1/checklist-runs', {
                method: 'POST',
                body: JSON.stringify({ checklistId, entityId, answers: [] }),
            })
            router.push(`/checklists/run/${res.data.id}`)
        } catch (err) {
            console.error('Failed to start checklist', err)
            alert('Erro ao iniciar checklist: ' + (err as Error).message)
        } finally {
            setStartingRun(false)
            setShowEntityModal(false)
            setPendingChecklistId(null)
        }
    }

    const handleEntitySelect = async (entity: any) => {
        if (!pendingChecklistId) return
        await doStartRun(pendingChecklistId, entity.id)
    }

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    const overdue = summary?.checklists?.overdue ?? 0
    const inProgress = summary?.checklists?.dueSoon ?? 0
    const completedMonth = summary?.checklists?.completedThisMonth ?? 0

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            {/* Entity Selector Modal */}
            {showEntityModal && (
                <EntitySelectorModal
                    onSelect={handleEntitySelect}
                    onClose={() => {
                        setShowEntityModal(false)
                        setPendingChecklistId(null)
                    }}
                />
            )}

            <div className="page-header">
                <div>
                    <h1 className="page-title">Checklists Regulatórios</h1>
                    <p className="page-subtitle">Templates de Due Diligence por módulo de compliance</p>
                </div>
            </div>

            {/* KPIs — real data from dashboard */}
            <div className="grid grid-cols-3 gap-4">
                <div className="stat-card border-l-2 border-l-amber-500">
                    <p className="stat-label">Vencidos</p>
                    <p className="stat-value text-amber-600">{overdue}</p>
                    <p className="stat-sub">Aguardando revisão</p>
                </div>
                <div className="stat-card border-l-2 border-l-blue-500">
                    <p className="stat-label">Vencendo em breve</p>
                    <p className="stat-value text-blue-600">{inProgress}</p>
                    <p className="stat-sub">Próximos 30 dias</p>
                </div>
                <div className="stat-card border-l-2 border-l-emerald-500">
                    <p className="stat-label">Concluídos (mês)</p>
                    <p className="stat-value text-emerald-600">{completedMonth}</p>
                    <p className="stat-sub">Este mês</p>
                </div>
            </div>

            {/* Templates */}
            <section className="space-y-3">
                <h2 className="text-sm font-semibold text-foreground">Templates de Sistema</h2>
                {systemChecklists.length === 0 ? (
                    <div className="card p-12 text-center text-muted-foreground text-sm">
                        Nenhum template de checklist cadastrado.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {systemChecklists.map((c) => {
                            const mod = MODULE_LABEL[c.module]
                            return (
                                <div key={c.id} className="card card-hover p-5 space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`badge ${mod?.color ?? 'badge-slate'}`}>{mod?.label ?? c.module}</span>
                                                <span className="text-[10px] text-muted-foreground font-mono">{c.regulationCode || c.id.substring(0, 8)}</span>
                                            </div>
                                            <h3 className="font-semibold text-foreground text-sm">{c.title}</h3>
                                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{c.description || 'Checklist regulatório'}</p>
                                        </div>
                                        <ClipboardList className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
                                        <span className="flex items-center gap-1">
                                            <span className="font-semibold text-foreground">{c.totalItems || 0}</span> perguntas
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {c.periodicityDays ? `${c.periodicityDays} dias` : 'Sob demanda'}
                                        </span>
                                        <div className="flex gap-1 flex-wrap">
                                            {(c.appliesTo || []).map((t: string) => (
                                                <span key={t} className="badge badge-slate text-[10px]">{t}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => startChecklist(c.id)}
                                        disabled={startingRun}
                                        className="btn-primary btn-sm w-full justify-center gap-1.5 disabled:opacity-60"
                                    >
                                        {startingRun ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                                        Iniciar avaliação
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </section>

            {/* Recent Runs — real data */}
            <section className="space-y-3">
                <h2 className="text-sm font-semibold text-foreground">Execuções Recentes</h2>
                <div className="card overflow-hidden">
                    {recentRuns.length === 0 ? (
                        <div className="p-10 text-center text-sm text-muted-foreground">
                            Nenhuma execução registrada ainda.
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Entidade</th>
                                    <th>Checklist</th>
                                    <th>Status</th>
                                    <th>Resultado</th>
                                    <th>Executado por</th>
                                    <th>Conclusão</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {recentRuns.map((r, i) => (
                                    <tr key={r.id || i}>
                                        <td className="font-medium text-foreground">{r.entityName ?? '—'}</td>
                                        <td className="text-xs text-muted-foreground">{r.checklistTitle ?? '—'}</td>
                                        <td>
                                            {r.status === 'COMPLETED'
                                                ? <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium"><CheckCircle2 className="w-3.5 h-3.5" /> Concluído</span>
                                                : <span className="flex items-center gap-1 text-blue-600 text-xs font-medium"><Clock className="w-3.5 h-3.5" /> Em andamento</span>
                                            }
                                        </td>
                                        <td>
                                            {r.score != null
                                                ? <RiskBadge level={(r.riskLevel ?? 'UNKNOWN') as any} score={r.score} size="sm" />
                                                : <span className="text-xs text-muted-foreground">—</span>
                                            }
                                        </td>
                                        <td className="text-xs text-muted-foreground">{r.executedByName ?? r.executedBy ?? '—'}</td>
                                        <td className="text-xs text-muted-foreground">{r.completedAt ? formatDate(r.completedAt) : '—'}</td>
                                        <td className="text-right">
                                            <button onClick={() => router.push(`/checklists/run/${r.id}`)} className="btn-ghost btn-sm text-primary">
                                                Ver <ChevronRight className="w-3 h-3 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>
        </div>
    )
}
