import { db } from '../../../infra/db/db.js'
import { entities } from '../../../infra/db/schema.js'
import { eq, and } from 'drizzle-orm'

export class EntitiesRepository {
    async findById(id: string, tenantId: string) {
        const [entity] = await db
            .select()
            .from(entities)
            .where(
                and(
                    eq(entities.id, id),
                    eq(entities.tenantId, tenantId)
                )
            )
        return entity
    }

    async listByTenant(tenantId: string) {
        return db
            .select()
            .from(entities)
            .where(eq(entities.tenantId, tenantId))
    }

    async updateRiskScore(id: string, tenantId: string, score: number, level: string, userId: string) {
        await db
            .update(entities)
            .set({
                riskScore: score,
                riskLevel: level as any,
                lastRiskUpdateBy: userId,
                updatedAt: new Date()
            })
            .where(
                and(
                    eq(entities.id, id),
                    eq(entities.tenantId, tenantId)
                )
            )
    }

    async approveRisk(id: string, tenantId: string, userId: string) {
        await db
            .update(entities)
            .set({
                kycStatus: 'APPROVED',
                lastRiskApprovalBy: userId,
                updatedAt: new Date()
            })
            .where(
                and(
                    eq(entities.id, id),
                    eq(entities.tenantId, tenantId)
                )
            )
    }
}
