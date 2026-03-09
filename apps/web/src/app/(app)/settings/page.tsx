'use client'

import { useState, useEffect } from 'react'
import {
    Building2,
    Globe,
    ShieldCheck,
    Bell,
    Zap,
    Save,
    Image as ImageIcon,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react'
import LogoUpload from './components/LogoUpload'
import WebhookManager from './components/WebhookManager'
import SecurityPolicy from './components/SecurityPolicy'
import { useApi } from '@/hooks/useApi'

type SettingsTab = 'general' | 'appearance' | 'security' | 'webhooks'

interface TenantSettings {
    id: string
    name: string
    cnpj: string
    plan: string
    authorizedDomain: string | null
    billingEmail: string | null
}

export default function SettingsPage() {
    const { fetchWithAuth } = useApi()
    const [activeTab, setActiveTab] = useState<SettingsTab>('general')
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saveError, setSaveError] = useState<string | null>(null)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [tenant, setTenant] = useState<TenantSettings | null>(null)
    const [name, setName] = useState('')
    const [authorizedDomain, setAuthorizedDomain] = useState('')

    useEffect(() => {
        fetchWithAuth('/v1/settings')
            .then((res) => {
                setTenant(res.data)
                setName(res.data.name)
                setAuthorizedDomain(res.data.authorizedDomain ?? '')
            })
            .catch(() => {/* silently ignore on load */})
            .finally(() => setLoading(false))
    }, [fetchWithAuth])

    const handleSave = async () => {
        setSaving(true)
        setSaveError(null)
        setSaveSuccess(false)
        try {
            await fetchWithAuth('/v1/settings', {
                method: 'PATCH',
                body: JSON.stringify({
                    name: name || undefined,
                    authorizedDomain: authorizedDomain || undefined,
                }),
            })
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        } catch (err: any) {
            setSaveError(err.message || 'Erro ao salvar configurações.')
        } finally {
            setSaving(false)
        }
    }

    const formatCnpj = (cnpj: string) => {
        const n = cnpj.replace(/\D/g, '')
        return n.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Configurações do Tenant</h1>
                    <p className="text-sm text-muted-foreground font-medium">
                        Gerencie as preferências globais, identidade visual e segurança da sua organização.
                    </p>
                </div>
                {activeTab === 'general' && (
                    <div className="flex items-center gap-3">
                        {saveSuccess && (
                            <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                                <CheckCircle2 className="w-4 h-4" /> Salvo
                            </div>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving || loading}
                            className="btn btn-primary gap-2 min-w-[120px]"
                        >
                            {saving ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {saving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-8 mt-4">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 shrink-0 flex flex-col gap-1">
                    <TabNav
                        active={activeTab === 'general'}
                        onClick={() => setActiveTab('general')}
                        icon={<Building2 className="w-4 h-4" />}
                        label="Geral"
                        description="Informações básicas"
                    />
                    <TabNav
                        active={activeTab === 'appearance'}
                        onClick={() => setActiveTab('appearance')}
                        icon={<ImageIcon className="w-4 h-4" />}
                        label="Identidade Visual"
                        description="Logos e Documentos"
                    />
                    <TabNav
                        active={activeTab === 'security'}
                        onClick={() => setActiveTab('security')}
                        icon={<ShieldCheck className="w-4 h-4" />}
                        label="Segurança"
                        description="MFA e Políticas de IP"
                    />
                    <TabNav
                        active={activeTab === 'webhooks'}
                        onClick={() => setActiveTab('webhooks')}
                        icon={<Zap className="w-4 h-4" />}
                        label="Webhooks & Integrações"
                        description="APIs e Eventos"
                    />
                </div>

                {/* Settings Content */}
                <div className="flex-1 max-w-4xl">
                    {activeTab === 'general' && (
                        <div className="card p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            {saveError && (
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {saveError}
                                </div>
                            )}
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg border-b border-border pb-2">Informações da Organização</h3>
                                {loading ? (
                                    <div className="h-24 flex items-center justify-center text-muted-foreground text-sm animate-pulse">
                                        Carregando configurações...
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome Comercial</label>
                                            <input
                                                type="text"
                                                className="input-field"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">CNPJ Principal</label>
                                            <input
                                                type="text"
                                                className="input-field opacity-60"
                                                value={tenant ? formatCnpj(tenant.cnpj) : ''}
                                                disabled
                                                readOnly
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Domínio Autorizado</label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    className="input-field pl-10"
                                                    value={authorizedDomain}
                                                    onChange={(e) => setAuthorizedDomain(e.target.value)}
                                                    placeholder="ex: suaempresa.com.br"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">Notificações de Sistema</h4>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        As alterações abaixo afetam como sua equipe recebe alertas críticos sobre KYC e Sanções.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'appearance' && <LogoUpload />}
                    {activeTab === 'security' && <SecurityPolicy />}
                    {activeTab === 'webhooks' && <WebhookManager />}
                </div>
            </div>
        </div>
    )
}

function TabNav({ active, onClick, icon, label, description }: {
    active: boolean,
    onClick: () => void,
    icon: React.ReactNode,
    label: string,
    description: string
}) {
    return (
        <button
            onClick={onClick}
            className={`
        flex items-center gap-4 p-4 rounded-xl transition-all text-left border
        ${active
                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 z-10'
                    : 'bg-transparent border-transparent text-muted-foreground hover:bg-accent/50'}
      `}
        >
            <div className={`
        w-10 h-10 rounded-lg flex items-center justify-center transition-colors
        ${active ? 'bg-white/20' : 'bg-muted'}
      `}>
                {icon}
            </div>
            <div className="flex flex-col">
                <span className={`font-bold text-sm ${active ? 'text-white' : 'text-foreground'}`}>{label}</span>
                <span className={`text-[10px] uppercase font-bold tracking-wider opacity-70 ${active ? 'text-white/80' : 'text-muted-foreground'}`}>
                    {description}
                </span>
            </div>
        </button>
    )
}
