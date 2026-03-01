import { cn } from '@/lib/utils'

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN'

const RISK_CONFIG: Record<string, { cls: string; dot: string; label: string }> = {
    LOW: { cls: 'risk-badge risk-low', dot: 'bg-emerald-500', label: 'Baixo' },
    MEDIUM: { cls: 'risk-badge risk-medium', dot: 'bg-amber-500', label: 'Médio' },
    HIGH: { cls: 'risk-badge risk-high', dot: 'bg-orange-500', label: 'Alto' },
    CRITICAL: { cls: 'risk-badge risk-critical', dot: 'bg-red-500', label: 'Crítico' },
    UNKNOWN: { cls: 'risk-badge risk-unknown', dot: 'bg-slate-400', label: 'N/A' },
}

interface RiskBadgeProps {
    level: string
    score?: number | null
    size?: 'xs' | 'sm' | 'md'
    className?: string
}

export function RiskBadge({ level, score, size = 'md', className }: RiskBadgeProps) {
    const config = RISK_CONFIG[level] ?? RISK_CONFIG['UNKNOWN']!

    return (
        <span
            className={cn(
                config.cls,
                size === 'xs' && 'text-[10px] px-1.5 py-0.5 gap-1',
                size === 'sm' && 'text-[11px] px-2 py-0.5',
                className,
            )}
        >
            <span className={cn('rounded-full shrink-0', config.dot, size === 'xs' ? 'w-1 h-1' : 'w-1.5 h-1.5')} />
            {config.label}
            {score != null && (
                <span className="opacity-60 font-normal">· {score}pts</span>
            )}
        </span>
    )
}
