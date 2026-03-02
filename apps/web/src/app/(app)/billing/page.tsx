'use client'

import { CreditCard, QrCode, Receipt, Wallet, CheckCircle2, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function BillingPage() {
    const history = [
        { id: '1', date: '2024-12-01', amount: 499.00, status: 'PAID', plan: 'Pro' },
        { id: '2', date: '2024-11-01', amount: 499.00, status: 'PAID', plan: 'Pro' },
        { id: '3', date: '2024-10-01', amount: 499.00, status: 'PAID', plan: 'Pro' },
    ]

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Assinatura e Faturamento</h1>
                    <p className="page-subtitle">Gerencie seu plano, pagamentos e histórico de faturas.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Plano Atual */}
                <div className="card p-6 flex flex-col justify-between border-t-4 border-t-primary">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="badge badge-primary font-bold">PLANO ATUAL</span>
                            <span className="text-xs font-mono text-muted-foreground">ID: #992812</span>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-foreground">Plano Pro</h2>
                            <p className="text-sm text-muted-foreground mt-1">Sua conta está ativa e em dia.</p>
                        </div>
                        <div className="flex items-baseline gap-1 mt-4">
                            <span className="text-2xl font-bold text-primary">{formatCurrency(499)}</span>
                            <span className="text-xs text-muted-foreground">/mês</span>
                        </div>
                        <ul className="space-y-2.5 pt-4">
                            {[
                                'Até 500 entidades/mês',
                                'Due Diligence Automatizada',
                                'Integração com Sanções Global',
                                'Suporte Prioritário 24/7'
                            ].map(feat => (
                                <li key={feat} className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                    {feat}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <button className="btn-secondary w-full mt-8 gap-2">
                        Mudar de Plano
                    </button>
                </div>

                {/* Pagamento PIX */}
                <div className="card p-6 lg:col-span-2 flex flex-col md:flex-row gap-8 items-center bg-muted/20 border-dashed">
                    <div className="bg-white p-4 rounded-2xl shadow-xl shadow-black/5 dark:shadow-white/5 shrink-0 border border-border">
                        <div className="w-48 h-48 bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-200">
                            <QrCode className="w-16 h-16 text-slate-300" />
                            <span className="absolute text-[10px] uppercase font-bold text-slate-400 mt-20">Mock QR Code</span>
                        </div>
                    </div>
                    <div className="space-y-4 flex-1 text-center md:text-left">
                        <div>
                            <h3 className="text-xl font-bold text-foreground flex items-center justify-center md:justify-start gap-2">
                                <Wallet className="w-5 h-5 text-primary" />
                                Próximo Vencimento: 10/01/2025
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                Pague com PIX para liberação instantânea de créditos adicionais ou renovação antecipada.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-card border border-border font-mono text-xs break-all select-all cursor-copy">
                            00020126360014br.gov.bcb.pix011400.compliance.os...
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button className="btn-primary flex-1 gap-2">
                                Copiar Código PIX
                            </button>
                            <button className="btn-secondary flex-1 gap-2">
                                <Receipt className="w-4 h-4" />
                                Nota Fiscal (PDF)
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Histórico */}
            <div className="card overflow-hidden">
                <div className="px-5 py-4 border-b border-border bg-muted/10">
                    <h3 className="text-sm font-bold text-foreground">Histórico de Cobrança</h3>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Plano</th>
                            <th>Valor</th>
                            <th>Status</th>
                            <th className="text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map(item => (
                            <tr key={item.id}>
                                <td className="text-xs text-muted-foreground font-medium">
                                    {new Date(item.date).toLocaleDateString('pt-BR')}
                                </td>
                                <td>
                                    <span className="text-sm font-semibold text-foreground">Assinatura {item.plan}</span>
                                </td>
                                <td className="text-sm font-bold text-primary">
                                    {formatCurrency(item.amount)}
                                </td>
                                <td>
                                    <span className="badge badge-green">PAGO</span>
                                </td>
                                <td className="text-right">
                                    <button className="btn-ghost btn-xs text-primary font-bold">Fatura PDF</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                    <h4 className="font-bold text-sm text-amber-800 dark:text-amber-400">Cartão Expirando</h4>
                    <p className="text-xs text-amber-700 dark:text-amber-500 mt-0.5">
                        Seu cartão final **** 8829 expira no próximo mês. Atualize seus dados para evitar interrupção no serviço.
                    </p>
                </div>
            </div>
        </div>
    )
}
