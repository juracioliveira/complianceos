import { cn } from '@/lib/utils'

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

const SEVERITY_COLOR: Record<Severity, string> = {
    LOW: '#10B981',
    MEDIUM: '#F5A623',
    HIGH: '#D97706',
    CRITICAL: '#EF4444',
}

interface AlertCaseSeverityBarProps {
    severity: Severity
    className?: string
}

export function AlertCaseSeverityBar({ severity, className }: AlertCaseSeverityBarProps) {
    return (
        <div className={cn('flex items-center gap-1', className)}>
            <div className="flex gap-0.5">
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as Severity[]).map((s) => {
                    const isActive = s === severity
                    // Se for critical, marca todos. Se for high, marca low/medium/high
                    const levels: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
                    const index = levels.indexOf(s)
                    const targetIndex = levels.indexOf(severity)
                    const filled = index <= targetIndex

                    return (
                        <div
                            key={s}
                            className={cn(
                                'w-3 h-1 rounded-full transition-all duration-300',
                                filled ? '' : 'bg-slate-100'
                            )}
                            style={{ backgroundColor: filled ? SEVERITY_COLOR[severity] : undefined }}
                        />
                    )
                })}
            </div>
            <span className="text-[10px] font-bold font-mono uppercase tracking-wider ml-1" style={{ color: SEVERITY_COLOR[severity] }}>
                {severity}
            </span>
        </div>
    )
}
