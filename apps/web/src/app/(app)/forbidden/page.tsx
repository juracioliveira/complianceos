'use client'

import { ShieldAlert, Home, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { usePermissions } from '@/hooks/use-permissions'

export default function ForbiddenPage() {
    const router = useRouter()
    const { roleLabel } = usePermissions()

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
            <div className="w-24 h-24 rounded-3xl bg-red-50 flex items-center justify-center mb-8 shadow-inner border border-red-100">
                <ShieldAlert className="w-12 h-12 text-red-600" />
            </div>

            <h1 className="text-4xl font-display text-slate-900 mb-4 tracking-tight">
                Acesso não autorizado
            </h1>

            <p className="text-slate-500 max-w-md mb-2">
                Seu perfil <span className="font-bold text-slate-800">{roleLabel}</span> não possui permissão regulatória para acessar esta área protegida do ComplianceOS.
            </p>

            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-10">
                Incidente de Segurança GOV-01 Art. 2º (Acesso Negado)
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 rounded-xl h-12 px-6 border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-600"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                </button>

                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 rounded-xl h-12 px-6 bg-brand-600 hover:bg-brand-700 transition-colors text-sm font-medium text-white shadow-lg shadow-brand-200"
                >
                    <Home className="w-4 h-4" />
                    Painel Principal
                </button>
            </div>

            <p className="mt-16 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                ComplianceOS Security Infrastructure · 2026
            </p>
        </div>
    )
}
