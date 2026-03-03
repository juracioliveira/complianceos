'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    ShieldCheck, LayoutDashboard, Users, ClipboardList,
    FileText, Activity, Bell, Settings, LogOut, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/contexts/AuthContext'

const NAV_GROUPS = [
    {
        label: 'Principal',
        items: [
            { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { href: '/entities', icon: Users, label: 'Entidades' },
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
            <div className="flex items-center gap-3 px-5 h-16 border-b border-white/[0.05] shrink-0">
                <div className="w-8 h-8 rounded bg-primary flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                    <ShieldCheck className="w-5 h-5 text-background" strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                    <p className="font-display text-lg text-foreground leading-tight tracking-tight">ComplianceOS</p>
                    <p className="text-[10px] uppercase font-mono tracking-widest text-primary/70">Governance Engine</p>
                </div>
            </div>

            {/* Navegação */}
            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
                {NAV_GROUPS.map((group) => (
                    <div key={group.label} className="space-y-1.5">
                        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] px-3">
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
                                            <span className="min-w-[18px] h-[18px] px-1 rounded bg-primary text-background text-[10px] font-bold flex items-center justify-center shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                                                {item.badge}
                                            </span>
                                        ) : isActive ? (
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,229,255,1)]" />
                                        ) : null}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Tenant info + logout */}
            <div className="border-t border-white/[0.05] px-4 py-4 shrink-0">
                <div
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-all cursor-pointer group border border-transparent hover:border-white/[0.05]"
                >
                    <div className="w-9 h-9 rounded bg-gradient-to-br from-primary/20 to-blue-500/20 border border-primary/30 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">
                            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                        </span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-semibold text-foreground truncate">{user?.name || 'Usuário'}</p>
                        <p className="text-[10px] font-mono text-muted-foreground truncate uppercase">{user?.tenantName || 'ComplianceOS'}</p>
                    </div>
                    <LogOut className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
            </div>

        </aside>
    )
}
