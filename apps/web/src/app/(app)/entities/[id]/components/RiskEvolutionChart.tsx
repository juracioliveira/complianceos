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

import { cn } from '@/lib/utils'

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
            <div className="card p-12 flex flex-col items-center justify-center gap-4 text-slate-400 min-h-[400px] bg-slate-50/20">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Processando séries temporais...</span>
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <div className="card p-12 flex flex-col items-center justify-center text-slate-400 min-h-[300px] gap-4 bg-slate-50/20">
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-inner">
                    <Minus className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest">Sem histórico de variação</p>
            </div>
        )
    }

    return (
        <div className="card p-8 border-slate-200/60 shadow-xl bg-white relative overflow-hidden group">
            {/* Background Grid Accent */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-grid" />

            <div className="relative z-10 flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-display text-2xl text-slate-900 tracking-tight">Evolução de <span className="text-brand-600">Conformidade</span></h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Série histórica de exposição ao risco (12 meses)</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <SummaryItem label="Abertura" value={first != null ? `${first}` : '—'} sub={data[0]?.riskLevel ?? '—'} />
                    <SummaryItem
                        label="Pico de Exposição"
                        value={max != null ? `${max}` : '—'}
                        sub="Maior Score"
                        variant={max != null && max >= 70 ? 'destructive' : undefined}
                    />
                    <SummaryItem
                        label="Volatilidade"
                        value={trend != null ? `${trend > 0 ? '+' : ''}${trend}` : '—'}
                        sub={trend != null ? (trend > 0 ? 'Exposição ↑' : trend < 0 ? 'Melhoria ↓' : 'Inalterado') : '—'}
                        icon={trend != null && trend > 5 ? <TrendingUp className="w-4 h-4 text-red-500" /> : trend != null && trend < -5 ? <TrendingDown className="w-4 h-4 text-emerald-500" /> : <Minus className="w-4 h-4 text-slate-400" />}
                    />
                </div>

                <div className="h-[280px] w-full mt-4 -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0F172A" stopOpacity={0.08} />
                                    <stop offset="95%" stopColor="#0F172A" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 700 }}
                                dy={15}
                            />
                            <YAxis hide domain={[0, 100]} />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload?.length) {
                                        const d = payload[0]?.payload
                                        return (
                                            <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-xl shadow-2xl">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-50 pb-2">{d?.date}</p>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-3xl font-display text-slate-900">{d?.score}</span>
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest leading-tight" style={{ color: RISK_COLORS[d?.riskLevel] ?? '#94A3B8' }}>{d?.riskLevel}</p>
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Índice Geral</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="score"
                                stroke="#0F172A"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorScore)"
                                animationDuration={2000}
                                dot={{ fill: '#0F172A', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#0055FF' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}

function SummaryItem({ label, value, sub, icon, variant }: {
    label: string; value: string; sub: string; icon?: React.ReactNode; variant?: 'destructive' | undefined
}) {
    return (
        <div className="p-5 rounded-2xl border border-slate-200/60 bg-slate-50/50 shadow-inner group/item hover:bg-white hover:shadow-xl transition-all duration-500">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{label}</p>
            <div className="flex items-end gap-2">
                <span className={cn(
                    "text-3xl font-display leading-none",
                    variant === 'destructive' ? 'text-red-600' : 'text-slate-900'
                )}>{value}</span>
                {icon}
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">{sub}</p>
        </div>
    )
}
