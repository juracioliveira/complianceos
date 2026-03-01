import { IntelligenceRepository } from '../repositories/intelligence.repository.js'
import { AuditService } from '../../audit/services/audit.service.js'

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
}

export class IntelligenceService {
    constructor(
        private intelligenceRepository: IntelligenceRepository,
        private auditService: AuditService
    ) {}

    async fetchGlobalUboData(entityId: string, taxId: string, tenantId: string, userId: string): Promise<UboData> {
        // Simulação de integração com Moody's/Refinitiv
        // No mundo real, aqui chamaria uma API externa com retentativas e cache.
        
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
                    {
                        level: 1,
                        name: 'Regional Subsidiary BR Ltda',
                        type: 'SUBSIDIARY'
                    }
                ]
            }
        }

        // 1. Log de auditoria da consulta internacional (Audit Trail - Big Four Requirement)
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
                provider: 'GLOBAL_DATA_PROVIDER_V1',
                jurisdiction: mockData.jurisdiction
            }
        })

        // 2. Persistir os dados (Opcional, dependendo da necessidade de cache)
        // await this.intelligenceRepository.updateCorporateData(entityId, tenantId, mockData)

        return mockData
    }
}
