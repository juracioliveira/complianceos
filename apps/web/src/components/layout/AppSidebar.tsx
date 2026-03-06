'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    ShieldCheck, LayoutDashboard, Users, ClipboardList,
    FileText, Activity, Bell, Settings, LogOut, ChevronRight,
    ShieldAlert,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/contexts/AuthContext'

const NAV_GROUPS = [
    {
        label: 'Principal',
        items: [
            { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { href: '/entities', icon: Users, label: 'Entidades' },
            { href: '/alerts', icon: ShieldAlert, label: 'Alertas', badgeDynamic: 'openCases' },
            { href: '/checklists', icon: ClipboardList, label: 'Checklists' },
        ],
    },
    {
        label: 'Relatórios',
        items: [
            { href: '/documents', icon: FileText, label: 'Documentos' },
            { href: '/audit', icon: Activity, label: 'Audit Trail' },
        ],
    },
    {
        label: 'Gestão',
        items: [
            { href: '/notifications', icon: Bell, label: 'Notificações', badge: 18 },
            { href: '/users', icon: Users, label: 'Usuários' },
            { href: '/settings', icon: Settings, label: 'Configurações' },
        ],
    },
]

export function AppSidebar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()

    const handleLogout = () => {
        logout()
    }

    return (
        <aside className="sidebar h-screen flex flex-col animate-slide-left">
            {/* Logo */}
            <div className="flex items-center gap-2 px-5 h-16 shrink-0 border-b border-slate-200/80">
                <div className="p-1.5 bg-brand-50 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-brand-600" strokeWidth={2} />
                </div>
                <div className="text-xl font-bold tracking-tight text-slate-900">
                    Compliance<span className="text-brand-600">OS</span>
                </div>
            </div>

            {/* Navegação */}
            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
                {NAV_GROUPS.map((group) => (
                    <div key={group.label} className="space-y-1.5">
                        <p className="font-mono text-[9px] font-bold text-slate-500/70 uppercase tracking-widest px-3">
                            {group.label}
                        </p>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'nav-item group',
                                            isActive && 'nav-item-active',
                                        )}
                                    >
                                        <item.icon className={cn(
                                            'w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110',
                                            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                                        )} strokeWidth={isActive ? 2.5 : 2} />
                                        <span className="flex-1 text-[13px]">{item.label}</span>
                                        {'badge' in item && item.badge ? (
                                            <span className="min-w-[18px] h-[18px] px-1 rounded bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm shadow-brand-600/20">
                                                {item.badge}
                                            </span>
                                        ) : isActive ? (
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-600 shadow-[0_0_8px_rgba(var(--brand-600),0.5)]" />
                                        ) : null}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Tenant info + logout */}
            <div className="px-4 py-4 shrink-0 border-t border-slate-200/80">
                <div
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group hover:bg-slate-100 hover:border-slate-200 border border-transparent"
                >
                    <div className="w-9 h-9 flex items-center justify-center shrink-0 rounded-lg bg-brand-50 border border-brand-100">
                        <span className="text-[11px] font-bold text-brand-600 font-mono">
                            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                        </span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900 truncate">{user?.name || 'Usuário'}</p>
                        <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest truncate">{user?.tenantName || 'ComplianceOS'}</p>
                    </div>
                    <LogOut className="w-3.5 h-3.5 text-slate-500 transition-colors group-hover:text-slate-700" />
                </div>
            </div>

        </aside>
    )
}
