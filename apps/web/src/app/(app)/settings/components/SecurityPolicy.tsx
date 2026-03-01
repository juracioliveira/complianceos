'use client'

import { useState } from 'react'
import { Lock, ShieldCheck, Globe, Clock, Plus, Trash2, Smartphone, Key } from 'lucide-react'

export default function SecurityPolicy() {
    const [ips, setIps] = useState(['187.12.45.0/24', '45.162.10.5/32'])

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Multi-Factor Authentication */}
            <div className="card p-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Smartphone className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="font-bold text-lg">Autenticação de Dois Fatores (MFA)</h3>
                        <p className="text-sm text-muted-foreground">Configurações de obrigatoriedade de TOTP.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <MfaRoleItem role="Administradores" required={true} />
                    <MfaRoleItem role="Compliance Officers" required={true} />
                    <MfaRoleItem role="Analistas de Risco" required={false} />
                    <MfaRoleItem role="Auditores" required={false} />
                </div>
            </div>

            {/* IP Allowlist */}
            <div className="card p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Globe className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                            <h3 className="font-bold text-lg">Allowlist de IPs (CIDR)</h3>
                            <p className="text-sm text-muted-foreground">Apenas IPs nesta lista poderão acessar o dashboard.</p>
                        </div>
                    </div>
                    <button className="btn btn-secondary btn-sm gap-2">
                        <Plus className="w-3.5 h-3.5" />
                        Adicionar IP
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ips.map(ip => (
                        <div key={ip} className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20 group">
                            <code className="text-sm font-bold text-foreground">{ip}</code>
                            <button className="p-1.5 hover:bg-red-50 text-muted-foreground hover:text-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sessions & Timeouts */}
            <div className="card p-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="font-bold text-lg">Sessão e Timeouts</h3>
                        <p className="text-sm text-muted-foreground">Controle de ociosidade e validade de tokens.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Idle Timeout (Ociosidade)</label>
                        <select className="input-field">
                            <option>15 minutos</option>
                            <option selected>30 minutos</option>
                            <option>1 hora</option>
                            <option>Estratégico (Nunca)</option>
                        </select>
                        <p className="text-[10px] text-muted-foreground italic">Deslogar automaticamente após inatividade.</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Validade do Token JWT</label>
                        <select className="input-field">
                            <option>4 horas</option>
                            <option selected>8 horas</option>
                            <option>24 horas</option>
                        </select>
                        <p className="text-[10px] text-muted-foreground italic">Exigir novo login após este tempo.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function MfaRoleItem({ role, required }: { role: string, required: boolean }) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/10 transition-colors">
            <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-md ${required ? 'bg-emerald-50 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                    <Lock className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-foreground">{role}</span>
            </div>

            <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase ${required ? 'text-emerald-500' : 'text-muted-foreground opacity-50'}`}>
                    {required ? 'Obrigatório' : 'Opcional'}
                </span>
                <button
                    className={`
            w-10 h-5 rounded-full relative transition-colors
            ${required ? 'bg-emerald-500' : 'bg-muted'}
          `}
                >
                    <div className={`
            absolute top-1 w-3 h-3 rounded-full bg-white transition-all
            ${required ? 'left-6' : 'left-1'}
          `} />
                </button>
            </div>
        </div>
    )
}
