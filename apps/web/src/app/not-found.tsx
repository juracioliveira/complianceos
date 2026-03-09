import Link from 'next/link'
import { ShieldCheck, ArrowLeft } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <h1 className="text-6xl font-bold text-foreground mb-2">404</h1>
                <h2 className="text-xl font-bold text-foreground mb-3">Página não encontrada</h2>
                <p className="text-sm text-muted-foreground mb-8">
                    A página que você está procurando não existe ou foi movida.
                </p>
                <Link href="/dashboard" className="btn btn-primary gap-2 inline-flex">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao Dashboard
                </Link>
            </div>
        </div>
    )
}
