'use client'

import { useEffect, useState } from 'react'
import { FileText, Download, ShieldCheck, Loader2, FolderOpen, ExternalLink } from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { formatDate } from '@/lib/utils'

interface DocumentVaultProps {
    id: string
    limit?: number
}

export default function DocumentVault({ id, limit }: DocumentVaultProps) {
    const { fetchWithAuth } = useApi()
    const [documents, setDocuments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

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
        <div className="card h-full flex flex-col">
            <div className="p-5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <h3 className="font-bold">Cofre de Documentos</h3>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center gap-3 p-8 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Carregando documentos...</span>
                </div>
            ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3 flex-1">
                    <FolderOpen className="w-10 h-10 opacity-20" />
                    <p className="text-sm">Nenhum documento gerado para esta entidade.</p>
                </div>
            ) : (
                <div className="flex flex-col flex-1 divide-y divide-border/50">
                    {documents.map((doc) => (
                        <div key={doc.id} className="group flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-foreground line-clamp-1">{doc.title ?? doc.docType ?? `Documento ${doc.id.substring(0, 8)}`}</span>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">
                                        <span>{doc.docType ?? 'PDF'}</span>
                                        {doc.fileSizeBytes && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-border" />
                                                <span>{Math.round(doc.fileSizeBytes / 1024)} KB</span>
                                            </>
                                        )}
                                        {doc.createdAt && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-border" />
                                                <span>{formatDate(doc.createdAt)}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {doc.contentHash && (
                                    <button className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground" title={`SHA-256: ${doc.contentHash}`}>
                                        <ShieldCheck className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    className={`p-2 rounded-lg transition-colors ${(doc.status === 'READY' || doc.status === 'COMPLETED') ? 'hover:bg-primary/10 text-primary' : 'text-muted-foreground/30 cursor-not-allowed'}`}
                                    disabled={doc.status !== 'READY' && doc.status !== 'COMPLETED'}
                                    onClick={() => handleDownload(doc)}
                                    title="Baixar PDF"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {limit && documents.length >= limit && (
                <div className="p-3 bg-muted/10 border-t border-border mt-auto">
                    <button className="w-full text-xs font-bold text-muted-foreground hover:text-primary transition-colors py-2 flex items-center justify-center gap-1">
                        Ver repositório completo
                        <ExternalLink className="w-3 h-3" />
                    </button>
                </div>
            )}
        </div>
    )
}
