import { EntitiesRepository } from '../repositories/entities.repository.js'
import { ComplianceOSError } from '../../../shared/errors.js'
import { sanctionsScreeningQueue } from '../../../infra/queue.js'

export interface ListEntitiesFilters {
    riskLevel?: string
    status?: string
    entityType?: string
    search?: string
    sort?: string
    limit?: number
    offset?: number
}

export class EntitiesService {
    constructor(private entitiesRepository: EntitiesRepository) { }

    async createEntity(tenantId: string, userId: string, data: {
        name: string
        entityType: string
        cnpj?: string
        cpf?: string
        sector?: string
    }) {
        if (data.cnpj || data.cpf) {
            const taxId = (data.cnpj || data.cpf)!
            const exists = await this.entitiesRepository.findByTaxId(taxId, tenantId)
            if (exists) {
                throw new ComplianceOSError('ENTITY_ALREADY_EXISTS', 'Já existe uma entidade cadastrada com este documento neste inquilino', 409)
            }
        }

        return this.entitiesRepository.create({
            tenantId,
            name: data.name,
            entityType: data.entityType,
            cnpj: data.cnpj ?? null,
            cpf: data.cpf ?? null,
            sector: data.sector ?? null,
            createdBy: userId,
            riskLevel: 'UNKNOWN',
            status: 'ACTIVE',
            kycStatus: 'PENDING',
        })
    }

    async updateEntity(id: string, tenantId: string, data: {
        name?: string
        sector?: string
        status?: string
        blockedReason?: string
    }) {
        const entity = await this.entitiesRepository.findById(id, tenantId)
        if (!entity) throw new ComplianceOSError('ENTITY_NOT_FOUND', 'Entidade não encontrada', 404)

        return this.entitiesRepository.update(id, tenantId, {
            ...(data.name !== undefined ? { name: data.name } : {}),
            ...(data.sector !== undefined ? { sector: data.sector } : {}),
            ...(data.status !== undefined ? { status: data.status as any } : {}),
            ...(data.blockedReason !== undefined ? { blockedReason: data.blockedReason } : {}),
        })
    }

    async deleteEntity(id: string, tenantId: string) {
        const entity = await this.entitiesRepository.findById(id, tenantId)
        if (!entity) throw new ComplianceOSError('ENTITY_NOT_FOUND', 'Entidade não encontrada', 404)
        return this.entitiesRepository.softDelete(id, tenantId)
    }

    async getEntityDetails(id: string, tenantId: string) {
        const entity = await this.entitiesRepository.findById(id, tenantId)
        if (!entity) throw new ComplianceOSError('ENTITY_NOT_FOUND', 'Entidade não encontrada', 404)
        return entity
    }

    async listEntities(tenantId: string, filters: ListEntitiesFilters = {}) {
        return this.entitiesRepository.listByTenant(tenantId, filters as any)
    }

    async approveRisk(id: string, tenantId: string, userId: string) {
        const entity = await this.entitiesRepository.findById(id, tenantId)
        if (!entity) throw new ComplianceOSError('ENTITY_NOT_FOUND', 'Entidade não encontrada', 404)

        // Segregação de Funções (SoD)
        if (entity.lastRiskUpdateBy === userId) {
            throw new ComplianceOSError(
                'SOD_VIOLATION',
                'Violação de Segregação de Funções: O aprovador não pode ser o mesmo que realizou a última alteração de risco.',
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

        const cnpjServiceUrl = process.env['CNPJ_SERVICE_URL'] || 'http://localhost:4001'
        const internalApiKey = process.env['INTERNAL_API_KEY']
        if (!internalApiKey) {
            throw new ComplianceOSError('INTERNAL_API_KEY_MISSING', 'A chave interna de API não está configurada', 500)
        }

        const response = await fetch(`${cnpjServiceUrl}/cnpj/${entity.cnpj}`, {
            headers: { 'x-api-key': internalApiKey }
        })

        if (!response.ok) {
            throw new ComplianceOSError('CNPJ_SERVICE_ERROR', 'Erro ao consultar serviço de CNPJ interno da RFB', 502)
        }

        const externalData = await response.json() as any

        const updated = await this.entitiesRepository.update(id, tenantId, {
            name: externalData.razao_social || entity.name,
            sector: externalData.cnae_principal?.descricao || entity.sector,
            corporateData: externalData,
            updatedAt: new Date()
        })

        return { success: true, data: updated }
    }

    async startAutomatedDueDiligence(id: string, tenantId: string, userId: string) {
        await this.syncKybData(id, tenantId)

        const entity = await this.entitiesRepository.findById(id, tenantId)
        if (!entity) return

        await sanctionsScreeningQueue.add('screen-entity', {
            tenantId,
            entityId: id,
            document: entity.cnpj || entity.cpf,
            name: entity.name,
            userId
        })

        await this.entitiesRepository.update(id, tenantId, {
            kycStatus: 'PENDING',
            lastAssessedAt: new Date(),
            lastRiskUpdateBy: userId
        })

        return { success: true, queued: true, message: 'Screening enviado para processamento assíncrono.' }
    }
}
