'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
    ShieldAlert, AlertTriangle, CheckCircle2, FileText,
    TrendingUp, TrendingDown, Minus, ArrowUpRight, Clock,
    Users, BarChart3, Loader2, Radio, RotateCcw
} from 'lucide-react'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { formatDate } from '@/lib/utils'
import { useApi } from '@/hooks/useApi'
import React from 'react'

// ─── Helpers de Trend ──────────────────────────────────────────────────────────
function buildTrendText(trend: { delta: number; dir: string; pct: number | null } | undefined, upIsBad = false) {
    if (!trend || trend.dir === 'flat' || trend.delta === 0) return { text: 'Estável', dir: 'flat' as const }
    const sign = trend.delta > 0 ? '+' : ''
    const pctText = trend.pct !== null ? ` (${trend.pct}%)` : ''
    return {
        text: `${sign}${trend.delta}${pctText} vs período anterior`,
        dir: (upIsBad ? (trend.dir === 'up' ? 'bad' : 'good') : trend.dir) as 'up' | 'down' | 'flat' | 'bad' | 'good',
    }
}

// ─── Componente Principal ──────────────────────────────────────────────────────
export default function DashboardPage() {
    const { fetchWithAuth } = useApi()
    const [isLoading, setIsLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [isLive, setIsLive] = useState(false)
    const [timeSince, setTimeSince] = useState('')
    const [mounted, setMounted] = useState(false)
    const eventSourceRef = useRef<EventSource | null>(null)

    // Carregamento inicial via REST
    const loadDashboard = useCallback(async () => {
        try {
            const res = await fetchWithAuth('/v1/dashboard/summary')
            setData(res.data)
            setLastUpdated(new Date())
        } catch (err) {
            console.error('Failed to load dashboard', err)
        } finally {
            setIsLoading(false)
        }
    }, [fetchWithAuth])

    // SSE para updates em tempo real
    useEffect(() => {
        setMounted(true)
        loadDashboard()

        // Conectar SSE após carregamento inicial
        const connectSSE = () => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
            if (!token) return

            const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
            const url = `${apiBase}/v1/dashboard/stream`

            const es = new EventSource(url + `?token=${encodeURIComponent(token)}`)
            eventSourceRef.current = es

            es.addEventListener('connected', () => {
                setIsLive(true)
            })

            es.addEventListener('summary', (e) => {
                try {
                    const fresh = JSON.parse(e.data)
                    setData(fresh)
                    setLastUpdated(new Date())
                } catch { /* ignora */ }
            })

            es.addEventListener('heartbeat', () => {
                setIsLive(true)
            })

            es.onerror = () => {
                setIsLive(false)
                es.close()
                // Reconecta em 15s
                setTimeout(connectSSE, 15_000)
            }
        }

        const timeout = setTimeout(connectSSE, 1000)

        return () => {
            clearTimeout(timeout)
            eventSourceRef.current?.close()
        }
    }, [loadDashboard])

    // Contador "há X segundos"
    useEffect(() => {
        const interval = setInterval(() => {
            if (!lastUpdated) return
            const diff = Math.floor((Date.now() - lastUpdated.getTime()) / 1000)
            if (diff < 60) setTimeSince(`há ${diff}s`)
            else if (diff < 3600) setTimeSince(`há ${Math.floor(diff / 60)}min`)
            else setTimeSince(`há ${Math.floor(diff / 3600)}h`)
        }, 5000)
        return () => clearInterval(interval)
    }, [lastUpdated])

    if (isLoading || !data) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    const stats = {
        alertasCriticos: data.alerts?.critical ?? 0,
        entidadesRiscoAlto: (data.entities?.byRisk?.['HIGH'] ?? 0) + (data.entities?.byRisk?.['CRITICAL'] ?? 0),
        totalEntidades: data.entities?.total ?? 0,
        checklistsVencidos: data.checklists?.overdue ?? 0,
        checklistsVencendoEm30Dias: data.checklists?.dueSoon ?? 0,
        checklistsConcluidos: data.checklists?.completedThisMonth ?? 0,
        checklistsEmAndamento: data.checklists?.inProgress ?? 0,
        documentosGerados: data.documents?.generatedThisMonth ?? 0,
        documentosExpirando: data.documents?.expiringSoon ?? 0,
        notificacoesNaoLidas: data.alerts?.unread ?? 0,
        alertasWarning: data.alerts?.warning ?? 0,
        openCases: data.alerts?.openCases ?? 0,
        criticalCases: data.alerts?.criticalCases ?? 0,
    }

    const byRiskRaw = data.entities?.byRisk ?? {}
    const byRisk = [
        { level: 'CRITICAL', label: 'Crítico', count: byRiskRaw['CRITICAL'] ?? 0, color: '#ef4444' },
        { level: 'HIGH', label: 'Alto', count: byRiskRaw['HIGH'] ?? 0, color: '#f97316' },
        { level: 'MEDIUM', label: 'Médio', count: byRiskRaw['MEDIUM'] ?? 0, color: '#eab308' },
        { level: 'LOW', label: 'Baixo', count: byRiskRaw['LOW'] ?? 0, color: '#22c55e' },
    ]

    const recentActivities = data.recentActivities ?? []
    const criticalEntities = data.criticalEntities ?? []
    const totalEntidades = stats.totalEntidades || byRisk.reduce((a, b) => a + b.count, 0)

    // Trends reais da API
    const entityTrend = buildTrendText(data.entities?.trend, false)
    const checklistTrend = buildTrendText(data.checklists?.trend, false)
    const alertsTrend = buildTrendText(data.alerts?.trend, true)

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">

            {/* Page header com live indicator */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="font-display text-4xl md:text-5xl text-slate-900 mb-2 leading-[1.1] tracking-tight">
                        Dashboard de <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-cyan-500">Compliance</span>
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm font-medium text-slate-500 flex items-center">Visão executiva do programa de conformidade</p>
                        {mounted && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs text-muted-foreground">•</span>
                                {isLive ? (
                                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                        </span>
                                        Ao vivo{timeSince ? ` · atualizado ${timeSince}` : ''}
                                    </span>
                                ) : (
                                    <button
                                        onClick={loadDashboard}
                                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                        {timeSince ? `Atualizado ${timeSince}` : 'Atualizar'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {stats.openCases > 0 && (
                        <a href="/alerts" className="btn-secondary btn-sm flex gap-1.5">
                            <Radio className="w-3.5 h-3.5 text-orange-500" />
                            <span className="text-orange-600 font-semibold">{stats.openCases} casos abertos</span>
                            <ArrowUpRight className="w-3 h-3" />
                        </a>
                    )}
                    <a href="/entities?filter[risk_level]=CRITICAL" className="btn-secondary btn-sm flex gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-red-600 font-semibold">{stats.alertasCriticos} críticos</span>
                        <ArrowUpRight className="w-3 h-3" />
                    </a>
                </div>
            </div>

            {/* KPI Row — 4 cards com trend real */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    label="Entidades Risco Alto+"
                    value={stats.entidadesRiscoAlto}
                    sub={`de ${stats.totalEntidades} entidades ativas`}
                    icon={ShieldAlert}
                    color="red"
                    trend={{ dir: entityTrend.dir as any, text: entityTrend.text }}
                />
                <StatCard
                    label="Checklists Vencidos"
                    value={stats.checklistsVencidos}
                    sub={`${stats.checklistsVencendoEm30Dias} vencem em 30 dias`}
                    icon={AlertTriangle}
                    color="amber"
                    trend={{ dir: checklistTrend.dir as any, text: checklistTrend.text }}
                />
                <StatCard
                    label="Concluídos no Mês"
                    value={stats.checklistsConcluidos}
                    sub={`${stats.checklistsEmAndamento} em andamento agora`}
                    icon={CheckCircle2}
                    color="green"
                    trend={{ dir: checklistTrend.dir as any, text: checklistTrend.text }}
                />
                <StatCard
                    label="Alertas em Aberto"
                    value={stats.openCases}
                    sub={`${stats.criticalCases} críticos · ${stats.documentosExpirando} docs expirando`}
                    icon={Radio}
                    color="blue"
                    trend={{ dir: alertsTrend.dir as any, text: alertsTrend.text }}
                />
            </div>

            {/* Linha do meio: Risk chart + Alertas + Atividade recente */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Distribuição de risco */}
                <div className="card p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">Distribuição de Risco</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{totalEntidades} entidades ativas</p>
                        </div>
                        <BarChart3 className="w-4 h-4 text-muted-foreground" />
                    </div>

                    {/* Donut em SVG com Glow */}
                    <div className="flex items-center justify-center py-2 relative">
                        <div className="absolute inset-0 bg-brand-500/5 rounded-full blur-2xl"></div>
                        <div className="relative w-32 h-32 drop-shadow-md">
                            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                {(() => {
                                    if (totalEntidades === 0) {
                                        return <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="currentColor" strokeWidth="3.5" className="text-muted/20" />
                                    }
                                    let accumulated = 0
                                    return byRisk.map(({ count, color }: { count: number; color: string }) => {
                                        const pct = (count / totalEntidades) * 100
                                        if (pct === 0) return null
                                        const dashOffset = 100 - accumulated
                                        accumulated += pct
                                        return (
                                            <circle
                                                key={color}
                                                cx="18" cy="18" r="15.9155"
                                                fill="transparent"
                                                stroke={color}
                                                strokeWidth="3.5"
                                                strokeDasharray={`${pct} ${100 - pct}`}
                                                strokeDashoffset={dashOffset}
                                                strokeLinecap="butt"
                                            />
                                        )
                                    })
                                })()}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <p className="text-xl font-bold text-foreground">{totalEntidades}</p>
                                <p className="text-[10px] text-muted-foreground">total</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {byRisk.map((r: any) => (
                            <RiskBar key={r.level} {...r} total={totalEntidades} />
                        ))}
                    </div>
                </div>

                {/* Alertas ativos */}
                <div className="card p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">Alertas Ativos</h3>
                        <span className="badge badge-red">{stats.notificacoesNaoLidas} não lidas</span>
                    </div>

                    <div className="alert alert-critical">
                        <ShieldAlert className="w-4 h-4 shrink-0 mt-px" />
                        <div>
                            <p className="text-xs font-semibold">{stats.alertasCriticos} Entidades Críticas</p>
                            <p className="text-[11px] opacity-80">Requerem ação imediata do CCO</p>
                        </div>
                    </div>

                    <div className="alert alert-warning">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-px" />
                        <div>
                            <p className="text-xs font-semibold">{stats.alertasWarning} Alertas de Atenção</p>
                            <p className="text-[11px] opacity-80">Monitoramento preventivo</p>
                        </div>
                    </div>

                    <div className="alert alert-info">
                        <Clock className="w-4 h-4 shrink-0 mt-px" />
                        <div>
                            <p className="text-xs font-semibold">{stats.checklistsVencidos} Checklists Vencidos</p>
                            <p className="text-[11px] opacity-80">Aguardando revisão do analista</p>
                        </div>
                    </div>

                    {stats.openCases > 0 && (
                        <div className="alert alert-warning">
                            <Radio className="w-4 h-4 shrink-0 mt-px" />
                            <div>
                                <p className="text-xs font-semibold">{stats.openCases} Casos de Alerta em Aberto</p>
                                <p className="text-[11px] opacity-80">
                                    {stats.criticalCases} críticos aguardando investigação
                                    {' · '}
                                    <a href="/alerts" className="underline hover:no-underline">Ver fila →</a>
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="alert alert-info">
                        <FileText className="w-4 h-4 shrink-0 mt-px" />
                        <div>
                            <p className="text-xs font-semibold">{stats.documentosExpirando} Documentos Expirando</p>
                            <p className="text-[11px] opacity-80">RAT e DPIAs em 60 dias</p>
                        </div>
                    </div>
                </div>

                {/* Atividade recente */}
                <div className="card p-5 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-foreground">Atividade Recente</h3>
                        <a href="/audit" className="text-xs text-primary hover:underline">Ver audit trail →</a>
                    </div>
                    <div className="flex-1 space-y-0 divide-y divide-border/60">
                        {recentActivities.length === 0 ? (
                            <p className="text-xs text-muted-foreground py-4 text-center">Nenhuma atividade recente</p>
                        ) : recentActivities.map((a: any, i: number) => (
                            <div key={i} className="py-3 first:pt-0 last:pb-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-foreground truncate">{a.entity}</p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{a.action}</p>
                                        <p className="text-[10px] text-muted-foreground/70 mt-1">{a.user} · {a.time}</p>
                                    </div>
                                    <RiskBadge level={a.risk} size="xs" className="shrink-0 mt-0.5" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Entidades críticas */}
            <div className="card shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-slate-50/50">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Entidades com Risco Crítico</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Último checklist & score de risco</p>
                    </div>
                    <a href="/entities?filter[risk_level]=CRITICAL" className="btn-secondary btn-sm">
                        Ver todas ({stats.alertasCriticos})
                    </a>
                </div>
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Entidade</th>
                                <th>Tipo</th>
                                <th>Risco</th>
                                <th>Último checklist</th>
                                <th className="text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {criticalEntities.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center text-xs text-muted-foreground py-6">
                                        Nenhuma entidade com risco crítico
                                    </td>
                                </tr>
                            ) : criticalEntities.map((e: any) => (
                                <tr key={e.cnpj}>
                                    <td>
                                        <p className="font-medium text-foreground">{e.name}</p>
                                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{e.cnpj}</p>
                                    </td>
                                    <td>
                                        <span className="badge badge-slate">{e.type}</span>
                                    </td>
                                    <td>
                                        <RiskBadge level={e.risk} score={e.score} />
                                    </td>
                                    <td className="text-muted-foreground text-xs">
                                        {formatDate(e.lastCheck)}
                                    </td>
                                    <td className="text-right">
                                        <a href={`/entities/${e.name}`} className="btn-ghost btn-sm text-primary">
                                            Detalhe
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

// ─── Componente KPI card ───────────────────────────────────────────────────────
function StatCard({
    label, value, sub, icon: Icon, color, trend,
}: {
    label: string
    value: number | string
    sub?: string
    icon: React.ElementType
    color: 'red' | 'amber' | 'green' | 'blue'
    trend?: { dir: 'up' | 'down' | 'flat' | 'bad' | 'good'; text: string }
}) {
    const colors = {
        red: { bg: 'bg-red-50', icon: 'text-red-600', iconBg: 'bg-red-100' },
        amber: { bg: 'bg-amber-50', icon: 'text-amber-600', iconBg: 'bg-amber-100' },
        green: { bg: 'bg-emerald-50', icon: 'text-emerald-600', iconBg: 'bg-emerald-100' },
        blue: { bg: 'bg-blue-50', icon: 'text-blue-600', iconBg: 'bg-blue-100' },
    }
    const c = colors[color]

    const TrendIcon = !trend || trend.dir === 'flat' ? Minus
        : (trend.dir === 'up' || trend.dir === 'bad') ? TrendingUp : TrendingDown
    const trendColor = !trend ? '' :
        trend.dir === 'bad' ? 'text-red-500' :
            trend.dir === 'good' ? 'text-emerald-500' :
                trend.dir === 'up' ? 'text-red-500' :
                    trend.dir === 'down' ? 'text-emerald-500' : 'text-muted-foreground'

    return (
        <div className={`stat-card border-l-2 bg-white ${color === 'red' ? 'border-l-red-500 shadow-sm shadow-red-500/5' : color === 'amber' ? 'border-l-amber-500 shadow-sm shadow-amber-500/5' : color === 'green' ? 'border-l-emerald-500 shadow-sm shadow-emerald-500/5' : 'border-l-blue-500 shadow-sm shadow-blue-500/5'} hover:scale-[1.02] transition-transform`}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="stat-label text-slate-500">{label}</p>
                    <p className="font-display text-4xl text-slate-900 mt-2 mb-1 leading-none">{value}</p>
                    {sub && <p className="stat-sub">{sub}</p>}
                    {trend && (
                        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendColor}`}>
                            <TrendIcon className="w-3 h-3" />
                            <span>{trend.text}</span>
                        </div>
                    )}
                </div>
                <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${c.iconBg}`}>
                    <Icon className={`w-5 h-5 ${c.icon}`} />
                </div>
            </div>
        </div>
    )
}

// ─── Barra horizontal de risco ─────────────────────────────────────────────────
function RiskBar({ level, count, total, color, label }: { level: string; count: number; total: number; color: string; label: string }) {
    const pct = total > 0 ? (count / total) * 100 : 0
    return (
        <div className="flex items-center gap-3">
            <span className="w-24 text-xs text-muted-foreground text-right shrink-0">{label}</span>
            <div className="flex-1 progress-bar">
                <div
                    className="progress-fill transition-all duration-700"
                    style={{ width: `${pct}%`, background: color }}
                />
            </div>
            <span className="w-6 text-xs font-semibold text-foreground text-right shrink-0">{count}</span>
        </div>
    )
}
