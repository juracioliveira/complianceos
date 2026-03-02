import { db } from '../../../infra/db/db.js'
import { entities } from '../../../infra/db/schema.js'
import { eq, and, or } from 'drizzle-orm'

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

    async findByTaxId(taxId: string, tenantId: string) {
        const [entity] = await db
            .select()
            .from(entities)
            .where(
                and(
                    or(
                        eq(entities.cnpj, taxId),
                        eq(entities.cpf, taxId)
                    ),
                    eq(entities.tenantId, tenantId)
                )
            )
        return entity
    }

    async create(data: typeof entities.$inferInsert) {
        const [entity] = await db
            .insert(entities)
            .values(data)
            .returning()
        return entity
    }

    async update(id: string, tenantId: string, data: Partial<typeof entities.$inferInsert>) {
        const [entity] = await db
            .update(entities)
            .set({ ...data, updatedAt: new Date() })
            .where(
                and(
                    eq(entities.id, id),
                    eq(entities.tenantId, tenantId)
                )
            )
            .returning()
        return entity
    }

    async listByTenant(tenantId: string) {
        return db
            .select()
            .from(entities)
            .where(eq(entities.tenantId, tenantId))
    }

    async updateRiskScore(id: string, tenantId: string, score: number, level: string, userId: string) {
        await this.update(id, tenantId, {
            riskScore: score,
            riskLevel: level as any,
            lastRiskUpdateBy: userId
        })
    }

    async approveRisk(id: string, tenantId: string, userId: string) {
        await this.update(id, tenantId, {
            kycStatus: 'APPROVED',
            lastRiskApprovalBy: userId,
            kycCompletedAt: new Date()
        })
    }
}
