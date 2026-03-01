'use client'

import { useState, useCallback } from 'react'
import { Bell, Search, Sun, Moon, Command } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AppHeader() {
    const [dark, setDark] = useState(false)

    const toggleDark = useCallback(() => {
        setDark((d) => {
            const next = !d
            document.documentElement.classList.toggle('dark', next)
            return next
        })
    }, [])

    return (
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card/60 backdrop-blur-sm shrink-0 z-10">
            {/* Busca */}
            <div className="flex items-center gap-2 bg-muted/70 hover:bg-muted transition-colors rounded-lg px-3 py-2 w-72 cursor-text">
                <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <input
                    type="text"
                    placeholder="Buscar em entidades, checklists..."
                    className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-full"
                />
                <div className="flex items-center gap-0.5 shrink-0">
                    <kbd className="text-[10px] text-muted-foreground bg-background border border-border rounded px-1.5 py-0.5 font-mono leading-none">
                        ⌘K
                    </kbd>
                </div>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-1">
                {/* Dark mode */}
                <button
                    onClick={toggleDark}
                    className={cn('btn-ghost w-9 h-9 p-0 rounded-lg')}
                    title={dark ? 'Modo claro' : 'Modo escuro'}
                >
                    {dark
                        ? <Sun className="w-4 h-4" />
                        : <Moon className="w-4 h-4" />}
                </button>

                {/* Notificações */}
                <button className="relative btn-ghost w-9 h-9 p-0 rounded-lg">
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-2 right-2 status-dot status-critical" />
                </button>

                {/* Divider */}
                <div className="w-px h-5 bg-border mx-1" />

                {/* Avatar */}
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors group">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                        <span className="text-[11px] font-bold text-white">AC</span>
                    </div>
                    <div className="hidden sm:block text-left">
                        <p className="text-xs font-semibold text-foreground leading-tight">Admin</p>
                        <p className="text-[10px] text-muted-foreground leading-tight">ADMIN</p>
                    </div>
                </button>
            </div>
        </header>
    )
}
