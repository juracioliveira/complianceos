'use client'

import { useEffect, useState } from 'react'
import {
    ShieldAlert, AlertTriangle, CheckCircle2, FileText,
    TrendingUp, TrendingDown, Minus, ArrowUpRight, Clock,
    Users, BarChart3, Loader2
} from 'lucide-react'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { formatDate } from '@/lib/utils'
import { useApi } from '@/hooks/useApi'

export default function DashboardPage() {
    const { fetchWithAuth } = useApi()
    const [isLoading, setIsLoading] = useState(true)
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        async function loadDashboard() {
            try {
                const res = await fetchWithAuth('/v1/dashboard/summary')
                setData(res.data)
            } catch (err) {
                console.error('Failed to load dashboard', err)
            } finally {
                setIsLoading(false)
            }
        }
        loadDashboard()
    }, [fetchWithAuth])

    if (isLoading || !data) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    const { stats, byRisk, recentActivities, criticalEntities } = data
    const totalEntidades = byRisk.reduce((a: number, b: any) => a + b.count, 0)
    const today = new Date()

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">

            {/* Page header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard de Compliance</h1>
                    <p className="page-subtitle">
                        Visão executiva do programa de conformidade • Atualizado {today.toLocaleDateString('pt-BR')} às {today.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <a href="/entities?filter[risk_level]=CRITICAL" className="btn-secondary btn-sm flex gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-red-600 dark:text-red-400 font-semibold">{stats.alertasCriticos} críticos</span>
                    <ArrowUpRight className="w-3 h-3" />
                </a>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    label="Entidades Risco Alto+"
                    value={stats.entidadesRiscoAlto}
                    sub={`de ${stats.totalEntidades} entidades ativas`}
                    icon={ShieldAlert}
                    color="red"
                    trend={{ dir: 'up', text: '+3 desde a semana passada' }}
                />
                <StatCard
                    label="Checklists Vencidos"
                    value={stats.checklistsVencidos}
                    sub={`${stats.checklistsVencendoEm30Dias} vencem em 30 dias`}
                    icon={AlertTriangle}
                    color="amber"
                    trend={{ dir: 'flat', text: 'Estável vs mês anterior' }}
                />
                <StatCard
                    label="Concluídos no Mês"
                    value={stats.checklistsConcluidos}
                    sub={`${stats.checklistsEmAndamento} em andamento agora`}
                    icon={CheckCircle2}
                    color="green"
                    trend={{ dir: 'down', text: '+12 vs mês anterior' }}
                />
                <StatCard
                    label="Documentos Gerados"
                    value={stats.documentosGerados}
                    sub={`${stats.documentosExpirando} expiram em 60 dias`}
                    icon={FileText}
                    color="blue"
                />
            </div>

            {/* Linha do meio: Risk chart + Alertas + Atividade recente */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Distribuição de risco */}
                <div className="card p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">Distribuição de Risco</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{totalEntidades} entidades ativas</p>
                        </div>
                        <BarChart3 className="w-4 h-4 text-muted-foreground" />
                    </div>

                    {/* Donut simples em CSS */}
                    <div className="flex items-center justify-center py-2">
                        <div className="relative w-28 h-28">
                            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                {(() => {
                                    let accumulated = 0
                                    return byRisk.map(({ count, color }: { count: number; color: string }) => {
                                        const pct = (count / totalEntidades) * 100
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

                    {/* Legenda */}
                    <div className="space-y-2">
                        {byRisk.map((r: any) => (
                            <RiskBar key={r.level} {...r} total={totalEntidades} />
                        ))}
                    </div>
                </div>

                {/* Alertas ativos */}
                <div className="card p-5 space-y-3">
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

                    <div className="alert alert-info">
                        <FileText className="w-4 h-4 shrink-0 mt-px" />
                        <div>
                            <p className="text-xs font-semibold">{stats.documentosExpirando} Documentos Expirando</p>
                            <p className="text-[11px] opacity-80">RAT e DPIAs em 60 dias</p>
                        </div>
                    </div>
                </div>

                {/* Atividade recente */}
                <div className="card p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-foreground">Atividade Recente</h3>
                        <a href="/audit" className="text-xs text-primary hover:underline">Ver audit trail →</a>
                    </div>
                    <div className="flex-1 space-y-0 divide-y divide-border/60">
                        {recentActivities.map((a: any, i: number) => (
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
            <div className="card">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
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
                            {criticalEntities.map((e: any) => (
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

// Componente KPI card
function StatCard({
    label, value, sub, icon: Icon, color, trend,
}: {
    label: string
    value: number | string
    sub?: string
    icon: React.ElementType
    color: 'red' | 'amber' | 'green' | 'blue'
    trend?: { dir: 'up' | 'down' | 'flat'; text: string }
}) {
    const colors = {
        red: { bg: 'bg-red-50 dark:bg-red-950/40', icon: 'text-red-600 dark:text-red-400', iconBg: 'bg-red-100 dark:bg-red-900/60' },
        amber: { bg: 'bg-amber-50 dark:bg-amber-950/40', icon: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-100 dark:bg-amber-900/60' },
        green: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', icon: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-100 dark:bg-emerald-900/60' },
        blue: { bg: 'bg-blue-50 dark:bg-blue-950/40', icon: 'text-blue-600 dark:text-blue-400', iconBg: 'bg-blue-100 dark:bg-blue-900/60' },
    }
    const c = colors[color]

    const TrendIcon = trend?.dir === 'up' ? TrendingUp : trend?.dir === 'down' ? TrendingDown : Minus
    const trendColor = trend?.dir === 'up' ? 'text-red-500' : trend?.dir === 'down' ? 'text-emerald-500' : 'text-muted-foreground'

    return (
        <div className={`stat-card border-l-2 ${color === 'red' ? 'border-l-red-500' : color === 'amber' ? 'border-l-amber-500' : color === 'green' ? 'border-l-emerald-500' : 'border-l-blue-500'}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="stat-label">{label}</p>
                    <p className="stat-value">{value}</p>
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

// Barra horizontal de risco
function RiskBar({ level, count, total, color, label }: { level: string; count: number; total: number; color: string; label: string }) {
    const pct = total > 0 ? (count / total) * 100 : 0
    return (
        <div className="flex items-center gap-3">
            <span className="w-24 text-xs text-muted-foreground text-right shrink-0">{label}</span>
            <div className="flex-1 progress-bar">
                <div
                    className="progress-fill"
                    style={{ width: `${pct}%`, background: color }}
                />
            </div>
            <span className="w-6 text-xs font-semibold text-foreground text-right shrink-0">{count}</span>
        </div>
    )
}
