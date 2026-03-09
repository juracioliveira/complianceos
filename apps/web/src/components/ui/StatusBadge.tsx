import { cn } from '@/lib/utils'

export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED'

const STATUS_CONFIG: Record<EntityStatus, { cls: string; label: string }> = {
    ACTIVE: { cls: 'badge-green', label: 'Ativo' },
    INACTIVE: { cls: 'badge-slate', label: 'Inativo' },
    BLOCKED: { cls: 'badge-red', label: 'Bloqueado' },
}

interface StatusBadgeProps {
    status: EntityStatus
    className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.INACTIVE

    return (
        <span className={cn('badge', config.cls, className)}>
            {config.label}
        </span>
    )
}
