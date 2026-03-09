'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Pode integrar com serviço de monitoramento de erros aqui (ex: Sentry)
    }, [error])

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/30 flex items-center justify-center text-red-600 mx-auto mb-6">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-3">Algo deu errado</h2>
                <p className="text-sm text-muted-foreground mb-8">
                    Ocorreu um erro inesperado. Nossa equipe foi notificada.
                </p>
                <button onClick={reset} className="btn btn-primary gap-2 inline-flex">
                    <RefreshCw className="w-4 h-4" />
                    Tentar novamente
                </button>
            </div>
        </div>
    )
}
