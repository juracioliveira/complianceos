'use client'

import { useEffect, useState } from 'react'
import { Shield, MapPin, Building2, User, Calendar, Loader2, AlertCircle } from 'lucide-react'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { useApi } from '@/hooks/useApi'

interface EntityHeaderProps {
    id: string
}

const KYC_LABEL: Record<string, { label: string; color: string; dot: string }> = {
    APPROVED: { label: 'APROVADO', color: 'text-emerald-600', dot: 'bg-emerald-500' },
    PENDING: { label: 'PENDENTE', color: 'text-amber-600', dot: 'bg-amber-500' },
    IN_PROGRESS: { label: 'EM REVISÃO', color: 'text-blue-600', dot: 'bg-blue-500' },
    REJECTED: { label: 'REJEITADO', color: 'text-red-600', dot: 'bg-red-500' },
}

import { KycStatusBadge } from '@/components/ui/KycStatusBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { cn, formatCNPJ } from '@/lib/utils'
import { usePermissions } from '@/hooks/use-permissions'

export default function EntityHeader({ id }: EntityHeaderProps) {
    const { fetchWithAuth } = useApi()
    const [entity, setEntity] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) return
        setLoading(true)
        fetchWithAuth(`/v1/entities/${id}`)
            .then((res) => {
                setEntity(res?.data ?? res)
            })
            .catch((err) => {
                console.error('EntityHeader fetch error', err)
                setError('Não foi possível carregar os dados da entidade.')
            })
            .finally(() => setLoading(false))
    }, [id, fetchWithAuth])

    const { role } = usePermissions()
    const isReadOnly = role === 'READONLY'

    if (loading) {
        return (
            <div className="card p-12 flex flex-col items-center justify-center gap-4 text-slate-400 bg-white/50">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Recuperando registros mestre...</span>
            </div>
        )
    }

    if (error || !entity) {
        return (
            <div className="card p-8 flex items-center gap-4 text-red-500 bg-red-50/30 border-red-100">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-bold uppercase tracking-wide">Erro de Integridade</p>
                    <p className="text-xs opacity-80">{error ?? 'Entidade não encontrada no diretório central.'}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="card p-8 overflow-hidden bg-white shadow-xl hover:shadow-2xl transition-all duration-500 border-slate-200/60 relative">
            {/* Glossy Overlay Decor */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-50/30 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 pointer-events-none">
                <Building2 className="w-48 h-48" />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
                <div className="flex items-start gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
                        <Building2 className="w-10 h-10" strokeWidth={1.5} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="font-display text-4xl text-slate-900 tracking-tight leading-none">{entity.name}</h2>
                            <StatusBadge status={entity.status} className="h-6 px-3 text-[10px] font-bold uppercase tracking-widest shadow-sm" />
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold font-mono text-slate-400">IDENTIFICADOR:</span>
                                <span className="text-[13px] font-bold text-slate-700 tracking-wide">
                                    {isReadOnly ? '•••••••••••' : formatCNPJ(entity.cnpj || entity.cpf || '')}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{entity.entityType || 'Pessoa Jurídica'}</span>
                            </div>
                            {entity.sector && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{entity.sector}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-stretch bg-slate-50/80 p-5 rounded-2xl border border-slate-200/60 shadow-inner backdrop-blur-sm">
                    <div className="flex flex-col items-center justify-center gap-1.5 px-6 border-r border-slate-200">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Status de Identidade</span>
                        <KycStatusBadge status={entity.kycStatus} />
                    </div>

                    <div className="flex flex-col items-center justify-center gap-1.5 px-6">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Score de Risco</span>
                        <RiskBadge
                            level={(entity.riskLevel ?? 'UNKNOWN') as any}
                            score={entity.riskScore ?? undefined}
                            size="md"
                        />
                    </div>
                </div>
            </div>

            {entity.isPep && !isReadOnly && (
                <div className="mt-8 flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl animate-pulse">
                    <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                        <AlertCircle className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Alerta Crítico: Pessoa Exposta Politicamente (PEP)</p>
                        <p className="text-[10px] text-red-600 font-medium leading-tight">Monitoramento contínuo obrigatório conforme Resolução BCB nº 119.</p>
                    </div>
                </div>
            )}
        </div>
    )
}
