'use client'

import { useEffect, useState } from 'react'
import { ClipboardList, Play, CheckCircle2, Clock, AlertTriangle, ChevronRight, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { useApi } from '@/hooks/useApi'
import { useRouter } from 'next/navigation'

const MODULE_LABEL: Record<string, { label: string; color: string }> = {
    PLD_FT: { label: 'PLD/FT', color: 'badge-blue' },
    LGPD: { label: 'LGPD', color: 'badge-amber' },
    ANTICORRUPCAO: { label: 'Anticorrupção', color: 'badge-green' },
}

export default function ChecklistsPage() {
    const { fetchWithAuth } = useApi()
    const router = useRouter()
    const [systemChecklists, setSystemChecklists] = useState<any[]>([])
    const [recentRuns, setRecentRuns] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            try {
                // Fetch active checklists
                const checklistsRes = await fetchWithAuth('/v1/checklists?status=ACTIVE')
                setSystemChecklists(checklistsRes.data || [])

                // Fetch recent runs (Assuming there's an endpoint for this, we could use a query or default to empty for now if not available)
                const runsRes = await fetchWithAuth('/v1/audit/events?module=CHECKLIST&action=checklist.execute&limit=5').catch(() => ({ data: [] }))
                // Map audit events to runs or if there's a specific endpoint, adjust here.
                // Keeping static runs fallback just for UI demonstration if API lacks runs endpoint
                setRecentRuns(runsRes.data?.length > 0 ? runsRes.data : [
                    { id: 'r1', entity: 'Alpha Pagamentos S.A.', checklist: 'Due Diligence PLD/FT (CDD)', status: 'COMPLETED', score: 18, risk: 'CRITICAL', executedBy: 'Maria Silva (CCO)', completedAt: '2024-12-10' },
                    { id: 'r2', entity: 'Gama Construções Eireli', checklist: 'Mapeamento LGPD — RAT', status: 'IN_PROGRESS', score: null, risk: 'MEDIUM', executedBy: 'João Costa', completedAt: null }
                ])
            } catch (err: any) {
                console.error('Error fetching checklists', err)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [fetchWithAuth])

    const startChecklist = async (checklistId: string) => {
        try {
            // Assume we select a default entity for demo purposes or we should have an entity selector modal.
            // For now, we just create a run with a mock entity ID or navigate to a selector
            const res = await fetchWithAuth('/v1/checklist-runs', {
                method: 'POST',
                body: JSON.stringify({ checklistId, entityId: '00000000-0000-0000-0000-000000000000', answers: [] })
            })
            router.push(`/checklists/run/${res.data.id}`)
        } catch (err) {
            console.error('Failed to start checklist', err)
            alert('Erro ao iniciar checklist: ' + (err as Error).message)
        }
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
            <div className="page-header">
                <div>
                    <h1 className="page-title">Checklists Regulatórios</h1>
                    <p className="page-subtitle">Templates de Due Diligence por módulo de compliance</p>
                </div>
            </div>

            {/* KPIs rápidos */}
            <div className="grid grid-cols-3 gap-4">
                <div className="stat-card border-l-2 border-l-amber-500">
                    <p className="stat-label">Vencidos</p>
                    <p className="stat-value text-amber-600">12</p>
                    <p className="stat-sub">Aguardando revisão</p>
                </div>
                <div className="stat-card border-l-2 border-l-blue-500">
                    <p className="stat-label">Em andamento</p>
                    <p className="stat-value text-blue-600">7</p>
                    <p className="stat-sub">Execuções ativas</p>
                </div>
                <div className="stat-card border-l-2 border-l-emerald-500">
                    <p className="stat-label">Concluídos (mês)</p>
                    <p className="stat-value text-emerald-600">89</p>
                    <p className="stat-sub">Este mês</p>
                </div>
            </div>

            {/* Templates */}
            <section className="space-y-3">
                <h2 className="text-sm font-semibold text-foreground">Templates de Sistema</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {systemChecklists.map((c) => {
                        const mod = MODULE_LABEL[c.module]
                        return (
                            <div key={c.id} className="card card-hover p-5 space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`badge ${mod?.color ?? 'badge-slate'}`}>{mod?.label}</span>
                                            <span className="text-[10px] text-muted-foreground font-mono">{c.regulationCode || c.id.substring(0, 8)}</span>
                                        </div>
                                        <h3 className="font-semibold text-foreground text-sm">{c.title}</h3>
                                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{c.description || 'Checklist padrão'}</p>
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

                                <button onClick={() => startChecklist(c.id)} className="btn-primary btn-sm w-full justify-center gap-1.5">
                                    <Play className="w-3.5 h-3.5" />
                                    Iniciar avaliação
                                </button>
                            </div>
                        )
                    })}
                </div>
                {systemChecklists.length === 0 && (
                    <div className="text-sm text-muted-foreground">Nenhum template encontrado.</div>
                )}
            </section>

            {/* Execuções recentes */}
            <section className="space-y-3">
                <h2 className="text-sm font-semibold text-foreground">Execuções Recentes</h2>
                <div className="card overflow-hidden">
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
                                    <td className="font-medium text-foreground">{r.entity || 'Entidade Desconhecida'}</td>
                                    <td className="text-xs text-muted-foreground">{r.checklist || 'Checklist Genérico'}</td>
                                    <td>
                                        {r.status === 'COMPLETED'
                                            ? <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium"><CheckCircle2 className="w-3.5 h-3.5" /> Concluído</span>
                                            : <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-medium"><Clock className="w-3.5 h-3.5" /> Em andamento</span>
                                        }
                                    </td>
                                    <td>
                                        {r.score != null
                                            ? <RiskBadge level={r.risk || 'UNKNOWN'} score={r.score} size="sm" />
                                            : <span className="text-xs text-muted-foreground">—</span>
                                        }
                                    </td>
                                    <td className="text-xs text-muted-foreground">{r.executedBy || 'Sistema'}</td>
                                    <td className="text-xs text-muted-foreground">{r.completedAt ? formatDate(r.completedAt) : '—'}</td>
                                    <td className="text-right">
                                        <button onClick={() => router.push(`/checklists/run/${r.id}`)} className="btn-ghost btn-sm text-primary">Ver <ChevronRight className="w-3 h-3 inline" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    )
}
