import { cn } from '@/lib/utils'

export type ComplianceModule = 'PLD_FT' | 'LGPD' | 'ANTICORRUPCAO'

const MODULE_CONFIG: Record<ComplianceModule, { cls: string; label: string }> = {
    PLD_FT: { cls: 'bg-blue-50 text-blue-700 border-blue-200/50', label: 'PLD-FT' },
    LGPD: { cls: 'bg-brand-50 text-brand-700 border-brand-200/50', label: 'Privacidade' },
    ANTICORRUPCAO: { cls: 'bg-amber-50 text-amber-700 border-amber-200/50', label: 'Anticorrupção' },
}

interface ComplianceModuleTagProps {
    module: ComplianceModule
    className?: string
}

export function ComplianceModuleTag({ module, className }: ComplianceModuleTagProps) {
    const config = MODULE_CONFIG[module]

    return (
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono border', config.cls, className)}>
            {config.label}
        </span>
    )
}
