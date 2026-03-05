'use client'

import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react'
import { useApi } from '@/hooks/useApi'

interface RiskEvolutionChartProps {
    id: string
}

const RISK_COLORS: Record<string, string> = {
    LOW: '#16A34A',
    MEDIUM: '#D97706',
    HIGH: '#DC2626',
    CRITICAL: '#7C3AED',
    UNKNOWN: '#94A3B8',
}

const MONTH_FORMAT = new Intl.DateTimeFormat('pt-BR', { month: 'short' })

export default function RiskEvolutionChart({ id }: RiskEvolutionChartProps) {
    const { fetchWithAuth } = useApi()
    const [data, setData] = useState<{ date: string; score: number; riskLevel: string }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!id) return
        setLoading(true)
        fetchWithAuth(`/v1/entities/${id}/risk-assessments?limit=12`)
            .then((res) => {
                const assessments: any[] = res?.data ?? []
                // Sort oldest→newest and map to chart format
                const sorted = [...assessments].sort(
                    (a, b) => new Date(a.calculatedAt).getTime() - new Date(b.calculatedAt).getTime()
                )
                setData(
                    sorted.map((a) => ({
                        date: MONTH_FORMAT.format(new Date(a.calculatedAt)),
                        score: a.score,
                        riskLevel: a.riskLevel,
                    }))
                )
            })
            .catch((err) => console.error('RiskEvolutionChart fetch error', err))
            .finally(() => setLoading(false))
    }, [id, fetchWithAuth])

    const first = data[0]?.score ?? null
    const last = data[data.length - 1]?.score ?? null
    const max = data.length ? Math.max(...data.map(d => d.score)) : null
    const trend = last != null && first != null ? last - first : null

    if (loading) {
        return (
            <div className="card p-6 flex items-center gap-3 text-muted-foreground h-[400px]">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Carregando histórico de risco...</span>
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <div className="card p-6 flex flex-col items-center justify-center text-muted-foreground h-[300px] gap-3">
                <Minus className="w-8 h-8 opacity-20" />
                <p className="text-sm">Nenhuma avaliação de risco registrada ainda.</p>
            </div>
        )
    }

    return (
        <div className="card p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-lg">Evolução de Risco</h3>
                    <p className="text-sm text-muted-foreground">Variação do score nos últimos {data.length} meses</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                <SummaryItem label="Score Inicial" value={first != null ? `${first} pts` : '—'} sub={data[0]?.riskLevel ?? '—'} />
                <SummaryItem label="Score Máximo" value={max != null ? `${max} pts` : '—'} sub="Pior ponto" variant={max != null && max >= 70 ? 'destructive' : undefined} />
                <SummaryItem
                    label="Tendência"
                    value={trend != null ? `${trend > 0 ? '+' : ''}${trend} pts` : '—'}
                    sub={trend != null ? (trend > 0 ? 'Crescente ↑' : trend < 0 ? 'Redução ↓' : 'Estável') : '—'}
                    icon={trend != null && trend > 5 ? <TrendingUp className="w-4 h-4 text-red-500" /> : trend != null && trend < -5 ? <TrendingDown className="w-4 h-4 text-emerald-500" /> : <Minus className="w-4 h-4 text-muted-foreground" />}
                />
            </div>

            <div className="h-[280px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }}
                            dy={10}
                        />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload?.length) {
                                    const d = payload[0]?.payload
                                    return (
                                        <div className="bg-popover border border-border p-3 rounded-lg shadow-xl">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{d?.date}</p>
                                            <p className="text-xl font-bold text-foreground">{d?.score} <span className="text-xs font-medium text-muted-foreground">pts</span></p>
                                            <p className="text-xs font-bold mt-1" style={{ color: RISK_COLORS[d?.riskLevel] ?? '#94A3B8' }}>{d?.riskLevel}</p>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="score"
                            stroke="hsl(var(--primary))"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorScore)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

function SummaryItem({ label, value, sub, icon, variant }: {
    label: string; value: string; sub: string; icon?: React.ReactNode; variant?: 'destructive' | undefined
}) {
    return (
        <div className="p-4 rounded-xl border border-border/50 bg-muted/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
            <div className="flex items-center gap-2">
                <span className={`text-xl font-bold ${variant === 'destructive' ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>{value}</span>
                {icon}
            </div>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">{sub}</p>
        </div>
    )
}
