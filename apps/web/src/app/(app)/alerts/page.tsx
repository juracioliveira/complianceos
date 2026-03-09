'use client'

import { useEffect, useState, useCallback } from 'react'
import {
    ShieldAlert, Plus, Filter, Loader2,
    AlertTriangle, CheckCircle2, Clock, ArrowUpRight,
    Building2, X, ChevronDown,
} from 'lucide-react'
import Link from 'next/link'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { formatDate } from '@/lib/utils'
import { useApi } from '@/hooks/useApi'
import { useRouter } from 'next/navigation'

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const SOURCE_LABEL: Record<string, { label: string; color: string }> = {
    SANCTIONS_MATCH: { label: 'Sanções', color: 'badge-red' },
    PEP_MATCH: { label: 'PEP', color: 'badge-amber' },
    CHECKLIST_OVERDUE: { label: 'Checklist', color: 'badge-blue' },
    HIGH_RISK_ENTITY: { label: 'Alto Risco', color: 'badge-orange' },
    MANUAL: { label: 'Manual', color: 'badge-slate' },
}

const STATUS_LABEL: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    OPEN: { label: 'Aberto', icon: ShieldAlert, color: 'text-red-600' },
    UNDER_REVIEW: { label: 'Em Análise', icon: Clock, color: 'text-blue-600' },
    ESCALATED: { label: 'Escalado', icon: AlertTriangle, color: 'text-amber-600' },
    CLOSED_FALSE_POSITIVE: { label: 'Falso Positivo', icon: CheckCircle2, color: 'text-slate-500' },
    CLOSED_CONFIRMED: { label: 'Confirmado', icon: CheckCircle2, color: 'text-emerald-600' },
}

const SEV_COLOR: Record<string, string> = {
    CRITICAL: 'badge-red',
    HIGH: 'badge-orange',
    MEDIUM: 'badge-amber',
    LOW: 'badge-slate',
}

const STATUS_TABS = [
    { key: 'OPEN,UNDER_REVIEW,ESCALATED', label: 'Pendentes' },
    { key: 'OPEN', label: 'Abertos' },
    { key: 'UNDER_REVIEW', label: 'Em Análise' },
    { key: 'ESCALATED', label: 'Escalados' },
    { key: 'CLOSED_FALSE_POSITIVE,CLOSED_CONFIRMED', label: 'Encerrados' },
]

