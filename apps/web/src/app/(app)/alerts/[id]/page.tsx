'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft, ShieldAlert, Clock, CheckCircle2,
    AlertTriangle, Building2, User, Loader2,
    ChevronDown, X, ExternalLink,
} from 'lucide-react'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { formatDate } from '@/lib/utils'
import { useApi } from '@/hooks/useApi'

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const SOURCE_LABEL: Record<string, { label: string; color: string }> = {
    SANCTIONS_MATCH: { label: 'Match em Lista de Sanções', color: 'badge-red' },
    PEP_MATCH: { label: 'Match de PEP', color: 'badge-amber' },
    CHECKLIST_OVERDUE: { label: 'Checklist Vencido', color: 'badge-blue' },
    HIGH_RISK_ENTITY: { label: 'Entidade de Alto Risco', color: 'badge-orange' },
    MANUAL: { label: 'Criado Manualmente', color: 'badge-slate' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    OPEN: { label: 'Aberto', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
    UNDER_REVIEW: { label: 'Em Análise', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    ESCALATED: { label: 'Escalado', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
    CLOSED_FALSE_POSITIVE: { label: 'Falso Positivo', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
    CLOSED_CONFIRMED: { label: 'Caso Confirmado', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
}

const SEV_COLOR: Record<string, string> = {
    CRITICAL: 'badge-red', HIGH: 'badge-orange', MEDIUM: 'badge-amber', LOW: 'badge-slate'
}

const TERMINAL_STATUSES = ['CLOSED_FALSE_POSITIVE', 'CLOSED_CONFIRMED']

const TRANSITIONS: Record<string, Array<{ value: string; label: string }>> = {
    OPEN: [
        { value: 'UNDER_REVIEW', label: 'Iniciar Análise' },
        { value: 'ESCALATED', label: 'Escalar ao MLRO' },
        { value: 'CLOSED_FALSE_POSITIVE', label: 'Fechar — Falso Positivo' },
        { value: 'CLOSED_CONFIRMED', label: 'Fechar — Confirmar Caso' },
    ],
    UNDER_REVIEW: [
        { value: 'ESCALATED', label: 'Escalar ao MLRO' },
        { value: 'CLOSED_FALSE_POSITIVE', label: 'Fechar — Falso Positivo' },
        { value: 'CLOSED_CONFIRMED', label: 'Fechar — Confirmar Caso' },
    ],
    ESCALATED: [
        { value: 'UNDER_REVIEW', label: 'Retornar à Análise' },
        { value: 'CLOSED_FALSE_POSITIVE', label: 'Fechar — Falso Positivo' },
        { value: 'CLOSED_CONFIRMED', label: 'Fechar — Confirmar Caso' },
    ],
}

/* ─── Painel de ações ─────────────────────────────────────────────────────── */
function ActionPanel({ alertCase, onUpdated }: { alertCase: any; onUpdated: () => void }) {
    const { fetchWithAuth } = useApi()
    const [selectedAction, setSelectedAction] = useState('')
    const [note, setNote] = useState('')
    const [saving, setSaving] = useState(false)

    const isTerminal = TERMINAL_STATUSES.includes(alertCase.status)
    const availableActions = TRANSITIONS[alertCase.status] ?? []
    const needsNote = ['CLOSED_FALSE_POSITIVE', 'CLOSED_CONFIRMED'].includes(selectedAction)

    const handleSubmit = async () => {
        if (!selectedAction) return
        if (needsNote && !note.trim()) { alert('Nota de resolução obrigatória.'); return }
        setSaving(true)
        try {
            await fetchWithAuth(`/v1/alert-cases/${alertCase.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: selectedAction, resolutionNote: note || undefined }),
            })
            onUpdated()
            setSelectedAction('')
            setNote('')
        } catch (err) {
            alert('Erro: ' + (err as Error).message)
        } finally {
            setSaving(false)
        }
    }

    if (isTerminal) {
        return (
            <div className="card p-5">
                <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 ${STATUS_CONFIG[alertCase.status]?.bg}`}>
                    <CheckCircle2 className={`w-4 h-4 ${STATUS_CONFIG[alertCase.status]?.color}`} />
                    <p className={`text-sm font-semibold ${STATUS_CONFIG[alertCase.status]?.color}`}>
                        Caso Encerrado — {STATUS_CONFIG[alertCase.status]?.label}
                    </p>
                </div>
                {alertCase.resolution_note && (
                    <div className="mt-3 p-3 bg-muted/40 rounded-lg border border-border">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Nota de Resolução</p>
                        <p className="text-sm text-foreground">{alertCase.resolution_note}</p>
                    </div>
                )}
                {alertCase.resolved_by_name && (
                    <p className="text-xs text-muted-foreground mt-3">
                        Resolvido por <span className="font-medium">{alertCase.resolved_by_name}</span> em {formatDate(alertCase.resolved_at)}
                    </p>
                )}
            </div>
        )
    }

    return (
        <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Ações do Caso</h3>

            <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nova Ação</label>
                <div className="relative">
                    <select
                        value={selectedAction}
                        onChange={e => setSelectedAction(e.target.value)}
                        className="input-field w-full appearance-none pr-8"
                    >
                        <option value="">— Selecionar ação —</option>
                        {availableActions.map(a => (
                            <option key={a.value} value={a.value}>{a.label}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
            </div>

            {needsNote && (
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Nota de Resolução <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        rows={3}
                        className="input-field w-full resize-none"
                        placeholder="Descreva o motivo de resolução..."
                        value={note}
                        onChange={e => setNote(e.target.value)}
                    />
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={!selectedAction || saving}
                className="btn-primary w-full justify-center gap-1.5 disabled:opacity-60"
            >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Confirmar Ação
            </button>
        </div>
    )
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export default function AlertInvestigationPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const { fetchWithAuth } = useApi()
    const [alertCase, setAlertCase] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    const load = useCallback(async () => {
        try {
            setIsLoading(true)
            const res = await fetchWithAuth(`/v1/alert-cases/${id}`)
            setAlertCase(res?.data ?? null)
        } catch (err: any) {
            if (err?.status === 404 || err?.message?.includes('404')) setNotFound(true)
        } finally {
            setIsLoading(false)
        }
    }, [id, fetchWithAuth])

    useEffect(() => { load() }, [load])

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    if (notFound || !alertCase) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
                <ShieldAlert className="w-12 h-12 opacity-20 mb-3" />
                <p className="font-semibold">Caso não encontrado</p>
                <Link href="/alerts" className="btn-secondary btn-sm mt-4">← Voltar à Fila</Link>
            </div>
        )
    }

    const src = SOURCE_LABEL[alertCase.source]
    const sts = STATUS_CONFIG[alertCase.status]
    const evidence = typeof alertCase.evidence === 'string'
        ? JSON.parse(alertCase.evidence)
        : alertCase.evidence ?? {}
    const hasEvidence = Object.keys(evidence).length > 0

    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-6 animate-fade-in">
            {/* Breadcrumb */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Investigação de Alerta</h1>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{id}</p>
                    </div>
                </div>
                {alertCase.entity_id && (
                    <Link href={`/entities/${alertCase.entity_id}`} className="btn-secondary btn-sm gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5" />
                        Ver Entidade
                    </Link>
                )}
            </div>

            {/* Status + Severity Header */}
            <div className="card p-5 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`badge ${src?.color ?? 'badge-slate'}`}>{src?.label ?? alertCase.source}</span>
                        <span className={`badge ${SEV_COLOR[alertCase.severity] ?? 'badge-slate'}`}>{alertCase.severity}</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${sts?.bg} ${sts?.color}`}>
                            {sts?.label ?? alertCase.status}
                        </span>
                    </div>
                    <h2 className="text-lg font-bold text-foreground">{alertCase.title}</h2>
                    {alertCase.description && (
                        <p className="text-sm text-muted-foreground mt-1">{alertCase.description}</p>
                    )}
                </div>
                <div className="text-right text-xs text-muted-foreground shrink-0">
                    <p>Criado em {formatDate(alertCase.created_at)}</p>
                    {alertCase.created_by_name && <p className="mt-0.5">por <span className="font-medium">{alertCase.created_by_name}</span></p>}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Coluna principal */}
                <div className="lg:col-span-2 flex flex-col gap-5">
                    {/* Entidade */}
                    {alertCase.entity_name && (
                        <div className="card p-5">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Entidade Relacionada</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Building2 className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold text-foreground">{alertCase.entity_name}</p>
                                    {alertCase.entity_cnpj && (
                                        <p className="text-xs font-mono text-muted-foreground">{alertCase.entity_cnpj}</p>
                                    )}
                                </div>
                                {alertCase.entity_risk_level && alertCase.entity_risk_level !== 'UNKNOWN' && (
                                    <RiskBadge level={alertCase.entity_risk_level} score={alertCase.entity_risk_score} className="ml-auto" />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Evidências */}
                    <div className="card p-5">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Evidências</h3>
                        {hasEvidence ? (
                            <div className="bg-muted/40 rounded-xl border border-border p-4 font-mono text-xs overflow-x-auto">
                                <pre className="whitespace-pre-wrap text-foreground/80 leading-relaxed">
                                    {JSON.stringify(evidence, null, 2)}
                                </pre>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                <AlertTriangle className="w-8 h-8 opacity-20 mb-2" />
                                <p className="text-sm">Nenhuma evidência registrada</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Coluna lateral */}
                <div className="flex flex-col gap-5">
                    {/* Ações */}
                    <ActionPanel alertCase={alertCase} onUpdated={load} />

                    {/* Responsável */}
                    <div className="card p-5">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Responsável</h3>
                        {alertCase.assigned_to_name ? (
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <User className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{alertCase.assigned_to_name}</p>
                                    {alertCase.assigned_to_email && (
                                        <p className="text-xs text-muted-foreground">{alertCase.assigned_to_email}</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">Não atribuído</p>
                        )}
                    </div>

                    {/* Info card */}
                    <div className="card p-5 space-y-3">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Informações</h3>
                        {[
                            { label: 'ID do Caso', value: alertCase.id?.substring(0, 8) + '...' },
                            { label: 'Fonte', value: src?.label ?? alertCase.source },
                            { label: 'Criado em', value: formatDate(alertCase.created_at) },
                            ...(alertCase.resolved_at ? [{ label: 'Resolvido em', value: formatDate(alertCase.resolved_at) }] : []),
                        ].map(item => (
                            <div key={item.label} className="flex flex-col gap-0.5 border-l-2 border-muted pl-3">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{item.label}</span>
                                <span className="text-xs font-semibold text-foreground">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
