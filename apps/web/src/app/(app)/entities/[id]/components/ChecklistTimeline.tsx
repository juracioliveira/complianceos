'use client'

import { CheckCircle2, Clock, AlertCircle, FileText, ChevronRight } from 'lucide-react'
import { RiskBadge } from '@/components/ui/RiskBadge'

interface ChecklistTimelineProps {
    id: string
    limit?: number
    title?: string
    showFilters?: boolean
}

export default function ChecklistTimeline({ id, limit, title, showFilters }: ChecklistTimelineProps) {
    // Mock data
    const checklists = [
        {
            id: 'chk_1',
            template: 'Due Diligence PLD/FT',
            date: '28/02/2026',
            status: 'COMPLETED',
            score: 82,
            risk: 'CRITICAL',
            executor: 'Maria Silva'
        },
        {
            id: 'chk_2',
            template: 'Revisão LGPD - RAT',
            date: '15/01/2026',
            status: 'COMPLETED',
            score: 12,
            risk: 'LOW',
            executor: 'João Costa'
        },
        {
            id: 'chk_3',
            template: 'Avaliação Anticorrupção',
            date: '10/12/2025',
            status: 'COMPLETED',
            score: 45,
            risk: 'MEDIUM',
            executor: 'Sistema'
        },
        {
            id: 'chk_4',
            template: 'Conheça seu Parceiro (KYP)',
            date: '05/11/2025',
            status: 'IN_PROGRESS',
            score: 0,
            risk: 'UNKNOWN',
            executor: 'Maria Silva'
        }
    ].slice(0, limit || 10)

    return (
        <div className={`card ${title ? 'p-6' : 'p-0'}`}>
            {title && (
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">{title}</h3>
                    <button className="text-xs font-bold text-primary hover:underline">Ver todos</button>
                </div>
            )}

            {showFilters && (
                <div className="p-4 border-b border-border flex items-center gap-4 bg-muted/10">
                    <input
                        type="text"
                        placeholder="Buscar por template..."
                        className="input-field max-w-xs"
                    />
                    <select className="input-field max-w-[150px]">
                        <option>Todos Status</option>
                        <option>Concluído</option>
                        <option>Em Aberto</option>
                    </select>
                </div>
            )}

            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-[21px] top-6 bottom-6 w-px bg-border hidden md:block" />

                <div className="flex flex-col gap-4">
                    {checklists.map((item, idx) => (
                        <div key={item.id} className="group relative flex items-start gap-4 p-3 md:p-4 rounded-xl hover:bg-muted/30 transition-all cursor-pointer">
                            {/* Timeline Dot */}
                            <div className={`
                relative z-10 w-11 h-11 rounded-full border-4 border-background flex items-center justify-center shrink-0 hidden md:flex
                ${item.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}
              `}>
                                {item.status === 'COMPLETED' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                            </div>

                            <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                                            {item.template}
                                        </span>
                                        {item.status === 'IN_PROGRESS' && (
                                            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase">
                                                Em andamento
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                                        <span>{item.date}</span>
                                        <span className="w-1 h-1 rounded-full bg-border" />
                                        <span>Executor: {item.executor}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <RiskBadge
                                        level={item.risk as any}
                                        score={item.score}
                                        size="xs"
                                    />
                                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
