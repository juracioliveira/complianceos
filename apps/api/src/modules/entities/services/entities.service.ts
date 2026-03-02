import { EntitiesRepository } from '../repositories/entities.repository.js'
import { ComplianceOSError } from '../../../shared/errors.js'

export class EntitiesService {
    constructor(private entitiesRepository: EntitiesRepository) { }

    async getEntityDetails(id: string, tenantId: string) {
        const entity = await this.entitiesRepository.findById(id, tenantId)
        if (!entity) throw new ComplianceOSError('ENTITY_NOT_FOUND', 'Entidade não encontrada', 404)
        return entity
    }

    async listEntities(tenantId: string) {
        return this.entitiesRepository.listByTenant(tenantId)
    }

    async approveRisk(id: string, tenantId: string, userId: string) {
        const entity = await this.entitiesRepository.findById(id, tenantId)
        if (!entity) {
            throw new ComplianceOSError('ENTITY_NOT_FOUND', 'Entidade não encontrada', 404)
        }

        // Regra de Segregação de Funções (SoD - Padrão Big Four)
        if (entity.lastRiskUpdateBy === userId) {
            throw new ComplianceOSError(
                'SOD_VIOLATION',
                'Violação de Segregação de Funções: O aprovador do risco não pode ser o mesmo que realizou a última alteração.',
                403
            )
        }

        return this.entitiesRepository.approveRisk(id, tenantId, userId)
    }

    async syncKybData(id: string, tenantId: string) {
        const entity = await this.entitiesRepository.findById(id, tenantId)
        if (!entity || !entity.cnpj) {
            throw new ComplianceOSError('ENTITY_INVALID_FOR_SYNC', 'Entidade não encontrada ou sem CNPJ para sincronização', 400)
        }

        // Chamar CNPJ Service local
        const cnpjServiceUrl = process.env['CNPJ_SERVICE_URL'] || 'http://localhost:4001'
        const response = await fetch(`${cnpjServiceUrl}/cnpj/${entity.cnpj}`, {
            headers: { 'x-api-key': process.env['INTERNAL_API_KEY'] || 'dev-key' }
        })

        if (!response.ok) {
            throw new ComplianceOSError('CNPJ_SERVICE_ERROR', 'Erro ao consultar serviço de CNPJ', 502)
        }

        const externalData = await response.json() as any

        // Atualizar entidade com dados reais
        const updated = await this.entitiesRepository.update(id, tenantId, {
            name: externalData.razao_social || entity.name,
            sector: externalData.cnae_principal?.descricao || entity.sector,
            corporateData: externalData,
            updatedAt: new Date()
        })

        return { success: true, data: updated }
    }

    async startAutomatedDueDiligence(id: string, tenantId: string, userId: string) {
        // 1. Sincronizar dados cadastrais
        await this.syncKybData(id, tenantId)

        // 2. Chamar Sanctions Service para screening instantâneo
        const entity = await this.entitiesRepository.findById(id, tenantId)
        if (!entity) return

        const sanctionsUrl = process.env['SANCTIONS_SERVICE_URL'] || 'http://localhost:4002'
        const screenRes = await fetch(`${sanctionsUrl}/screen`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: entity.name,
                document: entity.cnpj || entity.cpf,
                sources: ['OFAC', 'UN', 'EU', 'INTERPOL', 'CEIS', 'CNEP'],
                tenant_id: tenantId,
                user_id: userId
            })
        })

        const screening = await screenRes.json() as any

        // 3. Atualizar status de KYC baseado no risco encontrado
        let kycStatus = 'IN_PROGRESS'
        if (screening.risk_level === 'clear') kycStatus = 'APPROVED'
        if (screening.risk_level === 'confirmed') kycStatus = 'REJECTED'

        await this.entitiesRepository.update(id, tenantId, {
            riskLevel: screening.risk_level === 'confirmed' ? 'CRITICAL' : screening.risk_level === 'potential' ? 'HIGH' : 'LOW',
            riskScore: screening.highest_score,
            kycStatus: kycStatus as any,
            lastAssessedAt: new Date(),
            lastRiskUpdateBy: userId
        })

        return { success: true, screeningId: screening.screening_id, riskLevel: screening.risk_level }
    }
}
