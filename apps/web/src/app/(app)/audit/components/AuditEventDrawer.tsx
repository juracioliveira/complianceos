'use client'

import {
    X,
    Shield,
    User,
    Globe,
    Cpu,
    Hash,
    Clock,
    ArrowRight,
    ChevronRight,
    Fingerprint
} from 'lucide-react'

interface AuditEventDrawerProps {
    event: any | null
    onClose: () => void
}

export default function AuditEventDrawer({ event, onClose }: AuditEventDrawerProps) {
    if (!event) return null

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div
                className="absolute inset-0 bg-background/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-xl bg-card border-l border-border shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-border bg-muted/30 sticky top-0 z-10 flex items-center justify-between backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-tight">Detalhes do Evento</h3>
                            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{event.id}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 space-y-10">
                    {/* Main Context */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <Fingerprint className="w-4 h-4" />
                            <h4 className="text-xs font-bold uppercase tracking-widest underline underline-offset-4 decoration-primary/30">Contexto do Registro</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <MetadataItem icon={<User className="w-3.5 h-3.5" />} label="Ator" value={event.actor} subValue={event.actorType} />
                            <MetadataItem icon={<Clock className="w-3.5 h-3.5" />} label="Data/Hora" value={event.time} />
                            <MetadataItem icon={<Globe className="w-3.5 h-3.5" />} label="Origem IP" value="187.12.45.102" isMono />
                            <MetadataItem icon={<Cpu className="w-3.5 h-3.5" />} label="Módulo" value={event.module} />
                        </div>
                    </section>

                    {/* Action Detail */}
                    <section className="p-6 rounded-2xl bg-muted/20 border border-border/50 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Ação Executada</span>
                            <span className="badge badge-green">Sucesso</span>
                        </div>
                        <p className="text-lg font-bold text-foreground">{event.action}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {event.detail}
                        </p>
                    </section>

                    {/* JSON Payload */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Payload Data (JSON)</h4>
                            <button className="text-[10px] font-bold text-primary hover:underline">Copiar JSON</button>
                        </div>
                        <div className="p-4 rounded-xl bg-zinc-950 text-zinc-300 font-mono text-[11px] overflow-x-auto border border-white/5 shadow-inner">
                            <pre>
                                {`{
  "entityId": "123",
  "checklistId": "ck-pld-001",
  "prev_score": 12,
  "new_score": 18,
  "risk_level": "CRITICAL",
  "triggered_by": "manual_review",
  "metadata": {
    "device": "MacBook Pro",
    "browser": "Chrome 121.0.1"
  }
}`}
                            </pre>
                        </div>
                    </section>

                    {/* Hash Chain (Senior Touch) */}
                    <section className="space-y-4 pt-10 border-t border-border">
                        <div className="flex flex-col gap-1">
                            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <Hash className="w-4 h-4 text-emerald-500" />
                                Criptografia & Integridade
                            </h4>
                            <p className="text-xs text-muted-foreground">Trilha de auditoria encadeada SHA-256 para prevenir adulteração.</p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-bold uppercase text-muted-foreground">Hash do Evento Anterior</span>
                                <div className="p-2 rounded-lg bg-muted text-[10px] font-mono text-muted-foreground truncate border border-border">
                                    e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <ChevronRight className="w-5 h-5 text-emerald-500 rotate-90" />
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-bold uppercase text-emerald-500">Hash Atual (SHA-256)</span>
                                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-[10px] font-mono text-emerald-600 border border-emerald-500/30 truncate">
                                    a7ffd3c2e1b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}

function MetadataItem({ icon, label, value, subValue, isMono }: {
    icon: React.ReactNode,
    label: string,
    value: string,
    subValue?: string,
    isMono?: boolean
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-70">
                {icon}
                {label}
            </div>
            <div className="flex flex-col leading-tight">
                <span className={`text-sm font-bold text-foreground ${isMono ? 'font-mono tracking-tight' : ''}`}>{value}</span>
                {subValue && <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">{subValue}</span>}
            </div>
        </div>
    )
}
