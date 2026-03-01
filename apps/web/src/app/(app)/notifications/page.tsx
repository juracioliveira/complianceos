'use client'

import { useState } from 'react'
import {
    Bell,
    Search,
    Filter,
    MoreVertical,
    CheckCheck,
    Trash2,
    AlertTriangle,
    Info,
    ShieldAlert,
    ChevronRight,
    ExternalLink,
    Clock,
    Circle
} from 'lucide-react'

const notifications = [
    {
        id: 'n1',
        title: 'PEP Detectado em Nova Entidade',
        description: 'O sócio majoritário da Delta Energia Corp foi identificado em listas de PEP nacionais.',
        type: 'CRITICAL',
        time: '5 min atrás',
        unread: true,
        entityId: 'delta-123'
    },
    {
        id: 'n2',
        title: 'Vencimento de KYC próximo',
        description: 'A entidade Alpha Pagamentos possui documentos que expiram em menos de 30 dias.',
        type: 'WARNING',
        time: '2h atrás',
        unread: true,
        entityId: 'alpha-pag'
    },
    {
        id: 'n3',
        title: 'Documento Gerado com Sucesso',
        description: 'O RAT de Dezembro/2024 já está disponível no cofre de documentos.',
        type: 'INFO',
        time: 'Hoje, 09:32',
        unread: false,
        docId: 'rat-123'
    },
    {
        id: 'n4',
        title: 'MFA Desativado por Usuário',
        description: 'O usuário João Costa desativou o MFA temporariamente via requisição manual.',
        type: 'CRITICAL',
        time: 'Ontem',
        unread: false,
        userId: 'joao'
    },
    {
        id: 'n5',
        title: 'Tentativas de Login Suspeitas',
        description: 'IP 203.0.113.5 realizou 5 tentativas falhas de login no tenant.',
        type: 'WARNING',
        time: 'Ontem',
        unread: false
    }
]

const priorityConfig = {
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
    }
}

export default function NotificationsPage() {
    const [searchTerm, setSearchTerm] = useState('')

    return (
        <div className="flex flex-col gap-6 animate-fade-in max-w-[1000px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20">
                        <Bell className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Central de Notificações</h1>
                        <p className="text-sm text-muted-foreground font-medium">Alertas críticos, avisos de risco e automações do sistema.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="btn btn-secondary btn-sm gap-2">
                        <CheckCheck className="w-4 h-4" />
                        Marcar todas como lidas
                    </button>
                    <button className="btn btn-secondary btn-sm p-2">
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </button>
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
                <div className="h-6 w-[1px] bg-border" />
                <button className="btn btn-ghost btn-sm gap-2 px-4">
                    <Filter className="w-4 h-4" />
                    Prioridade
                </button>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                {notifications.map((notif) => {
                    const config = priorityConfig[notif.type as keyof typeof priorityConfig]
                    return (
                        <div
                            key={notif.id}
                            className={`
                                group relative flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer
                                ${notif.unread ? 'bg-card border-primary/20 shadow-md ring-1 ring-primary/5' : 'bg-muted/10 border-border/50 opacity-80 hover:opacity-100'}
                            `}
                        >
                            {/* Unread Indicator */}
                            {notif.unread && (
                                <div className="absolute left-1.5 top-1/2 -translate-y-1/2">
                                    <Circle className="w-2 h-2 fill-primary text-primary" />
                                </div>
                            )}

                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${config.color}`}>
                                {config.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-2">
                                            <h3 className={`font-bold text-sm ${notif.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {notif.title}
                                            </h3>
                                            <span className={`w-1.5 h-1.5 rounded-full ${config.badge}`} />
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {notif.description}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {notif.time}
                                        </span>
                                        <button className="p-1 hover:bg-muted rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Actions */}
                                {(notif.entityId || notif.docId) && (
                                    <div className="mt-4 flex items-center gap-3">
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-[10px] font-bold uppercase tracking-wider">
                                            {notif.entityId ? 'Ver Entidade' : 'Abrir Documento'}
                                            <ExternalLink className="w-3 h-3" />
                                        </button>
                                        <button className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider transition-colors">
                                            Ignorar Alerta
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Interaction Hover */}
                            <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Footer / Empty State placeholder */}
            <div className="p-12 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center opacity-30">
                <Bell className="w-12 h-12 mb-4" />
                <p className="text-sm font-medium">Sem novas notificações críticas</p>
            </div>
        </div>
    )
}
