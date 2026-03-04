'use client'

import { Shield, MapPin, Building2, User, ExternalLink, Calendar } from 'lucide-react'
import { RiskBadge } from '@/components/ui/RiskBadge'

interface EntityHeaderProps {
    id: string
}

export default function EntityHeader({ id }: EntityHeaderProps) {
    // Mock para desenvolvimento UI premium
    const entity = {
        name: 'Alpha Pagamentos S.A.',
        taxId: '12.345.678/0001-90',
        type: 'Pessoa Jurídica',
        status: 'ACTIVE',
        kycStatus: 'APPROVED',
        riskScore: 78,
        riskLevel: 'HIGH',
        address: 'Av. Paulista, 1000 - São Paulo, SP',
        lastSync: '10 minutos atrás'
    }

    return (
        <div className="card p-6 overflow-hidden relative">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Building2 className="w-32 h-32" />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-inner">
                        <Building2 className="w-8 h-8" />
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-foreground">{entity.name}</h2>
                            <span className="badge badge-green">Ativo</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-foreground/80">{entity.taxId}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" />
                                {entity.type}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" />
                                {entity.address}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6 p-4 bg-muted/30 rounded-xl border border-border/50">
                    <div className="flex flex-col items-center gap-1 px-4 border-r border-border/50">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status KYC</span>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-sm font-bold text-emerald-600">APROVADO</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-1 px-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Risco Global</span>
                        <div className="mt-1">
                            <RiskBadge
                                level={entity.riskLevel as any}
                                score={entity.riskScore}
                                size="md"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Vencimento KYC: 12/05/2026
                    </span>
                    <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Compliance Officer: Maria Silva
                    </span>
                </div>
                <button className="flex items-center gap-1 hover:text-primary transition-colors">
                    <ExternalLink className="w-3 h-3" />
                    Ver na Receita Federal
                </button>
            </div>
        </div>
    )
}
