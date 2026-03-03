import { EntitiesRepository } from '../repositories/entities.repository.js'
import { ComplianceOSError } from '../../../shared/errors.js'
import { sanctionsScreeningQueue } from '../../../infra/queue.js'

export class EntitiesService {
    constructor(private entitiesRepository: EntitiesRepository) { }

    async createEntity(tenantId: string, userId: string, data: { name: string; entityType: string; cnpj?: string; cpf?: string; sector?: string }) {
        // Verificar se já existe (Duplicidade)
        if (data.cnpj || data.cpf) {
            const taxId = (data.cnpj || data.cpf)!
            const exists = await this.entitiesRepository.findByTaxId(taxId, tenantId)
            if (exists) {
                throw new ComplianceOSError('ENTITY_ALREADY_EXISTS', 'Já existe uma entidade cadastrada com este documento neste inquilino', 409)
            }
        }

        const entity = await this.entitiesRepository.create({
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

        return entity
    }

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

        // Chamar CNPJ Service local (Banco próprio RFB)
        const cnpjServiceUrl = process.env['CNPJ_SERVICE_URL'] || 'http://localhost:4001'
        const response = await fetch(`${cnpjServiceUrl}/cnpj/${entity.cnpj}`, {
            headers: { 'x-api-key': process.env['INTERNAL_API_KEY'] || 'dev-key' }
        })

        if (!response.ok) {
            throw new ComplianceOSError('CNPJ_SERVICE_ERROR', 'Erro ao consultar serviço de CNPJ interno da RFB', 502)
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

        // 2. Enviar para a fila de Sanções Assíncrona via BullMQ
        const entity = await this.entitiesRepository.findById(id, tenantId)
        if (!entity) return

        await sanctionsScreeningQueue.add('screen-entity', {
            tenantId,
            entityId: id,
            document: entity.cnpj || entity.cpf,
            name: entity.name,
            userId
        })

        // 3. Atualizar status de KYC temporário para PENDING já que a fila processará
        await this.entitiesRepository.update(id, tenantId, {
            kycStatus: 'PENDING',
            lastAssessedAt: new Date(),
            lastRiskUpdateBy: userId
        })

        return { success: true, queued: true, message: 'Screening enviado para processamento assíncrono.' }
    }
}
