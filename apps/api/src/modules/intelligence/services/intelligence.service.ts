import { IntelligenceRepository } from '../repositories/intelligence.repository.js'
import { AuditService } from '../../audit/services/audit.service.js'
import { NotFoundError } from '@compliance-os/types'

export interface UboData {
    companyName: string
    jurisdiction: string
    ubo: Array<{
        name: string
        percentage: number
        role: string
        country: string
    }>
    holdingTree: any
    source?: string
    fetchedAt?: string
}

export class IntelligenceService {
    constructor(
        private intelligenceRepository: IntelligenceRepository,
        private auditService: AuditService
    ) { }

    async fetchGlobalUboData(entityId: string, taxId: string, tenantId: string, userId: string): Promise<UboData> {
        // Integração futura com Moody's Orbis / Refinitiv / Comply Advantage
        // Por agora, retorna dados simulados mas PERSISTE no banco
        const mockData: UboData = {
            companyName: 'Global Holding Corp Ltd',
            jurisdiction: 'Cayman Islands',
            ubo: [
                { name: 'John Doe', percentage: 65, role: 'Shareholder', country: 'UK' },
                { name: 'Jane Smith', percentage: 35, role: 'Shareholder', country: 'USA' }
            ],
            holdingTree: {
                level: 0,
                name: 'Global Holding Corp Ltd',
                children: [
                    { level: 1, name: 'Regional Subsidiary BR Ltda', type: 'SUBSIDIARY' }
                ]
            },
            source: 'GLOBAL_DATA_PROVIDER_V1',
            fetchedAt: new Date().toISOString(),
        }

        // 1. Persistir no banco (JSONB corporateData)
        await this.intelligenceRepository.updateCorporateData(entityId, tenantId, {
            ubo: mockData.ubo,
            holdingTree: mockData.holdingTree,
            jurisdiction: mockData.jurisdiction,
            companyName: mockData.companyName,
            source: mockData.source,
            fetchedAt: mockData.fetchedAt,
        })

        // 2. Log de auditoria (Audit Trail — Big Four Requirement)
        await this.auditService.logEvent({
            tenantId,
            actorId: userId,
            actorType: 'USER',
            module: 'ENTITIES',
            action: 'intelligence.ubo.fetch',
            resourceType: 'entity',
            resourceId: entityId,
            result: 'SUCCESS',
            metadata: {
                taxId,
                provider: mockData.source,
                jurisdiction: mockData.jurisdiction,
            }
        })

        return mockData
    }

    async getSanctionsData(entityId: string, tenantId: string, userId: string) {
        const entity = await this.intelligenceRepository.getCorporateData(entityId, tenantId)
        if (!entity) throw new NotFoundError('Entidade')

        const sanctionsServiceUrl = process.env['SANCTIONS_SERVICE_URL'] || 'http://localhost:4002'
        const internalApiKey = process.env['INTERNAL_API_KEY']

        if (!internalApiKey) {
            // Return empty result if service not configured (dev mode)
            return { hits: [], screened: false, message: 'Sanctions service not configured' }
        }

        const searchTerm = entity.name
        const response = await fetch(`${sanctionsServiceUrl}/screen?name=${encodeURIComponent(searchTerm)}`, {
            headers: { 'x-api-key': internalApiKey }
        }).catch(() => null)

        if (!response?.ok) {
            return { hits: [], screened: false, message: 'Sanctions service unavailable' }
        }

        const data = await response.json() as any

        await this.auditService.logEvent({
            tenantId,
            actorId: userId,
            actorType: 'USER',
            module: 'ENTITIES',
            action: 'intelligence.sanctions.screen',
            resourceType: 'entity',
            resourceId: entityId,
            result: 'SUCCESS',
            metadata: { searchTerm, hits: data?.hits?.length ?? 0 }
        })

        return data
    }

    async getIntelligenceReport(entityId: string, tenantId: string) {
        const entity = await this.intelligenceRepository.getCorporateData(entityId, tenantId)
        if (!entity) throw new NotFoundError('Entidade')

        return {
            entityId,
            name: entity.name,
            cnpj: entity.cnpj,
            riskLevel: entity.riskLevel,
            isPep: entity.isPep,
            pepDetails: entity.pepDetails,
            lastAssessedAt: entity.lastAssessedAt,
            corporateData: entity.corporateData,
            generatedAt: new Date().toISOString(),
        }
    }
}
