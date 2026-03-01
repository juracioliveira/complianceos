'use client'

import { useState } from 'react'
import {
    Building2,
    Globe,
    ShieldCheck,
    Bell,
    Zap,
    Lock,
    Save,
    Image as ImageIcon
} from 'lucide-react'
import LogoUpload from './components/LogoUpload'
import WebhookManager from './components/WebhookManager'
import SecurityPolicy from './components/SecurityPolicy'

type SettingsTab = 'general' | 'appearance' | 'security' | 'webhooks'

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>('general')
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        setSaving(true)
        // Simulação de salvamento
        await new Promise(resolve => setTimeout(resolve, 1500))
        setSaving(false)
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
                <button
                    onClick={handleSave}
                    disabled={saving}
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
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg border-b border-border pb-2">Informações da Organização</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome Comercial</label>
                                        <input type="text" className="input-field" defaultValue="Grupo Guinle Corretora" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">CNPJ Principal</label>
                                        <input type="text" className="input-field opacity-60" defaultValue="45.123.456/0001-99" disabled />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Domínio Autorizado</label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input type="text" className="input-field pl-10" defaultValue="grupoguinle.com.br" />
                                        </div>
                                    </div>
                                </div>
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
