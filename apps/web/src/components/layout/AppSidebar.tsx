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
            <div className="flex items-center gap-3 px-5 h-16 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-8 h-8 rounded flex items-center justify-center shrink-0" style={{ background: '#00E5FF', boxShadow: '0 0 15px rgba(0,229,255,0.3)' }}>
                    <ShieldCheck className="w-5 h-5" style={{ color: '#0A0C10' }} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                    <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.1rem', color: '#F0F2F5', lineHeight: 1.2 }}>ComplianceOS</p>
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(0,229,255,0.6)' }}>Governance Engine</p>
                </div>
            </div>

            {/* Navegação */}
            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
                {NAV_GROUPS.map((group) => (
                    <div key={group.label} className="space-y-1.5">
                        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 700, color: 'rgba(136,146,164,0.5)', textTransform: 'uppercase', letterSpacing: '0.15em', padding: '0 12px' }}>
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
                                            <span style={{ minWidth: 18, height: 18, padding: '0 4px', borderRadius: 4, background: '#00E5FF', color: '#0A0C10', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(0,229,255,0.25)' }}>
                                                {item.badge}
                                            </span>
                                        ) : isActive ? (
                                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00E5FF', boxShadow: '0 0 8px #00E5FF' }} />
                                        ) : null}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Tenant info + logout */}
            <div className="px-4 py-4 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <div
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 transition-all cursor-pointer group"
                    style={{ borderRadius: 4, border: '1px solid transparent' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.borderColor = 'transparent' }}
                >
                    <div className="w-9 h-9 flex items-center justify-center shrink-0" style={{ borderRadius: 4, background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#00E5FF', fontFamily: "'JetBrains Mono', monospace" }}>
                            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                        </span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p style={{ fontSize: 12, fontWeight: 600, color: '#F0F2F5' }} className="truncate">{user?.name || 'Usuário'}</p>
                        <p style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#8892A4', textTransform: 'uppercase', letterSpacing: '0.08em' }} className="truncate">{user?.tenantName || 'ComplianceOS'}</p>
                    </div>
                    <LogOut className="w-3.5 h-3.5 transition-colors" style={{ color: '#8892A4' }} />
                </div>
            </div>

        </aside>
    )
}
