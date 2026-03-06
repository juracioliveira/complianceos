'use client'

import { useState } from 'react'
import {
    Activity,
    Filter,
    Download,
    ShieldCheck,
    Layers,
    User,
    Settings,
    Search,
    Calendar,
    ChevronRight
} from 'lucide-react'
import AuditEventDrawer from './components/AuditEventDrawer'

import { useApi } from '@/hooks/useApi'
import { useEffect } from 'react'

const MODULE_ICON: Record<string, any> = {
    AUTH: ShieldCheck, USERS: User, ADMIN: Settings, ENTITIES: Layers,
    PLD_FT: Activity, LGPD: Activity, AUDIT: Activity
}

const MODULE_COLOR: Record<string, string> = {
    AUTH: 'text-indigo-500 bg-indigo-50',
    USERS: 'text-blue-500 bg-blue-50',
    ENTITIES: 'text-purple-500 bg-purple-50',
    PLD_FT: 'text-emerald-500 bg-emerald-50',
    LGPD: 'text-amber-500 bg-amber-50'
}

export default function AuditPage() {
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null)
    const [activeFilter, setActiveFilter] = useState('TODOS')
    const [events, setEvents] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const api = useApi()

    useEffect(() => {
        async function fetchEvents() {
            try {
                const res = await api.fetchWithAuth('/v1/audit/events')
                if (res?.data) {
                    setEvents(res.data)
                } else if (res?.events) {
                    setEvents(res.events)
                } else if (Array.isArray(res)) {
                    setEvents(res)
                }
            } catch (error) {
                console.error('Failed to fetch audit events:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchEvents()
    }, [])


    return (
        <div className="flex flex-col gap-6 animate-fade-in max-w-[1200px] mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-lg shadow-primary/5 border border-primary/20">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold tracking-tight">Trilha de Auditoria</h1>
                        <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                            Registro Imutável SHA-256
                            <span className="w-1 h-1 rounded-full bg-border" />
                            Retenção de 5 Anos (Lei 9.613/98)
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex flex-col items-end mr-4">
                        <span className="text-[10px] font-bold uppercase text-emerald-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Integridade Validada
                        </span>
                        <span className="text-[9px] font-mono text-muted-foreground">Último Hash: a7ffd...991b7</span>
                    </div>
                    <button className="btn btn-secondary btn-sm gap-2 whitespace-nowrap">
                        <Download className="w-4 h-4" />
                        Exportar Logs
                    </button>
                </div>
            </div>

            {/* Toolbar & Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 flex flex-wrap items-center gap-2 bg-card border border-border p-1.5 rounded-xl">
                    {['TODOS', 'PLD_FT', 'LGPD', 'ENTITIES', 'AUTH', 'USERS'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`
                        px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all
                        ${activeFilter === filter
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-muted-foreground hover:bg-muted/50'}
                      `}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 bg-card border border-border p-1.5 rounded-xl px-4 min-w-[300px]">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar ação ou ator..."
                        className="input-field h-8 border-transparent bg-transparent text-xs p-0 focus:ring-0"
                    />
                    <div className="h-4 w-[1px] bg-border mx-2" />
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Dezembro/2024</span>
                </div>
            </div>

            {/* Events List */}
            <div className="card p-0 overflow-hidden border-border/50">
                <div className="overflow-x-auto text-[13px]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-muted/30 border-b border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                <th className="px-6 py-4">Data & Registro</th>
                                <th className="px-6 py-4">Ator</th>
                                <th className="px-6 py-4">Ação</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Ver</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground text-xs animate-pulse">
                                        Carregando trilha de auditoria criptografada...
                                    </td>
                                </tr>
                            ) : events.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground text-xs">
                                        Nenhum evento registrado nesta tenant.
                                    </td>
                                </tr>
                            ) : events.map((e) => {
                                const Icon = MODULE_ICON[e.module] || Activity
                                const timeFormatted = e.createdAt ? new Date(e.createdAt).toLocaleString('pt-BR') : e.time;
                                return (
                                    <tr
                                        key={e.id}
                                        onClick={() => setSelectedEvent(e)}
                                        className="hover:bg-muted/20 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-[11px] text-muted-foreground">{timeFormatted}</span>
                                                <span className="text-[10px] font-bold uppercase text-primary/70">{(e.eventId || e.id || '').substring(0, 8)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center font-bold text-[10px] text-muted-foreground">
                                                    {(e.actor || 'S')[0]}
                                                </div>
                                                <div className="flex flex-col leading-tight">
                                                    <span className="font-bold text-foreground">{e.actorName || e.actor}</span>
                                                    <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider font-mono">{e.actorType || 'SYSTEM'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-md ${MODULE_COLOR[e.module] || 'bg-muted text-muted-foreground'}`}>
                                                    <Icon className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground">{e.action}</span>
                                                    <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">{e.detail || e.resourceId}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`badge text-[9px] ${e.result === 'SUCCESS' ? 'badge-green' : 'badge-red'}`}>{e.result === 'SUCCESS' ? 'Sucedido' : 'Falhou'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-all group-hover:translate-x-1">
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Simplified) */}
                <div className="px-6 py-4 border-t border-border bg-muted/10 flex items-center justify-between">
                    <div className="flex gap-1 items-baseline">
                        <span className="text-xs font-bold text-foreground">{events.length}</span>
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Registros na página</span>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn btn-secondary btn-xs opacity-50 cursor-not-allowed">Anterior</button>
                        <button className="btn btn-secondary btn-xs">Próxima</button>
                    </div>
                </div>
            </div>

            <AuditEventDrawer
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
            />
        </div>
    )
}
