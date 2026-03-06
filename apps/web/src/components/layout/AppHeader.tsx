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
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl shrink-0 z-10 font-sans text-slate-900">
            {/* Busca */}
            <div className="flex items-center gap-3 bg-slate-50/50 hover:bg-white border border-slate-200/60 hover:border-brand-200 transition-all rounded-xl px-4 py-2 w-96 cursor-text group shadow-sm">
                <Search className="w-4 h-4 text-slate-400 group-hover:text-brand-500 shrink-0 transition-colors" />
                <input
                    type="text"
                    placeholder="Search entities, checklists, reports..."
                    className="bg-transparent text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
                />
                <div className="flex items-center gap-1 shrink-0">
                    <kbd className="text-[10px] text-slate-400 bg-white border border-slate-200 rounded px-1.5 py-0.5 font-mono shadow-sm">
                        ⌘K
                    </kbd>
                </div>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-2">
                {/* Notificações */}
                <button className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
                    <Bell className="w-4 h-4 text-slate-500" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(var(--brand-500),0.3)]" />
                </button>

                {/* Divider */}
                <div className="w-px h-6 bg-slate-200 mx-2" />

                {/* Avatar / Perfil */}
                <button className="flex items-center gap-3 pl-2 pr-1.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
                    <div className="hidden sm:block text-right px-1">
                        <p className="text-[12px] font-bold text-slate-900 leading-tight">{user?.name?.split(' ')[0] || 'Admin'}</p>
                        <p className="text-[9px] font-mono font-bold text-brand-600 uppercase tracking-widest">{user?.role || 'Compliance'}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-100 to-cyan-50 border border-brand-200 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                        <span className="text-[11px] font-bold text-brand-700 font-mono">
                            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
                        </span>
                    </div>
                </button>
            </div>
        </header>

    )
}
