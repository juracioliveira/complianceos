'use client'

import { useState, useCallback } from 'react'
import { Bell, Search, Sun, Moon, Command } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/contexts/AuthContext'

export function AppHeader() {
    const [dark, setDark] = useState(false)
    const { user } = useAuth()

    const toggleDark = useCallback(() => {
        setDark((d) => {
            const next = !d
            document.documentElement.classList.toggle('dark', next)
            return next
        })
    }, [])

    return (
        <header className="h-16 flex items-center justify-between px-6 border-b border-black/[0.05] bg-white/80 backdrop-blur-xl shrink-0 z-10 font-ui text-[#0F172A]">
            {/* Busca */}
            <div className="flex items-center gap-3 bg-black/[0.02] hover:bg-black/[0.04] border border-black/[0.05] transition-all rounded-lg px-4 py-2 w-80 cursor-text shadow-inner">
                <Search className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                <input
                    type="text"
                    placeholder="Search entities, checklists, reports..."
                    className="bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none w-full"
                />
                <div className="flex items-center gap-1 shrink-0">
                    <kbd className="text-[10px] text-muted-foreground/50 bg-black/[0.03] border border-black/[0.08] rounded px-1.5 py-0.5 font-mono leading-none">
                        ⌘K
                    </kbd>
                </div>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-2">
                {/* Notificações */}
                <button className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-black/[0.03] transition-colors border border-transparent hover:border-black/[0.05]">
                    <Bell className="w-4 h-4 text-muted-foreground/80" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,163,191,0.3)]" />
                </button>

                {/* Divider */}
                <div className="w-px h-6 bg-black/[0.05] mx-2" />

                {/* Avatar / Perfil */}
                <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full bg-black/[0.03] hover:bg-black/[0.05] border border-black/[0.05] transition-all group">
                    <div className="hidden sm:block text-right">
                        <p className="text-[12px] font-semibold text-foreground leading-tight">{user?.name?.split(' ')[0] || 'Admin'}</p>
                        <p className="text-[9px] font-mono text-primary uppercase tracking-wider">{user?.role || 'System Root'}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/10 to-blue-500/10 border border-primary/20 flex items-center justify-center shadow-[0_0_10px_rgba(0,163,191,0.05)] group-hover:shadow-[0_0_15px_rgba(0,163,191,0.1)] transition-shadow">
                        <span className="text-[11px] font-bold text-primary">
                            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
                        </span>
                    </div>
                </button>
            </div>
        </header>

    )
}
