import type { Metadata } from 'next'
import { ChecklistsApiClient } from './ChecklistsApiClient'

export const metadata: Metadata = {
    title: 'API de Checklists | ComplianceOS Docs',
    description: 'Documentação completa dos endpoints de Checklists — templates, execuções, respostas, scores e imutabilidade.',
}

export default function ChecklistsApiPage() {
    return <ChecklistsApiClient />
}
