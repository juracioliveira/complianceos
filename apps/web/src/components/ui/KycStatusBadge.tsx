import { cn } from '@/lib/utils'

export type KycStatus = 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED'

const STATUS_CONFIG: Record<KycStatus, { cls: string; label: string }> = {
    PENDING: { cls: 'badge-slate', label: 'Pendente' },
    IN_PROGRESS: { cls: 'badge-blue', label: 'Em Análise' },
    APPROVED: { cls: 'badge-green', label: 'Aprovado' },
    REJECTED: { cls: 'badge-red', label: 'Reprovado' },
}

interface KycStatusBadgeProps {
    status: KycStatus
    className?: string
}

export function KycStatusBadge({ status, className }: KycStatusBadgeProps) {
    const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING

    return (
        <span className={cn('badge', config.cls, className)}>
            {config.label}
        </span>
    )
}
