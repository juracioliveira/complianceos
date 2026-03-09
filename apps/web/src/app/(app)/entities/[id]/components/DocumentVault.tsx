'use client'

import { useEffect, useState } from 'react'
import { FileText, Download, ShieldCheck, Loader2, FolderOpen, ExternalLink } from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { cn, formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation' // Added useRouter for navigation

interface DocumentVaultProps {
    id: string
    limit?: number
}

export default function DocumentVault({ id, limit }: DocumentVaultProps) {
    const { fetchWithAuth } = useApi()
    const [documents, setDocuments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter() // Initialize useRouter

    useEffect(() => {
        if (!id) return
        setLoading(true)
        const params = new URLSearchParams()
        params.set('entityId', id)
        if (limit) params.set('limit', String(limit))
        fetchWithAuth(`/v1/documents?${params.toString()}`)
            .then((res) => setDocuments(res?.data ?? []))
            .catch((err) => console.error('DocumentVault fetch error', err))
            .finally(() => setLoading(false))
    }, [id, limit, fetchWithAuth])

    const handleDownload = async (doc: any) => {
        if (doc.status !== 'READY' && doc.status !== 'COMPLETED') return
        try {
            const res = await fetchWithAuth(`/v1/documents/${doc.id}/download`)
            if (res?.data?.url) {
                window.open(res.data.url, '_blank')
            }
        } catch (err) {
            console.error('Download error', err)
        }
    }

    return (
        <div className="card shadow-lg border-slate-200/60 overflow-hidden bg-white/50 backdrop-blur-sm flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                        <FileText className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest leading-none">Cofre de Documentos</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Repositório Criptografado</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Sincronizando arquivos...</span>
                </div>
            ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-4">
                    <div className="w-16 h-16 rounded-3xl bg-white border border-slate-100 flex items-center justify-center shadow-inner">
                        <FolderOpen className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-widest">Nenhum registro encontrado</p>
                </div>
            ) : (
                <div className="flex flex-col divide-y divide-slate-100">
                    {documents.map((doc) => (
                        <div key={doc.id} className="group flex items-center justify-between p-5 hover:bg-brand-50 transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600 transition-all duration-500 shadow-sm">
                                    <FileText className="w-6 h-6" strokeWidth={1.5} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[13px] font-bold text-slate-900 group-hover:text-brand-700 transition-colors uppercase tracking-tight line-clamp-1">{doc.title ?? doc.docType ?? `Documento ${doc.id.substring(0, 8)}`}</span>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                        <span className="text-brand-600/70">{doc.docType ?? 'PDF'}</span>
                                        {doc.fileSizeBytes && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                <span>{Math.round(doc.fileSizeBytes / 1024)} KB</span>
                                            </>
                                        )}
                                        {doc.createdAt && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                <span className="font-mono">{formatDate(doc.createdAt)}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {doc.contentHash && (
                                    <button
                                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-100 text-slate-300 hover:text-brand-600 hover:bg-white hover:border-brand-200 transition-all shadow-sm group/hash"
                                        title={`SHA-256: ${doc.contentHash}`}
                                    >
                                        <ShieldCheck className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    className={cn(
                                        "w-8 h-8 flex items-center justify-center rounded-lg transition-all shadow-sm",
                                        (doc.status === 'READY' || doc.status === 'COMPLETED')
                                            ? "bg-brand-600 text-white hover:bg-brand-700 shadow-brand-500/20"
                                            : "bg-slate-100 text-slate-300 cursor-not-allowed"
                                    )}
                                    disabled={doc.status !== 'READY' && doc.status !== 'COMPLETED'}
                                    onClick={() => handleDownload(doc)}
                                    title="Download Seguro"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {limit && documents.length >= limit && (
                <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                    <button
                        className="w-full h-10 text-[10px] font-bold text-slate-500 hover:text-brand-700 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all uppercase tracking-widest flex items-center justify-center gap-2 group"
                        onClick={() => router.push(`/entities/${id}/documents`)}
                    >
                        Acessar Repositório Completo
                        <ExternalLink className="w-3 h-3 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            )}
        </div>
    )
}
