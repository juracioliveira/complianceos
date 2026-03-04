import type { Metadata } from 'next'
import { AuditApiClient } from './AuditApiClient'

export const metadata: Metadata = {
    title: 'API de Audit Trail | ComplianceOS Docs',
    description: 'Documentação completa da trilha de auditoria imutável, exportações para reguladores e hash chain de integridade.',
}

export default function AuditApiPage() {
    return <AuditApiClient />
}
