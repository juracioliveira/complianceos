'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
    ShieldCheck,
} from 'lucide-react'
import WizardShell from './components/WizardShell'
import { useApi } from '@/hooks/useApi'

export default function ChecklistRunPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    const { fetchWithAuth } = useApi()
    const id = params.id as string
    const entityId = searchParams.get('entityId')
    const [entityName, setEntityName] = useState<string | null>(null)

    useEffect(() => {
        if (!entityId) return
        fetchWithAuth(`/v1/entities/${entityId}`)
            .then((res) => {
                setEntityName(res?.data?.name ?? null)
            })
            .catch(() => {/* silently ignore */})
    }, [entityId, fetchWithAuth])

    return (
        <div className="max-w-5xl mx-auto py-4 md:py-8 px-4 animate-fade-in">
            {/* Wizard Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
                        <ShieldCheck className="w-4 h-4" />
                        Execução de Compliance
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Checklist de Due Diligence</h1>
                    {entityName && (
                        <p className="text-muted-foreground text-sm font-medium">
                            Entidade: <span className="text-foreground font-semibold">{entityName}</span>
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="btn btn-secondary btn-sm"
                    >
                        Sair e Salvar
                    </button>
                </div>
            </div>

            <WizardShell checklistId={id} entityId={entityId} />
        </div>
    )
}
