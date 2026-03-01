import type { Metadata } from 'next'
import { ClipboardList, Play, CheckCircle2, Clock, AlertTriangle, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { RiskBadge } from '@/components/ui/RiskBadge'

export const metadata: Metadata = { title: 'Checklists' }

const systemChecklists = [
    { id: '1', module: 'PLD_FT', code: 'LEI_9613_98_CDD', title: 'Due Diligence PLD/FT (CDD)', desc: 'Checklist padrão para clientes de risco médio — Lei 9.613/98', totalItems: 10, periodicity: '365 dias', appliesTo: ['CLIENTE', 'PARCEIRO'] },
    { id: '2', module: 'PLD_FT', code: 'LEI_9613_98_EDD', title: 'Due Diligence Reforçada (EDD)', desc: 'Para entidades de alto risco e parceiros internacionais', totalItems: 5, periodicity: '180 dias', appliesTo: ['CLIENTE', 'PARCEIRO', 'FORNECEDOR'] },
    { id: '3', module: 'LGPD', code: 'LGPD_ART37_RAT', title: 'Mapeamento LGPD — RAT', desc: 'Registro de Atividades de Tratamento — Art. 37 LGPD', totalItems: 8, periodicity: '365 dias', appliesTo: ['CLIENTE', 'FORNECEDOR', 'PARCEIRO'] },
    { id: '4', module: 'ANTICORRUPCAO', code: 'LEI_12846_13_PI', title: 'Programa de Integridade', desc: 'Avaliação conforme Lei 12.846/13 — 5 pilares CGU', totalItems: 7, periodicity: '365 dias', appliesTo: ['CLIENTE', 'FORNECEDOR', 'PARCEIRO'] },
]

const recentRuns = [
    { id: 'r1', entity: 'Alpha Pagamentos S.A.', checklist: 'Due Diligence PLD/FT (CDD)', status: 'COMPLETED', score: 18, risk: 'CRITICAL', executedBy: 'Maria Silva (CCO)', completedAt: '2024-12-10' },
    { id: 'r2', entity: 'Gama Construções Eireli', checklist: 'Mapeamento LGPD — RAT', status: 'IN_PROGRESS', score: null, risk: 'MEDIUM', executedBy: 'João Costa', completedAt: null },
    { id: 'r3', entity: 'Beta Distribuidora Ltda', checklist: 'Programa de Integridade', status: 'COMPLETED', score: 88, risk: 'LOW', executedBy: 'Maria Silva (CCO)', completedAt: '2024-12-05' },
    { id: 'r4', entity: 'Epsilon Consultoria S.A.', checklist: 'Due Diligence Reforçada (EDD)', status: 'COMPLETED', score: 45, risk: 'HIGH', executedBy: 'Ana Auditora', completedAt: '2024-11-28' },
]

const MODULE_LABEL: Record<string, { label: string; color: string }> = {
    PLD_FT: { label: 'PLD/FT', color: 'badge-blue' },
    LGPD: { label: 'LGPD', color: 'badge-amber' },
    ANTICORRUPCAO: { label: 'Anticorrupção', color: 'badge-green' },
}

export default function ChecklistsPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Checklists Regulatórios</h1>
                    <p className="page-subtitle">Templates de Due Diligence por módulo de compliance</p>
                </div>
            </div>

            {/* KPIs rápidos */}
            <div className="grid grid-cols-3 gap-4">
                <div className="stat-card border-l-2 border-l-amber-500">
                    <p className="stat-label">Vencidos</p>
                    <p className="stat-value text-amber-600">12</p>
                    <p className="stat-sub">Aguardando revisão</p>
                </div>
                <div className="stat-card border-l-2 border-l-blue-500">
                    <p className="stat-label">Em andamento</p>
                    <p className="stat-value text-blue-600">7</p>
                    <p className="stat-sub">Execuções ativas</p>
                </div>
                <div className="stat-card border-l-2 border-l-emerald-500">
                    <p className="stat-label">Concluídos (mês)</p>
                    <p className="stat-value text-emerald-600">89</p>
                    <p className="stat-sub">Este mês</p>
                </div>
            </div>

            {/* Templates */}
            <section className="space-y-3">
                <h2 className="text-sm font-semibold text-foreground">Templates de Sistema</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {systemChecklists.map((c) => {
                        const mod = MODULE_LABEL[c.module]
                        return (
                            <div key={c.id} className="card card-hover p-5 space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`badge ${mod?.color ?? 'badge-slate'}`}>{mod?.label}</span>
                                            <span className="text-[10px] text-muted-foreground font-mono">{c.code}</span>
                                        </div>
                                        <h3 className="font-semibold text-foreground text-sm">{c.title}</h3>
                                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{c.desc}</p>
                                    </div>
                                    <ClipboardList className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                                </div>

                                <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
                                    <span className="flex items-center gap-1">
                                        <span className="font-semibold text-foreground">{c.totalItems}</span> perguntas
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {c.periodicity}
                                    </span>
                                    <div className="flex gap-1 flex-wrap">
                                        {c.appliesTo.map((t) => (
                                            <span key={t} className="badge badge-slate text-[10px]">{t}</span>
                                        ))}
                                    </div>
                                </div>

                                <button className="btn-primary btn-sm w-full justify-center gap-1.5">
                                    <Play className="w-3.5 h-3.5" />
                                    Iniciar avaliação
                                </button>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* Execuções recentes */}
            <section className="space-y-3">
                <h2 className="text-sm font-semibold text-foreground">Execuções Recentes</h2>
                <div className="card overflow-hidden">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Entidade</th>
                                <th>Checklist</th>
                                <th>Status</th>
                                <th>Resultado</th>
                                <th>Executado por</th>
                                <th>Conclusão</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {recentRuns.map((r) => (
                                <tr key={r.id}>
                                    <td className="font-medium text-foreground">{r.entity}</td>
                                    <td className="text-xs text-muted-foreground">{r.checklist}</td>
                                    <td>
                                        {r.status === 'COMPLETED'
                                            ? <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium"><CheckCircle2 className="w-3.5 h-3.5" /> Concluído</span>
                                            : <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-medium"><Clock className="w-3.5 h-3.5" /> Em andamento</span>
                                        }
                                    </td>
                                    <td>
                                        {r.score != null
                                            ? <RiskBadge level={r.risk} score={r.score} size="sm" />
                                            : <span className="text-xs text-muted-foreground">—</span>
                                        }
                                    </td>
                                    <td className="text-xs text-muted-foreground">{r.executedBy}</td>
                                    <td className="text-xs text-muted-foreground">{r.completedAt ? formatDate(r.completedAt) : '—'}</td>
                                    <td className="text-right">
                                        <button className="btn-ghost btn-sm text-primary">Ver <ChevronRight className="w-3 h-3 inline" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    )
}
