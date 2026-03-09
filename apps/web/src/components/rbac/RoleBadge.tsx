'use client'

import { UserRole, ROLE_LABELS } from '@/lib/rbac/permissions'
import { cn } from '@/lib/utils'

interface RoleBadgeProps {
    role?: UserRole | string
    className?: string
}

const ROLE_STYLES: Record<string, string> = {
    ADMIN: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    COMPLIANCE_OFFICER: 'bg-brand-50 text-brand-700 border-brand-100',
    ANALYST: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    AUDITOR: 'bg-slate-900 text-white border-slate-800',
    READONLY: 'bg-slate-50 text-slate-500 border-slate-100',
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
    if (!role) return null

    const label = ROLE_LABELS[role as UserRole] || role
    const style = ROLE_STYLES[role as UserRole] || 'bg-slate-50 text-slate-500 border-slate-100'

    return (
        <span className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
            style,
            className
        )}>
            {label}
        </span>
    )
}
