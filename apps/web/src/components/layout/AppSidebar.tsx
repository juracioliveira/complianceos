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
            <div className="flex items-center gap-3 px-5 h-16 shrink-0" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <div className="w-8 h-8 rounded flex items-center justify-center shrink-0" style={{ background: '#00A3BF', boxShadow: '0 0 15px rgba(0,163,191,0.15)' }}>
                    <ShieldCheck className="w-5 h-5" style={{ color: '#FFFFFF' }} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                    <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.1rem', color: '#0F172A', lineHeight: 1.2 }}>ComplianceOS</p>
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(0,163,191,0.6)' }}>Governance Engine</p>
                </div>
            </div>

            {/* Navegação */}
            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
                {NAV_GROUPS.map((group) => (
                    <div key={group.label} className="space-y-1.5">
                        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 700, color: 'rgba(71,85,105,0.5)', textTransform: 'uppercase', letterSpacing: '0.15em', padding: '0 12px' }}>
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
                                            <span style={{ minWidth: 18, height: 18, padding: '0 4px', borderRadius: 4, background: '#00A3BF', color: '#FFFFFF', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(0,163,191,0.15)' }}>
                                                {item.badge}
                                            </span>
                                        ) : isActive ? (
                                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00A3BF', boxShadow: '0 0 8px #00A3BF' }} />
                                        ) : null}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Tenant info + logout */}
            <div className="px-4 py-4 shrink-0" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <div
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 transition-all cursor-pointer group"
                    style={{ borderRadius: 4, border: '1px solid transparent' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.02)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.05)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.borderColor = 'transparent' }}
                >
                    <div className="w-9 h-9 flex items-center justify-center shrink-0" style={{ borderRadius: 4, background: 'rgba(0,163,191,0.05)', border: '1px solid rgba(0,163,191,0.1)' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#00A3BF', fontFamily: "'JetBrains Mono', monospace" }}>
                            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                        </span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }} className="truncate">{user?.name || 'Usuário'}</p>
                        <p style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }} className="truncate">{user?.tenantName || 'ComplianceOS'}</p>
                    </div>
                    <LogOut className="w-3.5 h-3.5 transition-colors" style={{ color: '#475569' }} />
                </div>
            </div>

        </aside>
    )
}
