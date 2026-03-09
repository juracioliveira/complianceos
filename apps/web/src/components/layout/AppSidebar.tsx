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
            <div className="flex items-center gap-3 px-6 h-20 shrink-0 border-b border-slate-200/50 bg-white/40 backdrop-blur-md">
                <div className="p-2 bg-brand-50 rounded-xl shadow-sm border border-brand-100/50 group-hover:bg-brand-100 transition-colors">
                    <ShieldCheck className="w-6 h-6 text-brand-600" strokeWidth={2.5} />
                </div>
                <div className="text-2xl font-display text-slate-900 tracking-tight">
                    Compliance<span className="text-brand-600 font-semibold">OS</span>
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
                                            'nav-item group mx-2',
                                            isActive && 'nav-item-active',
                                        )}
                                    >
                                        <item.icon className={cn(
                                            'w-4 h-4 shrink-0 transition-all duration-300',
                                            isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600 group-hover:scale-110',
                                        )} strokeWidth={isActive ? 2.5 : 2} />
                                        <span className={cn(
                                            "flex-1 text-[13px] font-medium tracking-tight",
                                            isActive ? "text-slate-900" : "text-slate-500"
                                        )}>{item.label}</span>
                                        {'badge' in item && item.badge ? (
                                            <span className="min-w-[20px] h-[20px] px-1 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-brand-600/30">
                                                {item.badge}
                                            </span>
                                        ) : isActive ? (
                                            <div className="w-1 h-4 rounded-full bg-brand-600 shadow-[0_0_10px_rgba(0,163,191,0.4)]" />
                                        ) : null}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Tenant info + logout */}
            <div className="px-4 py-4 shrink-0 border-t border-slate-200/50 bg-slate-50/30">
                <div
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group hover:bg-white hover:shadow-md hover:shadow-slate-200/50 border border-transparent hover:border-slate-200"
                >
                    <div className="w-9 h-9 flex items-center justify-center shrink-0 rounded-lg bg-gradient-to-tr from-brand-50 to-cyan-50 border border-brand-100 shadow-inner">
                        <span className="text-[11px] font-bold text-brand-600 font-mono">
                            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                        </span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-slate-900 truncate tracking-tight">{user?.name || 'Usuário'}</p>
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest truncate">{user?.tenantName || 'ComplianceOS'}</p>
                    </div>
                    <LogOut className="w-3.5 h-3.5 text-slate-300 transition-colors group-hover:text-slate-600" />
                </div>
            </div>

        </aside>
    )
}
