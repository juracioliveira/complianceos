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
            <div className="flex items-center gap-3 px-5 h-16 border-b border-border shrink-0">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                    <p className="font-bold text-sm text-foreground leading-tight">ComplianceOS</p>
                    <p className="text-[11px] text-muted-foreground truncate">Chuangxin Tecnologia</p>
                </div>
            </div>

            {/* Navegação */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
                {NAV_GROUPS.map((group) => (
                    <div key={group.label}>
                        <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest px-3 mb-1.5">
                            {group.label}
                        </p>
                        <div className="space-y-0.5">
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
                                            'w-4 h-4 shrink-0 transition-colors',
                                            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                                        )} />
                                        <span className="flex-1 text-sm">{item.label}</span>
                                        {'badge' in item && item.badge ? (
                                            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                                                {item.badge}
                                            </span>
                                        ) : isActive ? (
                                            <ChevronRight className="w-3 h-3 text-primary/50" />
                                        ) : null}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Tenant info + logout */}
            <div className="border-t border-border px-3 py-3 shrink-0">
                <div
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-accent transition-colors cursor-pointer group"
                >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                        <span className="text-xs font-bold text-white">
                            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                        </span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate">{user?.name || 'Usuário'}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{user?.tenantName || 'ComplianceOS'}</p>
                    </div>
                    <LogOut className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
            </div>
        </aside>
    )
}
