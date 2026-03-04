import type { Metadata } from 'next'
import { DocsPageClient } from './DocsPageClient'

export const metadata: Metadata = {
    title: 'Documentação Técnica | ComplianceOS',
    description: 'Referência completa da API REST, guias de integração e documentação dos módulos de compliance. CHUANGXIN TECNOLOGIA DA INFORMACAO LTDA — CNPJ 65.089.671/0001-16.',
}

export default function DocsPage() {
    return <DocsPageClient />
}
