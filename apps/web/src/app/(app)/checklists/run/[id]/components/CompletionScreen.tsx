'use client'

import {
    CheckCircle2,
    Activity,
    ArrowRight,
    FileText,
    ShieldCheck,
    RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useApi } from '@/hooks/useApi'

interface CompletionScreenProps {
    checklistId: string
    entityId: string | null
}

export default function CompletionScreen({ checklistId, entityId }: CompletionScreenProps) {
    const { fetchWithAuth } = useApi()
    const [processing, setProcessing] = useState(true)
    const [score, setScore] = useState<number | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function completeRun() {
            try {
                const res = await fetchWithAuth(`/v1/checklist-runs/${checklistId}/complete`, {
                    method: 'POST',
                    body: JSON.stringify({ summaryNotes: 'Completado via interface' })
                })
                setScore(res.data.score || 0)
            } catch (err: any) {
                console.error('Completion error', err)
                // Depending on the backend logic, it might already be COMPLETED, so handle politely
                if (err.message?.includes('COMPLETED') || err.message?.includes('already')) {
                    const fallback = await fetchWithAuth(`/v1/checklist-runs/${checklistId}`).catch(() => ({ data: {} }))
                    setScore(fallback.data?.score || 0)
                } else {
                    setError('Erro ao finalizar o checklist.')
                }
            } finally {
                setProcessing(false)
            }
        }
        completeRun()
    }, [checklistId, fetchWithAuth])

    return (
        <div className="flex flex-col items-center justify-center py-12 md:py-20 animate-in fade-in zoom-in-95 duration-700">
            <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping" />
                <CheckCircle2 className="w-12 h-12 text-emerald-500 relative z-10" />
            </div>

            <h2 className="text-3xl font-bold tracking-tight mb-3">Avaliação Concluída!</h2>
            <p className="text-muted-foreground text-center max-w-md mb-10 leading-relaxed font-medium">
                As respostas foram enviadas e estão sendo processadas pelo nosso motor de análise de risco.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-12">
                <div className="card p-6 flex flex-col items-center text-center gap-4 group hover:border-primary/50 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                        {processing ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Activity className="w-6 h-6" />}
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground">Score de Risco</h4>
                        <p className="text-xs text-muted-foreground mt-1 px-4">
                            {processing ? 'O motor BullMQ está calculando a pontuação...' : 'A pontuação foi calculada e atualizada no dashboard.'}
                        </p>
                    </div>
                    {!processing && !error && (
                        <div className="text-3xl font-black text-primary">{score} <span className="text-sm font-bold opacity-60">pts</span></div>
                    )}
                    {error && <div className="text-sm text-red-500 font-bold">{error}</div>}

                </div>

                <div className="card p-6 flex flex-col items-center text-center gap-4 group hover:border-primary/50 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground">Dossiê Gerado</h4>
                        <p className="text-xs text-muted-foreground mt-1 px-4">
                            O relatório final RAT (Relatório de Análise Técnica) já está disponível.
                        </p>
                    </div>
                    {!processing && (
                        <button className="btn btn-secondary btn-xs gap-2 mt-2">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Ver Documento
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4">
                <Link
                    href={`/entities/${entityId || ''}`}
                    className="btn btn-primary min-w-[200px] gap-2"
                >
                    Voltar para Entidade
                    <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                    href="/dashboard"
                    className="btn btn-secondary min-w-[200px]"
                >
                    Ir para Dashboard
                </Link>
            </div>
        </div>
    )
}