/* ─── Modal de criação rápida ─────────────────────────────────────────────── */
function QuickCreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const { fetchWithAuth } = useApi()
    const [entities, setEntities] = useState<any[]>([])
    const [form, setForm] = useState({
        entityId: '', source: 'MANUAL', severity: 'MEDIUM',
        title: '', description: '',
    })
    const [saving, setSaving] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    useEffect(() => {
        fetchWithAuth('/v1/entities?status=ACTIVE&limit=50')
            .then(res => setEntities(res?.data ?? []))
            .catch(() => {/* silently ignore */})
    }, [fetchWithAuth])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setSubmitError(null)
        try {
            await fetchWithAuth('/v1/alert-cases', {
                method: 'POST',
                body: JSON.stringify({
                    ...form,
                    entityId: form.entityId || undefined,
                }),
            })
            onCreated()
            onClose()
        } catch (err) {
            setSubmitError('Erro ao criar alerta: ' + (err as Error).message)
        } finally {
            setSaving(false)
        }
    }

    const field = (id: string, label: string, children: React.ReactNode) => (
        <div className="space-y-1.5">
            <label htmlFor={id} className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
            {children}
        </div>
    )

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <div>
                        <h2 className="font-bold text-foreground">Novo Alerta</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Criar caso de investigação manualmente</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg text-muted-foreground">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {submitError && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            {submitError}
                        </div>
                    )}
                    {field('entity', 'Entidade (opcional)',
                        <select id="entity" className="input-field w-full" value={form.entityId} onChange={e => setForm(f => ({ ...f, entityId: e.target.value }))}>
                            <option value="">— Nenhuma entidade —</option>
                            {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        {field('source', 'Fonte',
                            <select id="source" className="input-field w-full" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}>
                                <option value="MANUAL">Manual</option>
                                <option value="SANCTIONS_MATCH">Sanções</option>
                                <option value="PEP_MATCH">PEP</option>
                                <option value="CHECKLIST_OVERDUE">Checklist Vencido</option>
                                <option value="HIGH_RISK_ENTITY">Alto Risco</option>
                            </select>
                        )}
                        {field('severity', 'Severidade',
                            <select id="severity" className="input-field w-full" value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}>
                                <option value="CRITICAL">Crítico</option>
                                <option value="HIGH">Alto</option>
                                <option value="MEDIUM">Médio</option>
                                <option value="LOW">Baixo</option>
                            </select>
                        )}
                    </div>
                    {field('title', 'Título',
                        <input id="title" required className="input-field w-full" placeholder="Ex: Possível match em lista OFAC" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                    )}
                    {field('description', 'Descrição',
                        <textarea id="description" rows={3} className="input-field w-full resize-none" placeholder="Detalhes do alerta..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                    )}
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
                        <button type="submit" disabled={saving || !form.title} className="btn-primary flex-1 gap-1.5 disabled:opacity-60">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Criar Alerta
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export default function AlertsPage() {
    const { fetchWithAuth } = useApi()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState(STATUS_TABS[0]!.key)
    const [cases, setCases] = useState<any[]>([])
    const [total, setTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)

    const loadCases = useCallback(async (tab: string) => {
        setIsLoading(true)
        try {
            const statuses = tab.split(',')
            const qs = statuses.map(s => `status=${s}`).join('&')
            const res = await fetchWithAuth(`/v1/alert-cases?${qs}&limit=100`)
            setCases(res?.data ?? [])
            setTotal(res?.total ?? 0)
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }, [fetchWithAuth])

    useEffect(() => { loadCases(activeTab) }, [activeTab, loadCases])

    const openCount = cases.filter(c => c.status === 'OPEN').length
    const reviewCount = cases.filter(c => c.status === 'UNDER_REVIEW').length
    const criticalCount = cases.filter(c => c.severity === 'CRITICAL').length

    return (
        <div className="max-w-7xl mx-auto space-y-5 animate-fade-in">
            {showCreate && (
                <QuickCreateModal
                    onClose={() => setShowCreate(false)}
                    onCreated={() => loadCases(activeTab)}
                />
            )}

            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Fila de Alertas</h1>
                    <p className="page-subtitle">
                        {total} casos • {criticalCount} críticos • {openCount} abertos • {reviewCount} em análise
                    </p>
                </div>
                <button onClick={() => setShowCreate(true)} className="btn-primary btn-sm gap-1.5 flex items-center">
                    <Plus className="w-3.5 h-3.5" />
                    Novo Alerta
                </button>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-4 gap-3">
                {[
                    { label: 'Críticos', count: cases.filter(c => c.severity === 'CRITICAL' && !c.status.startsWith('CLOSED')).length, color: 'border-red-200 bg-red-50', textColor: 'text-red-700' },
                    { label: 'Abertos', count: openCount, color: 'border-orange-200 bg-orange-50', textColor: 'text-orange-700' },
                    { label: 'Em Análise', count: reviewCount, color: 'border-blue-200 bg-blue-50', textColor: 'text-blue-700' },
                    { label: 'Escalados', count: cases.filter(c => c.status === 'ESCALATED').length, color: 'border-amber-200 bg-amber-50', textColor: 'text-amber-700' },
                ].map(s => (
                    <div key={s.label} className={`rounded-xl border px-4 py-3 ${s.color}`}>
                        <p className={`text-2xl font-bold ${s.textColor}`}>{s.count}</p>
                        <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-border">
                {STATUS_TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-3 text-sm font-medium transition-all relative ${activeTab === tab.key
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.key && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-in fade-in slide-in-from-bottom-1" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tabela */}
            <div className="card overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : cases.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <ShieldAlert className="w-12 h-12 opacity-20 mb-3" />
                        <p className="text-sm font-medium">Nenhum alerta encontrado</p>
                        <p className="text-xs mt-1">Esta fila está limpa para o filtro selecionado.</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Entidade</th>
                                <th>Alerta</th>
                                <th>Fonte</th>
                                <th>Severidade</th>
                                <th>Status</th>
                                <th>Responsável</th>
                                <th>Criado em</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {cases.map(c => {
                                const src = SOURCE_LABEL[c.source]
                                const sts = STATUS_LABEL[c.status]
                                const StsIcon = sts?.icon ?? ShieldAlert
                                return (
                                    <tr key={c.id} className="cursor-pointer hover:bg-muted/30" onClick={() => router.push(`/alerts/${c.id}`)}>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground truncate max-w-[140px]">{c.entity_name ?? '—'}</p>
                                                    <p className="text-[10px] text-muted-foreground font-mono">{c.entity_cnpj ?? ''}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{c.title}</p>
                                        </td>
                                        <td>
                                            <span className={`badge ${src?.color ?? 'badge-slate'} text-[11px]`}>{src?.label ?? c.source}</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${SEV_COLOR[c.severity] ?? 'badge-slate'} text-[11px]`}>{c.severity}</span>
                                        </td>
                                        <td>
                                            <span className={`flex items-center gap-1 text-xs font-medium ${sts?.color ?? 'text-muted-foreground'}`}>
                                                <StsIcon className="w-3.5 h-3.5 shrink-0" />
                                                {sts?.label ?? c.status}
                                            </span>
                                        </td>
                                        <td className="text-xs text-muted-foreground">
                                            {c.assigned_to_name ?? <span className="italic opacity-50">Não atribuído</span>}
                                        </td>
                                        <td className="text-xs text-muted-foreground">{formatDate(c.created_at)}</td>
                                        <td className="text-right">
                                            <button className="btn-ghost btn-sm text-primary font-medium">
                                                Abrir <ArrowUpRight className="w-3 h-3 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}

                <div className="px-5 py-3 border-t border-border flex items-center justify-between bg-muted/20">
                    <p className="text-xs text-muted-foreground">
                        Exibindo {cases.length} de {total} casos
                    </p>
                </div>
            </div>
        </div>
    )
}
