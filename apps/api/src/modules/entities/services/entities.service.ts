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
        // O usuário que aprovou o risco não pode ter sido o último a alterá-lo (Maker != Checker)
        if (entity.lastRiskUpdateBy === userId) {
            throw new ComplianceOSError(
                'SOD_VIOLATION',
                'Violação de Segregação de Funções: O aprovador do risco não pode ser o mesmo que realizou a última alteração.',
                403
            )
        }

        return this.entitiesRepository.approveRisk(id, tenantId, userId)
    }
}
