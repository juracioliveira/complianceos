import type { Metadata } from 'next'
import { EntitiesApiClient } from './EntitiesApiClient'

export const metadata: Metadata = {
    title: 'API de Entidades | ComplianceOS Docs',
    description: 'Documentação completa dos endpoints de Entidades da API ComplianceOS — CRUD, filtros, risk assessments e KYB.',
}

export default function EntitiesApiPage() {
    return <EntitiesApiClient />
}
