'use client'

import { useState, useRef } from 'react'
import { Upload, X, ShieldAlert, CheckCircle2, FileText, Image as ImageIcon } from 'lucide-react'

export default function LogoUpload() {
    const [dragActive, setDragActive] = useState(false)
    const [logo, setLogo] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFile = (file: File) => {
        setError(null)

        // Validação MIME e Tamanho (Requisito: max 2MB)
        const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml']
        if (!validTypes.includes(file.type)) {
            setError('Formato inválido. Use PNG, JPG ou SVG.')
            return
        }

        if (file.size > 2 * 1024 * 1024) {
            setError('Arquivo muito grande. Limite: 2MB.')
            return
        }

        const reader = new FileReader()
        reader.onload = (e) => setLogo(e.target?.result as string)
        reader.readAsDataURL(file)
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="card p-8">
                <div className="flex flex-col gap-6">
                    <div>
                        <h3 className="font-bold text-lg">Identidade Visual</h3>
                        <p className="text-sm text-muted-foreground">
                            Esta logomarca será utilizada em todos os relatórios PDF gerados (RAT, CDD) e no dashboard.
                        </p>
                    </div>

                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
                        className={`
              relative h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all px-6 text-center
              ${dragActive ? 'border-primary bg-primary/5 scale-[0.99]' : 'border-border bg-muted/20'}
              ${logo ? 'border-solid border-emerald-500/50' : ''}
            `}
                    >
                        {logo ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-32 h-32 p-4 bg-white dark:bg-zinc-800 rounded-xl shadow-inner border border-border flex items-center justify-center">
                                    <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setLogo(null)}
                                        className="btn btn-secondary btn-xs gap-1.5 text-red-500 hover:bg-red-50"
                                    >
                                        <X className="w-3.5 h-3.5" /> Remover
                                    </button>
                                    <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                        Validado para PDF
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="font-bold text-foreground">Arraste sua logo aqui</p>
                                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou SVG (Máx. 2MB)</p>
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="btn btn-primary btn-sm"
                                >
                                    Selecionar Arquivo
                                </button>
                                <input
                                    type="file"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                                />
                            </div>
                        )}

                        {error && (
                            <div className="absolute bottom-4 flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 animate-shake">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <FeatureItem
                            icon={<FileText className="w-4 h-4" />}
                            title="Cabeçalho Automatizado"
                            desc="Inserção automática em dossiês oficiais."
                        />
                        <FeatureItem
                            icon={<CheckCircle2 className="w-4 h-4" />}
                            title="Otimização de Render"
                            desc="Conversão para Base64 segura para PDF."
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="flex gap-3 p-4 rounded-xl border border-border/50 bg-muted/10">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {icon}
            </div>
            <div>
                <h4 className="text-sm font-bold">{title}</h4>
                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{desc}</p>
            </div>
        </div>
    )
}
