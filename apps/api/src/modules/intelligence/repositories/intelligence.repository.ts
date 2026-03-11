import { getDb } from '../../../infra/db/db.js'
import { entities } from '../../../infra/db/schema.js'
import { eq, and } from 'drizzle-orm'

export class IntelligenceRepository {
    /**
     * Persiste dados corporativos externos (UBO, holding tree) na coluna corporateData da entidade.
     */
    async updateCorporateData(id: string, tenantId: string, data: any) {
        const [updated] = await getDb()
            .update(entities)
            .set({
                corporateData: data,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(entities.id, id),
                    eq(entities.tenantId, tenantId)
                )
            )
            .returning({ id: entities.id, corporateData: entities.corporateData })
        return updated
    }

    /**
     * Busca dados corporativos já persistidos para uma entidade.
     */
    async getCorporateData(id: string, tenantId: string) {
        const [entity] = await getDb()
            .select({
                id: entities.id,
                name: entities.name,
                cnpj: entities.cnpj,
                corporateData: entities.corporateData,
                riskLevel: entities.riskLevel,
                isPep: entities.isPep,
                pepDetails: entities.pepDetails,
                lastAssessedAt: entities.lastAssessedAt,
            })
            .from(entities)
            .where(
                and(
                    eq(entities.id, id),
                    eq(entities.tenantId, tenantId)
                )
            )
        return entity
    }
}
