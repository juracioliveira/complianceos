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

    if (loading) {
        return (
            <div className="card p-6 flex items-center gap-3 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Carregando entidade...</span>
            </div>
        )
    }

    if (error || !entity) {
        return (
            <div className="card p-6 flex items-center gap-3 text-red-500">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error ?? 'Entidade não encontrada.'}</span>
            </div>
        )
    }

    const kyc = KYC_LABEL[entity.kycStatus] ?? { label: entity.kycStatus ?? '—', color: 'text-muted-foreground', dot: 'bg-muted' }
    const cnpjFormatted = entity.cnpj
        ? entity.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
        : entity.cpf ?? '—'

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
                            <span className={`badge ${entity.status === 'ACTIVE' ? 'badge-green' : entity.status === 'BLOCKED' ? 'badge-red' : 'badge-slate'}`}>
                                {entity.status === 'ACTIVE' ? 'Ativo' : entity.status === 'BLOCKED' ? 'Bloqueado' : entity.status}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-foreground/80">{cnpjFormatted}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" />
                                {entity.entityType || 'Pessoa Jurídica'}
                            </div>
                            {entity.sector && (
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {entity.sector}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6 p-4 bg-muted/30 rounded-xl border border-border/50">
                    <div className="flex flex-col items-center gap-1 px-4 border-r border-border/50">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status KYC</span>
                        <div className="flex items-center gap-2 mt-1">
                            <div className={`w-2 h-2 rounded-full ${kyc.dot} shadow-[0_0_8px_rgba(16,185,129,0.5)]`} />
                            <span className={`text-sm font-bold ${kyc.color}`}>{kyc.label}</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-1 px-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Risco Global</span>
                        <div className="mt-1">
                            <RiskBadge
                                level={(entity.riskLevel ?? 'UNKNOWN') as any}
                                score={entity.riskScore ?? undefined}
                                size="md"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                <div className="flex items-center gap-4">
                    {entity.kycCompletedAt && (
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            KYC concluído em: {new Date(entity.kycCompletedAt).toLocaleDateString('pt-BR')}
                        </span>
                    )}
                    {entity.lastAssessedAt && (
                        <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Última avaliação: {new Date(entity.lastAssessedAt).toLocaleDateString('pt-BR')}
                        </span>
                    )}
                </div>
                {entity.isPep && (
                    <span className="flex items-center gap-1 text-amber-500">
                        ⚠ PEP Detectado
                    </span>
                )}
            </div>
        </div>
    )
}
