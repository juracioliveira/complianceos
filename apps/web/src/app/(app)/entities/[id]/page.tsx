'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
    Shield,
    History,
    FileText,
    Activity,
    ArrowLeft,
    Download,
    Loader2,
    AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import EntityHeader from './components/EntityHeader'
import RiskEvolutionChart from './components/RiskEvolutionChart'
import ChecklistTimeline from './components/ChecklistTimeline'
import DocumentVault from './components/DocumentVault'
import { useApi } from '@/hooks/useApi'
import { formatDate } from '@/lib/utils'

type TabType = 'overview' | 'checklists' | 'documents' | 'audit'

export default function EntityDetailPage() {
    const params = useParams()
    const id = params.id as string
    const [activeTab, setActiveTab] = useState<TabType>('overview')
    const { fetchWithAuth } = useApi()
    const [entity, setEntity] = useState<any>(null)

    useEffect(() => {
        if (!id) return
        fetchWithAuth(`/v1/entities/${id}`)
            .then((res) => setEntity(res?.data ?? res))
            .catch(() => { })
    }, [id, fetchWithAuth])

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            {/* Breadcrumb & Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/entities"
                        className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Detalhes da Entidade</h1>
                        <p className="text-sm text-muted-foreground font-medium">ID: {id}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="btn btn-secondary btn-sm gap-2">
                        <Download className="w-4 h-4" />
                        Exportar Dossiê
                    </button>
                    <Link href={`/checklists?entityId=${id}`} className="btn btn-primary btn-sm gap-2">
                        <Activity className="w-4 h-4" />
                        Nova Avaliação
                    </Link>
                </div>
            </div>

            {/* Entity Header */}
            <EntityHeader id={id} />

            {/* Tabs Navigation */}
            <div className="flex items-center gap-1 border-b border-border">
                <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<Shield className="w-4 h-4" />} label="Visão Geral" />
                <TabButton active={activeTab === 'checklists'} onClick={() => setActiveTab('checklists')} icon={<History className="w-4 h-4" />} label="Checklists" />
                <TabButton active={activeTab === 'documents'} onClick={() => setActiveTab('documents')} icon={<FileText className="w-4 h-4" />} label="Documentos" />
                <TabButton active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} icon={<Activity className="w-4 h-4" />} label="Audit Trail" />
            </div>

            {/* Tab Content */}
            <div className="mt-2">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            <RiskEvolutionChart id={id} />
                            <ChecklistTimeline id={id} limit={5} title="Últimas Avaliações" />
                        </div>
                        <div className="flex flex-col gap-6">
                            {/* Info Card — real data from entity */}
                            <div className="card p-6">
                                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
                                    Informações Críticas
                                </h3>
                                {entity ? (
                                    <div className="space-y-4">
                                        <InfoItem label="Tipo" value={entity.entityType ?? '—'} />
                                        <InfoItem label="Setor" value={entity.sector ?? '—'} />
                                        <InfoItem label="PEP" value={entity.isPep ? 'Sim ⚠' : 'Não'} />
                                        <InfoItem label="KYC Status" value={entity.kycStatus ?? '—'} />
                                        {entity.kycCompletedAt && (
                                            <InfoItem label="KYC Concluído em" value={formatDate(entity.kycCompletedAt)} />
                                        )}
                                        {entity.lastAssessedAt && (
                                            <InfoItem label="Última Avaliação" value={formatDate(entity.lastAssessedAt)} />
                                        )}
                                        {entity.corporateData?.dataAbertura && (
                                            <InfoItem label="Data de Fundação" value={entity.corporateData.dataAbertura} />
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Carregando...
                                    </div>
                                )}
                            </div>
                            <DocumentVault id={id} limit={3} />
                        </div>
                    </div>
                )}

                {activeTab === 'checklists' && (
                    <ChecklistTimeline id={id} showFilters />
                )}

                {activeTab === 'documents' && (
                    <DocumentVault id={id} />
                )}

                {activeTab === 'audit' && (
                    <div className="card p-6 text-center py-20 bg-muted/20">
                        <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground">Audit Trail Específico</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto text-sm mt-1">
                            Rastreabilidade completa de todas as alterações cadastrais e de risco desta entidade.
                        </p>
                        <Link href={`/audit?resourceId=${id}`} className="btn btn-secondary btn-sm mt-4 inline-flex">
                            Ver no Audit Trail →
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

interface TabButtonProps {
    active: boolean
    onClick: () => void
    icon: React.ReactNode
    label: string
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative
                ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}
            `}
        >
            {icon}
            {label}
            {active && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-in fade-in slide-in-from-bottom-1" />
            )}
        </button>
    )
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-1 border-l-2 border-muted pl-3 py-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{label}</span>
            <span className="text-sm font-semibold text-foreground">{value}</span>
        </div>
    )
}
