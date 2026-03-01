'use client'

import { Shield, ShieldCheck, Briefcase, History } from 'lucide-react'

type Role = 'ADMIN' | 'CCO' | 'ANALYST' | 'AUDITOR'

interface RoleBadgeProps {
    role: Role
}

const roleMap = {
    ADMIN: {
        label: 'Administrador',
        icon: <Shield className="w-3 h-3" />,
        style: 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-900/50'
    },
    CCO: {
        label: 'Compliance Officer',
        icon: <ShieldCheck className="w-3 h-3" />,
        style: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/50'
    },
    ANALYST: {
        label: 'Analista de Risco',
        icon: <Briefcase className="w-3 h-3" />,
        style: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-900/50'
    },
    AUDITOR: {
        label: 'Auditor Externo',
        icon: <History className="w-3 h-3" />,
        style: 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950/30 dark:border-orange-900/50'
    }
}

export default function RoleBadge({ role }: RoleBadgeProps) {
    const config = roleMap[role] || roleMap.ANALYST

    return (
        <div className={`
      inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider
      ${config.style}
    `}>
            {config.icon}
            {config.label}
        </div>
    )
}
