import { cn } from '@/lib/utils'
import { Link2 } from 'lucide-react'

interface AuditHashChainProps {
    hash: string
    prevHash?: string
    className?: string
}

export function AuditHashChain({ hash, prevHash, className }: AuditHashChainProps) {
    return (
        <div className={cn('flex items-center gap-2 group', className)}>
            <div className="flex flex-col items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(0,163,191,0.4)]" />
                {prevHash && <div className="w-px h-3 bg-gradient-to-b from-brand-500 to-transparent" />}
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 border border-slate-100 group-hover:border-brand-200 transition-colors">
                <Link2 className="w-3 h-3 text-slate-400" />
                <code className="text-[10px] font-mono text-slate-500 select-all">
                    {hash.substring(0, 8)}...{hash.substring(hash.length - 4)}
                </code>
            </div>
        </div>
    )
}
