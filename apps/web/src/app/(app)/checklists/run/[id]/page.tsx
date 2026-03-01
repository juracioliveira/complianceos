'use client'

import { useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
    ShieldCheck,
    ChevronRight,
    ChevronLeft,
    Save,
    CheckCircle2,
    AlertCircle,
    Clock
} from 'lucide-react'
import WizardShell from './components/WizardShell'

export default function ChecklistRunPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    const id = params.id as string
    const entityId = searchParams.get('entityId')

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
                    <p className="text-muted-foreground text-sm font-medium">
                        Entidade: <span className="text-foreground font-semibold">Alpha Pagamentos S.A.</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end mr-4 hidden md:flex">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Progresso Total</span>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden border border-border">
                                <div className="h-full bg-primary transition-all duration-500" style={{ width: '45%' }} />
                            </div>
                            <span className="text-xs font-bold text-foreground">45%</span>
                        </div>
                    </div>
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
