'use client'

import { FileText, Download, ShieldCheck, FileSearch, Trash2, ExternalLink } from 'lucide-react'

interface DocumentVaultProps {
    id: string
    limit?: number
}

export default function DocumentVault({ id, limit }: DocumentVaultProps) {
    const documents = [
        {
            id: 'doc_1',
            name: 'Relatório de Análise Técnica (RAT)',
            type: 'PDF',
            date: '28/02/2026',
            size: '1.2 MB',
            verified: true
        },
        {
            id: 'doc_2',
            name: 'Comprovante de Inscrição (CNPJ)',
            type: 'PDF',
            date: '10/02/2026',
            size: '450 KB',
            verified: true
        },
        {
            id: 'doc_3',
            name: 'Política de Integridade Anti-suborno',
            type: 'PDF',
            date: '15/12/2025',
            size: '3.1 MB',
            verified: true
        },
        {
            id: 'doc_4',
            name: 'Análise de Mídia Negativa',
            type: 'PDF',
            date: '05/11/2025',
            size: '890 KB',
            verified: false
        }
    ].slice(0, limit || 10)

    return (
        <div className="card h-full flex flex-col">
            <div className="p-5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <h3 className="font-bold">Cofre de Documentos</h3>
                </div>
                {!limit && (
                    <button className="btn btn-primary btn-sm px-3">Subir Novo</button>
                )}
            </div>

            <div className="flex flex-col flex-1 divide-y divide-border/50">
                {documents.map((doc) => (
                    <div key={doc.id} className="group flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-foreground line-clamp-1">{doc.name}</span>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">
                                    <span>{doc.type}</span>
                                    <span className="w-1 h-1 rounded-full bg-border" />
                                    <span>{doc.size}</span>
                                    <span className="w-1 h-1 rounded-full bg-border" />
                                    <span>{doc.date}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground title='Download'">
                                <Download className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground title='Ver Integridade'">
                                <ShieldCheck className="w-4 h-4" />
                            </button>
                            {!limit && (
                                <button className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-muted-foreground hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {limit && (
                <div className="p-3 bg-muted/10 border-t border-border mt-auto">
                    <button className="w-full text-xs font-bold text-muted-foreground hover:text-primary transition-colors py-2 flex items-center justify-center gap-1">
                        Ver repositório completo
                        <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            )}
        </div>
    )
}

function ChevronRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    )
}
