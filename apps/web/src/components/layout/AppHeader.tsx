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
        <header className="h-20 flex items-center justify-between px-8 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl shrink-0 z-10 font-sans text-slate-900">
            {/* Busca */}
            <div className="flex items-center gap-3 bg-slate-50/50 border border-slate-200/60 rounded-xl px-4 py-2.5 w-96 cursor-not-allowed group shadow-sm opacity-60">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                    type="text"
                    placeholder="Busca global — em breve"
                    className="bg-transparent text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none w-full cursor-not-allowed"
                    disabled
                    aria-label="Busca global (em desenvolvimento)"
                />
            </div>

            {/* Ações */}
            <div className="flex items-center gap-3">
                {/* Notificações */}
                <button className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 group">
                    <Bell className="w-5 h-5 text-slate-500 group-hover:text-brand-600 transition-colors" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(0,163,191,0.5)] animate-pulse" />
                </button>

                {/* Divider */}
                <div className="w-px h-8 bg-slate-200 mx-2" />

                {/* Avatar / Perfil */}
                <button className="flex items-center gap-3 pl-3 pr-2 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
                    <div className="hidden sm:block text-right">
                        <p className="text-[13px] font-bold text-slate-900 leading-tight tracking-tight">{user?.name?.split(' ')[0] || 'Admin'}</p>
                        <p className="text-[10px] font-mono font-bold text-brand-600 uppercase tracking-widest">{user?.role || 'Compliance'}</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-50 to-cyan-50 border border-brand-200 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                        <span className="text-[12px] font-bold text-brand-700 font-mono">
                            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
                        </span>
                    </div>
                </button>
            </div>
        </header>

    )
}
