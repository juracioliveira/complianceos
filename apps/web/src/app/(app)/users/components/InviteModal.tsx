'use client'

import { useState } from 'react'
import {
    X,
    Mail,
    Shield,
    Send,
    ShieldCheck,
    ShieldAlert,
    Briefcase,
    History,
    CheckCircle2
} from 'lucide-react'

interface InviteModalProps {
    isOpen: boolean
    onClose: () => void
}

type Role = 'ADMIN' | 'CCO' | 'ANALYST' | 'AUDITOR'

export default function InviteModal({ isOpen, onClose }: InviteModalProps) {
    const [email, setEmail] = useState('')
    const [role, setRole] = useState<Role>('ANALYST')
    const [sending, setSending] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        setSending(true)
        // Simulação de convite via API
        await new Promise(resolve => setTimeout(resolve, 1500))
        setSending(false)
        setSuccess(true)
        setTimeout(() => {
            setSuccess(false)
            onClose()
            setEmail('')
        }, 2000)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md card p-0 overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-300">
                {!success ? (
                    <form onSubmit={handleInvite}>
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Convidar para Time</h3>
                                    <p className="text-xs text-muted-foreground">O convite expira em 48 horas.</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors"
                                aria-label="Botão de fechamento"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">E-mail do Usuário</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="email"
                                        required
                                        className="input-field pl-10"
                                        placeholder="ex: nome@empresa.com.br"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Papel & Permissões</label>
                                <div className="grid grid-cols-1 gap-2">
                                    <RoleOption
                                        selected={role === 'ADMIN'}
                                        onClick={() => setRole('ADMIN')}
                                        title="Administrador"
                                        desc="Acesso total ao tenant e configurações."
                                        icon={<Shield className="w-4 h-4" />}
                                    />
                                    <RoleOption
                                        selected={role === 'CCO'}
                                        onClick={() => setRole('CCO')}
                                        title="Chief Compliance Officer"
                                        desc="Aprovações e gestão de políticas de risco."
                                        icon={<ShieldCheck className="w-4 h-4" />}
                                    />
                                    <RoleOption
                                        selected={role === 'ANALYST'}
                                        onClick={() => setRole('ANALYST')}
                                        title="Analista"
                                        desc="Execução de checklists e análise diária."
                                        icon={<Briefcase className="w-4 h-4" />}
                                    />
                                    <RoleOption
                                        selected={role === 'AUDITOR'}
                                        onClick={() => setRole('AUDITOR')}
                                        title="Auditor"
                                        desc="Acesso de leitura para registros e auditoria."
                                        icon={<History className="w-4 h-4" />}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-border bg-muted/20 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn btn-secondary flex-1"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={sending}
                                className="btn btn-primary flex-1 gap-2"
                            >
                                {sending ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                                {sending ? 'Enviando...' : 'Enviar Convite'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="p-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 mb-6">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold">Convite Enviado!</h3>
                        <p className="text-sm text-muted-foreground mt-2 max-w-[240px]">
                            Enviamos as instruções de onboarding para <strong>{email}</strong>.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

function RoleOption({ selected, onClick, title, desc, icon }: {
    selected: boolean,
    onClick: () => void,
    title: string,
    desc: string,
    icon: React.ReactNode
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
        flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left
        ${selected
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-transparent bg-muted/40 hover:bg-muted/60'}
      `}
        >
            <div className={`
        mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0
        ${selected ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-card border border-border text-muted-foreground'}
      `}>
                {icon}
            </div>
            <div>
                <h4 className={`text-sm font-bold ${selected ? 'text-primary' : 'text-foreground'}`}>{title}</h4>
                <p className="text-[10px] text-muted-foreground font-medium leading-tight mt-0.5">{desc}</p>
            </div>
        </button>
    )
}

function UserPlus({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" x2="19" y1="8" y2="14" />
            <line x1="16" x2="22" y1="11" y2="11" />
        </svg>
    )
}
