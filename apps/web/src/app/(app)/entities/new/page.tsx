'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Building2, User, Loader2, AlertCircle } from 'lucide-react'
import { useApi } from '@/hooks/useApi'

export default function NewEntityPage() {
    const router = useRouter()
    const { fetchWithAuth } = useApi()
    const [loading, setLoading] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        taxId: '',
        entityType: 'CLIENTE',
        sector: '',
    })

    const formatTaxId = (value: string) => {
        const numbers = value.replace(/\D/g, '')
        if (numbers.length <= 11) {
            return numbers
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})/, '$1-$2')
                .replace(/(-\d{2})\d+?$/, '$1')
        }
        return numbers
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1/$2')
            .replace(/(\d{4})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setFormError(null)
        try {
            const taxIdClean = formData.taxId.replace(/\D/g, '')
            // Aceita 11 (CPF) ou 14 (CNPJ)
            if (taxIdClean.length !== 11 && taxIdClean.length !== 14) {
                throw new Error('Documento inválido. Use 11 dígitos para CPF ou 14 para CNPJ.')
            }

            const isCnpj = taxIdClean.length === 14

            await fetchWithAuth('/v1/entities', {
                method: 'POST',
                body: JSON.stringify({
                    name: formData.name,
                    cnpj: isCnpj ? taxIdClean : undefined,
                    cpf: !isCnpj ? taxIdClean : undefined,
                    entityType: formData.entityType,
                    sector: formData.sector,
                })
            })
            router.push('/entities')
        } catch (err: any) {
            setFormError(err.message || 'Erro ao criar entidade')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <a href="/entities" className="btn-secondary btn-sm h-10 w-10 p-0 flex items-center justify-center">
                    <ArrowLeft className="w-4 h-4" />
                </a>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Nova Entidade</h1>
                    <p className="text-sm text-muted-foreground font-medium">Cadastre um novo cliente, fornecedor ou parceiro para análise.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="card p-8 space-y-8">
                {formError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {formError}
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome Completo ou Razão Social</label>
                        <input
                            required
                            type="text"
                            className="input-field"
                            placeholder="Ex: Alpha Pagamentos S.A."
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">CPF ou CNPJ</label>
                        <input
                            required
                            type="text"
                            className="input-field"
                            placeholder="Apenas números"
                            value={formData.taxId}
                            onChange={e => setFormData({ ...formData, taxId: formatTaxId(e.target.value) })}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tipo de Entidade</label>
                        <select
                            className="input-field"
                            value={formData.entityType}
                            onChange={e => setFormData({ ...formData, entityType: e.target.value })}
                        >
                            <option value="CLIENTE">Cliente</option>
                            <option value="FORNECEDOR">Fornecedor</option>
                            <option value="PARCEIRO">Parceiro</option>
                            <option value="COLABORADOR">Colaborador</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Setor de Atuação</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Ex: Tecnologia, Varejo..."
                            value={formData.sector}
                            onChange={e => setFormData({ ...formData, sector: e.target.value })}
                        />
                    </div>
                </div>

                <div className="pt-6 border-t border-border flex justify-end">
                    <button
                        disabled={loading}
                        className="btn-primary gap-2 min-w-[160px]"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {loading ? 'Salvando...' : 'Cadastrar Entidade'}
                    </button>
                </div>
            </form>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Building2 className="w-4 h-4" />
                </div>
                <div>
                    <h4 className="font-bold text-sm text-foreground">Sincronização Automática</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Ao cadastrar uma empresa pelo CNPJ, buscaremos automaticamente os dados societários e iniciaremos a triagem de sanções.
                    </p>
                </div>
            </div>
        </div>
    )
}
