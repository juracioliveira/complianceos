'use client'

import { useEffect, useState, useCallback } from 'react'
import {
    Bell, Search, Filter, MoreVertical, CheckCheck, Trash2,
    AlertTriangle, Info, ShieldAlert, ChevronRight, ExternalLink,
    Clock, Circle, Loader2, BellOff
} from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import Link from 'next/link'

type NotifSeverity = 'CRITICAL' | 'WARNING' | 'INFO'

const priorityConfig: Record<NotifSeverity, { icon: React.ReactNode; color: string; badge: string }> = {
    CRITICAL: {
        icon: <ShieldAlert className="w-5 h-5" />,
        color: 'text-red-500 bg-red-50 dark:bg-red-950/30 border-red-200/50',
        badge: 'bg-red-500'
    },
    WARNING: {
        icon: <AlertTriangle className="w-5 h-5" />,
        color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-200/50',
        badge: 'bg-amber-500'
    },
    INFO: {
        icon: <Info className="w-5 h-5" />,
        color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30 border-blue-200/50',
        badge: 'bg-blue-500'
    },
}

function timeAgo(dateStr: string): string {
    const now = Date.now()
    const diff = now - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'agora'
    if (mins < 60) return `${mins} min atrás`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h atrás`
    const days = Math.floor(hrs / 24)
    if (days === 1) return 'Ontem'
    return `${days} dias atrás`
}

export default function NotificationsPage() {
    const { fetchWithAuth } = useApi()
    const [notifications, setNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    const loadNotifications = useCallback(async () => {
        try {
            const res = await fetchWithAuth('/v1/notifications?limit=50')
            setNotifications(res?.data ?? [])
        } catch (err) {
            console.error('Failed to load notifications', err)
            setNotifications([])
        } finally {
            setLoading(false)
        }
    }, [fetchWithAuth])

    useEffect(() => { loadNotifications() }, [loadNotifications])

    const markAllRead = async () => {
        try {
            await fetchWithAuth('/v1/notifications/read-all', { method: 'POST' })
            setNotifications(prev => prev.map(n => ({ ...n, readAt: new Date().toISOString() })))
        } catch (err) {
            console.error('markAllRead error', err)
        }
    }

    const filtered = notifications.filter(n =>
        !searchTerm ||
        n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.body?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const unreadCount = notifications.filter(n => !n.readAt).length

    return (
        <div className="flex flex-col gap-6 animate-fade-in max-w-[1000px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20">
                        <Bell className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Central de Notificações
                            {unreadCount > 0 && (
                                <span className="ml-2 text-sm font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">{unreadCount}</span>
                            )}
                        </h1>
                        <p className="text-sm text-muted-foreground font-medium">Alertas críticos, avisos de risco e automações do sistema.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button onClick={markAllRead} className="btn btn-secondary btn-sm gap-2">
                            <CheckCheck className="w-4 h-4" />
                            Marcar todas como lidas
                        </button>
                    )}
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-4 bg-card border border-border p-2 rounded-xl">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Filtrar notificações..."
                        className="input-field pl-12 h-10 border-transparent bg-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Notifications List */}
            {loading ? (
                <div className="flex items-center justify-center gap-3 py-20 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-sm">Carregando notificações...</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="p-16 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center text-muted-foreground">
                    <BellOff className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm font-medium">{searchTerm ? 'Nenhuma notificação encontrada.' : 'Você está em dia — sem notificações.'}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((notif) => {
                        const severity = (notif.severity ?? notif.type ?? 'INFO') as NotifSeverity
                        const config = priorityConfig[severity] ?? priorityConfig.INFO
                        const isUnread = !notif.readAt

                        return (
                            <div
                                key={notif.id}
                                className={`
                                    group relative flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer
                                    ${isUnread ? 'bg-card border-primary/20 shadow-md ring-1 ring-primary/5' : 'bg-muted/10 border-border/50 opacity-80 hover:opacity-100'}
                                `}
                            >
                                {isUnread && (
                                    <div className="absolute left-1.5 top-1/2 -translate-y-1/2">
                                        <Circle className="w-2 h-2 fill-primary text-primary" />
                                    </div>
                                )}

                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${config.color}`}>
                                    {config.icon}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-2">
                                                <h3 className={`font-bold text-sm ${isUnread ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                    {notif.title}
                                                </h3>
                                                <span className={`w-1.5 h-1.5 rounded-full ${config.badge}`} />
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                {notif.body ?? notif.description}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {notif.createdAt ? timeAgo(notif.createdAt) : '—'}
                                            </span>
                                        </div>
                                    </div>

                                    {notif.actionUrl && (
                                        <div className="mt-4 flex items-center gap-3">
                                            <Link
                                                href={notif.actionUrl}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-[10px] font-bold uppercase tracking-wider"
                                            >
                                                Ver detalhes
                                                <ExternalLink className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
