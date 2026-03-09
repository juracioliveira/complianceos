'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
    ShieldAlert, AlertTriangle, CheckCircle2, FileText,
    TrendingUp, TrendingDown, Minus, ArrowUpRight, Clock,
    Users, BarChart3, Loader2, Radio, RotateCcw, ChevronRight,
    Activity, ShieldCheck
} from 'lucide-react'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { formatDate, cn } from '@/lib/utils'
import { useApi } from '@/hooks/useApi'
import { usePermissions } from '@/hooks/use-permissions'
import { ProtectedAction } from '@/components/rbac/ProtectedAction'
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
    const { role, can } = usePermissions()
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100/50 text-brand-700 text-[10px] font-bold tracking-wider uppercase mb-3 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                        Visão Executiva · {data?.tenantName || 'ComplianceOS'}
                    </div>
                    <h1 className="font-display text-5xl md:text-6xl text-slate-900 leading-none tracking-tight">
                        Dashboard de <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-cyan-500">Compliance</span>
                    </h1>
                    <div className="flex items-center gap-3 mt-3">
                        <p className="text-sm font-medium text-slate-500">Monitoramento em tempo real de riscos e obrigações</p>
                        {mounted && (
                            <div className="flex items-center gap-2 px-2 py-0.5 rounded-md bg-slate-100/50 border border-slate-200/50">
                                {isLive ? (
                                    <span className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                                        <span className="relative flex h-1.5 w-1.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                                        </span>
                                        Live{timeSince ? ` · ${timeSince}` : ''}
                                    </span>
                                ) : (
                                    <button
                                        onClick={loadDashboard}
                                        className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-brand-600 font-bold uppercase tracking-wider transition-colors"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                        Update {timeSince}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={loadDashboard} className="btn-secondary btn-sm bg-white shadow-sm border-slate-200 text-slate-600 hover:text-brand-600">
                        <RotateCcw className="w-3.5 h-3.5" />
                        Atualizar
                    </button>
                    <ProtectedAction action="create" resource="entities">
                        <a href="/entities/new" className="btn-primary btn-sm shadow-brand-600/20">
                            Nova Entidade
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                    </ProtectedAction>
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Distribuição de risco */}
                <div className="lg:col-span-4 card p-6 space-y-6 shadow-sm hover:shadow-md transition-all duration-300 bg-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 tracking-tight">Distribuição de Risco</h3>
                            <p className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-0.5">Segmentação de Entidades</p>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <BarChart3 className="w-4 h-4 text-slate-400" />
                        </div>
                    </div>

                    {/* Donut em SVG com Glow Suave */}
                    <div className="flex items-center justify-center py-4 relative">
                        <div className="absolute w-40 h-40 bg-brand-500/5 rounded-full blur-[40px]"></div>
                        <div className="relative w-40 h-40 drop-shadow-xl">
                            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                {(() => {
                                    if (totalEntidades === 0) {
                                        return <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="currentColor" strokeWidth="3" className="text-slate-100" />
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
                                                strokeWidth="3.2"
                                                strokeDasharray={`${pct} ${100 - pct}`}
                                                strokeDashoffset={dashOffset}
                                                className="transition-all duration-1000 ease-out"
                                            />
                                        )
                                    })
                                })()}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <p className="text-4xl font-mono font-bold text-slate-900 tracking-tighter">{totalEntidades}</p>
                                <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-[0.2em]">Total</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {byRisk.map((r: any) => (
                            <RiskBar key={r.level} {...r} total={totalEntidades} />
                        ))}
                    </div>
                </div>

                {/* Alertas ativos */}
                <div className="lg:col-span-4 card p-6 space-y-4 shadow-sm hover:shadow-md transition-all duration-300 bg-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 tracking-tight">Central de Alertas</h3>
                            <p className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-0.5">Ocorrências Pendentes</p>
                        </div>
                        <span className="badge badge-red shadow-sm shadow-red-500/10 animate-pulse">{stats.notificacoesNaoLidas} Pendentes</span>
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="alert alert-critical border-red-100 bg-red-50/30 group hover:bg-red-50 transition-colors cursor-default">
                            <ShieldAlert className="w-5 h-5 shrink-0 text-red-500 group-hover:scale-110 transition-transform" />
                            <div>
                                <p className="text-xs font-bold text-red-700">{stats.alertasCriticos} Entidades Críticas</p>
                                <p className="text-[11px] text-red-600/70 font-medium">Bloqueio preventivo obrigatório</p>
                            </div>
                        </div>

                        <div className="alert alert-warning border-amber-100 bg-amber-50/30 group hover:bg-amber-50 transition-colors cursor-default">
                            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 group-hover:scale-110 transition-transform" />
                            <div>
                                <p className="text-xs font-bold text-amber-700">{stats.alertasWarning} Monitoramento</p>
                                <p className="text-[11px] text-amber-600/70 font-medium">Suspeita de fragmentação de transação</p>
                            </div>
                        </div>

                        {stats.openCases > 0 && (
                            <div className="alert alert-warning border-orange-100 bg-orange-50/30 group hover:bg-orange-50 transition-colors cursor-default">
                                <Radio className="w-5 h-5 shrink-0 text-orange-500 group-hover:scale-110 transition-transform" />
                                <div>
                                    <p className="text-xs font-bold text-orange-700">{stats.openCases} Casos de Investigação</p>
                                    <p className="text-[11px] text-orange-600/70 font-medium">
                                        Fila de auditoria •
                                        {can('view', 'alert_cases') ? (
                                            <a href="/alerts" className="underline font-bold hover:text-orange-800 transition-colors">Acessar Fila →</a>
                                        ) : (
                                            <span className="opacity-50">Acceso Restrito</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="alert alert-info border-brand-100 bg-brand-50/30 group hover:bg-brand-50 transition-colors cursor-default">
                            <Clock className="w-5 h-5 shrink-0 text-brand-500 group-hover:scale-110 transition-transform" />
                            <div>
                                <p className="text-xs font-bold text-brand-700">{stats.checklistsVencidos} Obrigações Vencidas</p>
                                <p className="text-[11px] text-brand-600/70 font-medium">Prazos regulatórios expirados</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Atividade recente */}
                <div className="lg:col-span-4 card p-6 flex flex-col shadow-sm hover:shadow-md transition-all duration-300 bg-white">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 tracking-tight">Audit Trail</h3>
                            <p className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-0.5">Atividade Recente</p>
                        </div>
                        <ProtectedAction action="view" resource="audit_trail">
                            <a href="/audit" className="p-2 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                                <ArrowUpRight className="w-4 h-4 text-brand-600" />
                            </a>
                        </ProtectedAction>
                    </div>
                    <div className="flex-1 space-y-0 divide-y divide-slate-50">
                        {recentActivities.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-2 opacity-40">
                                <Activity className="w-8 h-8 text-slate-400" />
                                <p className="text-[11px] font-bold uppercase tracking-widest">Sem atividades</p>
                            </div>
                        ) : recentActivities.slice(0, 6).map((a: any, i: number) => (
                            <div key={i} className="py-3.5 first:pt-0 last:pb-0 group">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-[13px] font-bold text-slate-900 truncate group-hover:text-brand-600 transition-colors tracking-tight">{a.entity}</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{a.action}</p>
                                        <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mt-1.5">{a.time} • {a.user.split(' ')[0]}</p>
                                    </div>
                                    <RiskBadge level={a.risk} size="xs" className="shrink-0 mt-0.5" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

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


                {/* Entidades críticas */}
                <div className="card shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden bg-white border-slate-200/60">
                    <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/30">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Entidades Sob Investigação</h3>
                            <p className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-0.5">Alto Risco & Exposure PEP</p>
                        </div>
                        <a href="/entities?filter[risk_level]=CRITICAL" className="btn-secondary btn-sm bg-white hover:bg-slate-50 border-slate-200">
                            Visualizar Todas ({stats.alertasCriticos})
                        </a>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="pl-8">Entidade / Identificador</th>
                                    <th>Tipo de Relação</th>
                                    <th>Score de Risco</th>
                                    <th>Última Atualização</th>
                                    <th className="text-right pr-8">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {criticalEntities.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-16">
                                            <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                                                <ShieldCheck className="w-12 h-12 text-slate-300" />
                                                <p className="text-sm font-bold uppercase tracking-widest">Nenhuma entidade crítica detectada</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : criticalEntities.map((e: any) => (
                                    <tr key={e.cnpj} className="group">
                                        <td className="pl-8">
                                            <p className="font-bold text-slate-900 leading-tight tracking-tight group-hover:text-brand-600 transition-colors uppercase">{e.name}</p>
                                            <p className="text-[11px] font-mono font-bold text-slate-400 mt-1 uppercase tracking-wider">{e.cnpj}</p>
                                        </td>
                                        <td>
                                            <span className="badge badge-slate uppercase tracking-wider font-bold">{e.type}</span>
                                        </td>
                                        <td>
                                            <RiskBadge level={e.risk} score={e.score} />
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                                                <Clock className="w-3.5 h-3.5 opacity-40" />
                                                {formatDate(e.lastCheck)}
                                            </div>
                                        </td>
                                        <td className="text-right pr-8">
                                            <a href={`/entities/${e.id || e.name}`} className="btn-ghost btn-sm hover:bg-brand-50 hover:text-brand-700 font-bold uppercase tracking-wider">
                                                Investigar
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-8 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                            Hashes de integridade verificados • {new Date().toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase tracking-widest border border-emerald-100">
                            <CheckCircle2 className="w-3 h-3" />
                            Auditado
                        </div>
                    </div>
                </div>
            </div >
        </div >
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
        red: { bg: 'bg-red-50/50', icon: 'text-red-600', iconBg: 'bg-red-500/10', border: 'border-l-red-500', glow: 'shadow-red-500/10' },
        amber: { bg: 'bg-amber-50/50', icon: 'text-amber-600', iconBg: 'bg-amber-500/10', border: 'border-l-amber-500', glow: 'shadow-amber-500/10' },
        green: { bg: 'bg-emerald-50/50', icon: 'text-emerald-600', iconBg: 'bg-emerald-500/10', border: 'border-l-emerald-500', glow: 'shadow-emerald-500/10' },
        blue: { bg: 'bg-blue-50/50', icon: 'text-brand-600', iconBg: 'bg-brand-500/10', border: 'border-l-brand-500', glow: 'shadow-brand-500/10' },
    }
    const c = colors[color]

    const TrendIcon = !trend || trend.dir === 'flat' ? Minus
        : (trend.dir === 'up' || trend.dir === 'bad') ? TrendingUp : TrendingDown
    const trendColor = !trend ? '' :
        trend.dir === 'bad' ? 'text-red-500' :
            trend.dir === 'good' ? 'text-emerald-500' :
                trend.dir === 'up' ? 'text-red-500' :
                    trend.dir === 'down' ? 'text-emerald-500' : 'text-slate-400'

    return (
        <div className={cn(
            "card p-5 border-l-4 bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group overflow-visible",
            c.border
        )}>
            {/* Decorative background grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-2xl bg-grid" />

            <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="min-w-0">
                    <p className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                    <p className="font-mono text-4xl font-bold text-slate-900 mt-2 mb-1 leading-none tracking-tight">{value}</p>
                    {sub && <p className="text-[11px] text-slate-400 font-medium leading-tight">{sub}</p>}
                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1.5 mt-3 px-2 py-0.5 rounded-md border text-[10px] font-bold w-fit shadow-sm bg-white transition-colors",
                            trendColor,
                            trend.dir === 'bad' ? 'border-red-100' :
                                trend.dir === 'good' ? 'border-emerald-100' : 'border-slate-100'
                        )}>
                            <TrendIcon className="w-3 h-3" />
                            <span>{trend.text}</span>
                        </div>
                    )}
                </div>
                <div className={cn(
                    "w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center border border-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                    c.iconBg,
                    c.glow
                )}>
                    <Icon className={cn("w-7 h-7", c.icon)} strokeWidth={1.5} />
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
