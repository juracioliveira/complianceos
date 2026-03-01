'use client'

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface RiskEvolutionChartProps {
    id: string
}

const data = [
    { date: 'Set', score: 45 },
    { date: 'Out', score: 52 },
    { date: 'Nov', score: 48 },
    { date: 'Dez', score: 65 },
    { date: 'Jan', score: 72 },
    { date: 'Fev', score: 78 },
]

export default function RiskEvolutionChart({ id }: RiskEvolutionChartProps) {
    return (
        <div className="card p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-lg">Evolução de Risco</h3>
                    <p className="text-sm text-muted-foreground">Variação do score nos últimos 6 meses</p>
                </div>

                <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border border-border">
                    <button className="px-3 py-1 text-xs font-bold rounded-md bg-white dark:bg-zinc-800 shadow-sm">6M</button>
                    <button className="px-3 py-1 text-xs font-bold rounded-md text-muted-foreground hover:bg-white/50 dark:hover:bg-zinc-800/50">1Y</button>
                    <button className="px-3 py-1 text-xs font-bold rounded-md text-muted-foreground hover:bg-white/50 dark:hover:bg-zinc-800/50">ALL</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                <SummaryItem
                    label="Início do Período"
                    value="45 pts"
                    sub="Baixo"
                />
                <SummaryItem
                    label="Máximo Atingido"
                    value="82 pts"
                    sub="Crítico"
                    variant="destructive"
                />
                <SummaryItem
                    label="Tendência"
                    value="+33 pts"
                    sub="Crescente"
                    icon={<TrendingUp className="w-4 h-4 text-red-500" />}
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
                        <YAxis
                            hide={true}
                            domain={[0, 100]}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-popover border border-border p-3 rounded-lg shadow-xl animate-in fade-in zoom-in-95 fill-mode-forwards">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{payload[0]?.payload?.date}</p>
                                            <p className="text-xl font-bold text-foreground">{payload[0]?.value} <span className="text-xs font-medium text-muted-foreground">pts</span></p>
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
    label: string,
    value: string,
    sub: string,
    icon?: React.ReactNode,
    variant?: 'destructive'
}) {
    return (
        <div className="p-4 rounded-xl border border-border/50 bg-muted/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
            <div className="flex items-center gap-2">
                <span className={`text-xl font-bold ${variant === 'destructive' ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                    {value}
                </span>
                {icon}
            </div>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">{sub}</p>
        </div>
    )
}
