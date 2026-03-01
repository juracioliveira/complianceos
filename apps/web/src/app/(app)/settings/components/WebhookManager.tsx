'use client'

import { useState } from 'react'
import { Zap, Plus, ShieldCheck, History, Trash2, Key, Link2, Copy, Check } from 'lucide-react'

export default function WebhookManager() {
    const [copied, setCopied] = useState<string | null>(null)

    const webhooks = [
        {
            id: 'wh_1',
            url: 'https://api.empresa.com.br/v1/compliance-callback',
            status: 'ACTIVE',
            events: ['checklist.completed', 'risk.critical_hit'],
            lastSuccess: '5m atrás',
            secret: 'whsec_9b2e...7d1f'
        },
        {
            id: 'wh_2',
            url: 'https://webhook.site/test-1234',
            status: 'FAILED',
            events: ['entity.created'],
            lastSuccess: 'Há 2 dias',
            secret: 'whsec_1a2b...3c4d'
        }
    ]

    const handleCopy = (id: string, secret: string) => {
        navigator.clipboard.writeText(secret)
        setCopied(id)
        setTimeout(() => setCopied(null), 2000)
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="card p-0 overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between bg-muted/10">
                    <div>
                        <h3 className="font-bold text-lg">Webhooks de Integração</h3>
                        <p className="text-sm text-muted-foreground">Envie atualizações de risco em tempo real para seus sistemas externos.</p>
                    </div>
                    <button className="btn btn-primary btn-sm gap-2">
                        <Plus className="w-4 h-4" />
                        Novo Webhook
                    </button>
                </div>

                <div className="divide-y divide-border">
                    {webhooks.map((wh) => (
                        <div key={wh.id} className="p-6 hover:bg-muted/30 transition-colors group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex flex-col gap-2 flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-2 h-2 rounded-full ${wh.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'} shadow-sm`} />
                                        <span className="font-bold text-foreground truncate max-w-md">{wh.url}</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        {wh.events.map(ev => (
                                            <span key={ev} className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                                                {ev}
                                            </span>
                                        ))}
                                        <span className="w-1 h-1 rounded-full bg-border" />
                                        <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                                            <History className="w-3 h-3" />
                                            Último sucesso: {wh.lastSuccess}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-lg border border-border">
                                        <code className="text-[10px] font-mono text-muted-foreground px-1">{wh.secret}</code>
                                        <button
                                            onClick={() => handleCopy(wh.id, wh.secret)}
                                            className="p-1 hover:text-primary transition-colors"
                                        >
                                            {copied === wh.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        </button>
                                    </div>
                                    <button className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-muted-foreground hover:text-red-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-muted/20 border-t border-border flex items-center justify-between group cursor-help">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm">Segurança HMAC-SHA256</h4>
                            <p className="text-xs text-muted-foreground">Todas as entregas são assinadas digitalmente para garantir autenticidade.</p>
                        </div>
                    </div>
                    <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Ver Documentação <Link2 className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    )
}
