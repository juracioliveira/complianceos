'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
    Shield,
    History,
    FileText,
    Activity,
    ArrowLeft,
    Download,
    Loader2,
    CheckCircle2,
    ShieldAlert,
    AlertCircle,
    LayoutDashboard,
    ShieldCheck
} from 'lucide-react'
import Link from 'next/link'
import { ProtectedAction } from '@/components/rbac/ProtectedAction'
import EntityHeader from './components/EntityHeader'
import RiskEvolutionChart from './components/RiskEvolutionChart'
import ChecklistTimeline from './components/ChecklistTimeline'
import DocumentVault from './components/DocumentVault'
import { useApi } from '@/hooks/useApi'
import { usePermissions } from '@/hooks/use-permissions'
import { formatDate, cn } from '@/lib/utils'

type TabType = 'overview' | 'checklists' | 'documents' | 'audit'

export default function EntityDetailPage() {
    const params = useParams()
    const id = params.id as string
    const [activeTab, setActiveTab] = useState<TabType>('overview')
    const { fetchWithAuth } = useApi()
    const { role, can } = usePermissions()
    const [entity, setEntity] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const isReadOnly = role === 'READONLY'

    // Definir abas permitidas baseadas em RBAC
    const availableTabs = ([
        { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
        { id: 'checklists', label: 'Avaliações', icon: CheckCircle2 },
        { id: 'documents', label: 'Documentos', icon: FileText },
        { id: 'audit', label: 'Auditoria', icon: ShieldCheck },
    ] as { id: TabType; label: string; icon: any }[]).filter(tab => {
        if (tab.id === 'checklists') return can('view', 'checklist_runs')
        if (tab.id === 'documents') return can('view', 'documents')
        if (tab.id === 'audit') return can('view', 'audit_trail')
        return true
    })

    useEffect(() => {
        if (!id) return
        setLoading(true)
        fetchWithAuth(`/v1/entities/${id}`)
            .then((res) => {
                setEntity(res?.data ?? res)
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
            })
    }, [id, fetchWithAuth])

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
            {/* Breadcrumb & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
                <div className="flex items-center gap-5">
                    <Link
                        href="/entities"
                        className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-brand-200 transition-all text-slate-400 hover:text-brand-600 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest">Dossiê Regulatório</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest leading-none">ID: {id}</span>
                        </div>
                        <h1 className="font-display text-4xl text-slate-900 tracking-tight">Análise de <span className="text-brand-600">Conformidade</span></h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <ProtectedAction action="export" resource="alert_cases">
                        <button className="flex items-center gap-2.5 h-11 px-5 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all text-[13px] font-bold text-slate-600">
                            <Download className="w-4 h-4 text-brand-600" />
                            Exportar Relatório
                        </button>
                    </ProtectedAction>

                    <ProtectedAction action="create" resource="checklist_runs">
                        <Link href={`/checklists?entityId=${id}`} className="flex items-center gap-2 h-11 bg-brand-600 text-white shadow-lg shadow-brand-600/20 px-6 rounded-xl font-bold text-[13px] hover:bg-brand-700 transition-colors">
                            <Activity className="w-4 h-4" />
                            Nova Avaliação
                        </Link>
                    </ProtectedAction>
                </div>
            </div>

            {/* Entity Header */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-cyan-500 rounded-3xl blur opacity-[0.05] group-hover:opacity-[0.08] transition duration-1000"></div>
                <div className="relative">
                    <EntityHeader id={id} />
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex items-center gap-1 p-1.5 bg-slate-100/50 border border-slate-200/60 rounded-2xl w-fit">
                {availableTabs.map((tab) => (
                    <TabButton
                        key={tab.id}
                        active={activeTab === tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        icon={React.createElement(tab.icon, { className: "w-4 h-4" })}
                        label={tab.label}
                    />
                ))}
            </div>

            {/* Tab Content */}
            <div className="mt-4">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {!isReadOnly ? (
                                <>
                                    <RiskEvolutionChart id={id} />
                                    <ChecklistTimeline id={id} limit={5} title="Avaliações Recentes" />
                                </>
                            ) : (
                                <div className="card p-12 flex flex-col items-center justify-center text-slate-400 gap-4 bg-slate-50/20 border border-dashed border-slate-200 rounded-3xl">
                                    <ShieldAlert className="w-12 h-12 opacity-20" />
                                    <div className="text-center">
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Acesso Restrito</p>
                                        <p className="text-xs text-slate-400 max-w-[250px]">Informações analíticas e de risco não estão disponíveis para seu perfil regulatório.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            {/* Technical Specs Card */}
                            {can('view', 'risk_assessments') && (
                                <div className="card shadow-md border-slate-200/60 overflow-hidden relative bg-white rounded-3xl">
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                                        <Shield className="w-24 h-24" />
                                    </div>
                                    <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Metadados de Governança</h3>
                                    </div>
                                    <div className="p-6 space-y-px">
                                        <InfoItem label="ID de Referência" value={id.substring(0, 18).toUpperCase()} mono />
                                        <InfoItem label="Protocolo" value="GOV-01-AUTH-2026" mono />
                                        <InfoItem label="Hash Integridade" value={`SHA256:${id.substring(0, 8)}...`} mono />
                                    </div>
                                </div>
                            )}

                            {/* Documentos Recentes Quick View */}
                            {can('view', 'documents') && (
                                <DocumentVault id={id} limit={3} />
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'checklists' && can('view', 'checklist_runs') && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <ChecklistTimeline id={id} />
                    </div>
                )}

                {activeTab === 'documents' && can('view', 'documents') && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <DocumentVault id={id} />
                    </div>
                )}

                {activeTab === 'audit' && can('view', 'audit_trail') && (
                    <div className="card shadow-xl border-slate-200/60 p-12 text-center bg-white relative overflow-hidden rounded-3xl">
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 shadow-inner text-slate-300">
                                <Activity className="w-8 h-8" />
                            </div>
                            <h3 className="font-display text-2xl text-slate-900 mb-2">Trilha de Auditoria Individual</h3>
                            <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed mb-8">
                                Acesse o histórico imutável de todas as ações corporativas, mudanças de risco e uploads de documentos.
                            </p>
                            <Link href={`/audit?resourceId=${id}`} className="flex items-center h-11 px-8 rounded-xl font-bold text-[11px] uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-colors">
                                Abrir Audit Trail Completo →
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2.5 px-6 py-2.5 text-[13px] font-bold transition-all rounded-xl relative",
                active
                    ? "bg-white text-brand-700 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/50 border border-transparent"
            )}
        >
            {icon}
            {label}
        </button>
    )
}

function InfoItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
            <span className={cn(
                "text-[13px] font-bold text-slate-700",
                mono && "font-mono text-[11px] text-slate-500"
            )}>
                {value}
            </span>
        </div>
    )
}
