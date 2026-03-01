import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, opts?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat('pt-BR', opts ?? {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(date))
}

export function formatCNPJ(cnpj: string): string {
    const d = cnpj.replace(/\D/g, '')
    return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export const RISK_LABELS: Record<string, string> = {
    LOW: 'Baixo', MEDIUM: 'Médio', HIGH: 'Alto', CRITICAL: 'Crítico', UNKNOWN: 'Não avaliado',
}

export const KYC_LABELS: Record<string, string> = {
    PENDING: 'Pendente', IN_PROGRESS: 'Em andamento', APPROVED: 'Aprovado', REJECTED: 'Rejeitado',
}
