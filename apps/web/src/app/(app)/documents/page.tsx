'use client'

import { useState } from 'react'
import {
    FileText,
    Plus,
    Download,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Search,
    Filter,
    ShieldCheck,
    ExternalLink,
    ChevronRight,
    Archive,
    BookOpen,
    FileBarChart
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

const docCategories = [
    { type: 'RAT', label: 'RAT / LGPD', count: 12, icon: <BookOpen className="w-5 h-5" />, color: 'from-blue-500/10 to-blue-600/5 border-blue-200/50' },
    { type: 'POLITICA', label: 'Políticas Internas', count: 5, icon: <ShieldCheck className="w-5 h-5" />, color: 'from-purple-500/10 to-purple-600/5 border-purple-200/50' },
    { type: 'DPIA', label: 'DPIAs', count: 3, icon: <FileText className="w-5 h-5" />, color: 'from-amber-500/10 to-amber-600/5 border-amber-200/50' },
    { type: 'RELATORIO', label: 'Relatórios de Risco', count: 8, icon: <FileBarChart className="w-5 h-5" />, color: 'from-emerald-500/10 to-emerald-600/5 border-emerald-200/50' },
    { type: 'OUTROS', label: 'Legado / Arquivo', count: 42, icon: <Archive className="w-5 h-5" />, color: 'from-slate-500/10 to-slate-600/5 border-slate-200/50' },
]

const documents = [
    { id: 'd1', type: 'RAT', title: 'Registro de Atividades de Tratamento — Dezembro 2024', status: 'READY', size: '284 KB', generated: '2024-12-10', by: 'Maria Silva', validUntil: '2025-12-10', hash: 'e3b0c44298fc1c149afbf4c8...' },
    { id: 'd2', type: 'POLITICA', title: 'Política PLD/FT — Revisão Anual 2024', status: 'READY', size: '512 KB', generated: '2024-11-01', by: 'Maria Silva', validUntil: '2025-11-01', hash: 'a7ffd3c2e1b0c44298fc1c14...' },
    { id: 'd3', type: 'RELATORIO', title: 'Relatório de Risco Consolidado — Q4 2024', status: 'READY', size: '1.2 MB', generated: '2024-12-01', by: 'João Costa', validUntil: null, hash: 'b3e8a1d2f8e12d...' },
    { id: 'd4', type: 'DPIA', title: 'DPIA — Sistema de Onboarding Digital 2024', status: 'GENERATING', size: null, generated: '2024-12-11', by: 'Ana Auditora', validUntil: null, hash: null },
    { id: 'd5', type: 'RAT', title: 'Programa de Integridade — Lei 12.846/13', status: 'READY', size: '890 KB', generated: '2024-10-15', by: 'Admin', validUntil: '2025-10-15', hash: 'c9d2f1e8a1...' },
    { id: 'd6', type: 'OUTROS', title: 'Termos de Uso App — v2.4.1', status: 'FAILED', size: null, generated: '2024-12-10', by: 'Sistema', validUntil: null, hash: null },
]

export default function DocumentsPage() {
    const [searchTerm, setSearchTerm] = useState('')

    return (
        <div className="flex flex-col gap-8 animate-fade-in max-w-[1200px] mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-lg shadow-primary/5 border border-primary/20">
                        <Archive className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold tracking-tight">Cofre de Documentos</h1>
                        <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                            Repositório Central de Provas e Relatórios Regulatórios
                            <span className="w-1 h-1 rounded-full bg-border" />
                            Retenção Imutável
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="btn btn-primary gap-2 shadow-lg shadow-primary/20 group">
                        <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                        Novo Relatório
                    </button>
                </div>
            </div>

            {/* Quick Access Categories */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {docCategories.map((cat) => (
                    <div
                        key={cat.type}
                        className={`
                        relative overflow-hidden rounded-2xl border p-4 cursor-pointer 
                        bg-gradient-to-br transition-all hover:scale-[1.02] hover:shadow-lg
                        ${cat.color}
                      `}
                    >
                        <div className="flex items-center justify-between mb-3 text-primary">
                            {cat.icon}
                            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-foreground leading-tight">{cat.count}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{cat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="flex-1 w-full relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por título, tipo ou hash..."
                        className="input-field pl-12 h-12 border-border/50 bg-card focus:bg-background shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="btn btn-secondary h-12 px-6 gap-2">
                        <Filter className="w-4 h-4" />
                        Filtros
                    </button>
                    <button className="btn btn-secondary h-12 w-12 p-0 flex items-center justify-center">
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="card p-0 overflow-hidden border-border/50 shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-muted/30 border-b border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                <th className="px-6 py-4">Documento Regulatório</th>
                                <th className="px-6 py-4">Status & Integridade</th>
                                <th className="px-6 py-4">Validade</th>
                                <th className="px-6 py-4">Gerado Por</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {documents.map((doc) => (
                                <tr key={doc.id} className="hover:bg-muted/20 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-500 shrink-0 border border-red-200/30">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-foreground leading-snug max-w-[320px]">{doc.title}</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-bold uppercase py-0.5 px-1.5 rounded bg-muted text-muted-foreground tracking-wider">{doc.type}</span>
                                                    <span className="text-[10px] text-muted-foreground font-medium">
                                                        {formatDate(doc.generated)} {doc.size ? `· ${doc.size}` : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-2">
                                            {doc.status === 'READY' ? (
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase tracking-wider">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Disponível
                                                    </div>
                                                    {doc.hash && (
                                                        <div className="flex items-center gap-1.5 group/hash">
                                                            <ShieldCheck className="w-3 h-3 text-muted-foreground/60" />
                                                            <span className="text-[9px] font-mono text-muted-foreground/60 truncate max-w-[120px]" title={doc.hash}>
                                                                {doc.hash}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : doc.status === 'GENERATING' ? (
                                                <div className="flex flex-col gap-2 w-full max-w-[120px]">
                                                    <div className="flex items-center gap-1.5 text-blue-500 font-bold text-[10px] uppercase tracking-wider">
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Gerando
                                                    </div>
                                                    <div className="h-1 w-full bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500 w-[60%] animate-pulse rounded-full" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-red-500 font-bold text-[10px] uppercase tracking-wider">
                                                    <AlertCircle className="w-3.5 h-3.5" /> Falha no Job
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        {doc.validUntil ? (
                                            <div className="flex flex-col leading-tight">
                                                <span className="text-xs font-bold text-foreground">{formatDate(doc.validUntil)}</span>
                                                <span className="text-[9px] font-bold uppercase text-muted-foreground opacity-60">Expira em 1 ano</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground/50">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-xs font-medium text-muted-foreground">{doc.by}</span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors" title="Visualizar Interno">
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                            <button
                                                className={`p-2 rounded-lg transition-colors ${doc.status === 'READY' ? 'hover:bg-primary/10 text-primary' : 'text-muted-foreground/30 cursor-not-allowed'}`}
                                                disabled={doc.status !== 'READY'}
                                                title="Baixar PDF Assinado"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Nota de Vault */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-sm text-primary">Cofre de Documentos Imutável</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Todos os documentos gerados são armazenados em cold-storage (S3 IA) com locks de exclusão ativados.
                        A integridade é garantida via hash SHA-256 e assinatura digital do tenant.
                    </p>
                </div>
            </div>
        </div>
    )
}
