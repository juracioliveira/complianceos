import { getDb } from '../../../infra/db/db.js'
import { entities, users } from '../../../infra/db/schema.js'
import { eq, and, or, ilike, desc, asc, count, sql } from 'drizzle-orm'

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN'
type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED'
type EntityType = 'CLIENTE' | 'FORNECEDOR' | 'PARCEIRO' | 'COLABORADOR'

interface ListFilters {
    riskLevel?: RiskLevel
    status?: EntityStatus
    entityType?: EntityType
    search?: string
    sort?: string
    limit?: number
    offset?: number
}

export class EntitiesRepository {
    async findById(id: string, tenantId: string) {
        const [entity] = await getDb()
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
        const [entity] = await getDb()
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
        const [entity] = await getDb()
            .insert(entities)
            .values(data)
            .returning()
        return entity
    }

    async update(id: string, tenantId: string, data: Partial<typeof entities.$inferInsert>) {
        const [entity] = await getDb()
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

    async listByTenant(tenantId: string, filters: ListFilters = {}) {
        const {
            riskLevel, status, entityType, search,
            sort = 'created_at:desc', limit = 50, offset = 0
        } = filters

        const conditions = [eq(entities.tenantId, tenantId)]
        if (riskLevel) conditions.push(eq(entities.riskLevel, riskLevel))
        if (status) conditions.push(eq(entities.status, status))
        if (entityType) conditions.push(eq(entities.entityType, entityType))
        if (search) {
            conditions.push(
                or(
                    ilike(entities.name, `%${search}%`),
                    ilike(entities.cnpj as any, `%${search}%`),
                    ilike(entities.cpf as any, `%${search}%`)
                )!
            )
        }

        const sortMap: Record<string, any> = {
            'name:asc': asc(entities.name),
            'name:desc': desc(entities.name),
            'risk_level:asc': asc(entities.riskLevel),
            'risk_level:desc': desc(entities.riskLevel),
            'created_at:asc': asc(entities.createdAt),
            'created_at:desc': desc(entities.createdAt),
        }
        const orderBy = sortMap[sort] ?? desc(entities.createdAt)

        const [rows, totalResult] = await Promise.all([
            getDb()
                .select()
                .from(entities)
                .where(and(...conditions))
                .orderBy(orderBy)
                .limit(limit)
                .offset(offset),
            getDb()
                .select({ total: count() })
                .from(entities)
                .where(and(...conditions)),
        ])

        const total = totalResult[0]?.total ?? 0
        return { data: rows, total: Number(total) }
    }

    async updateRiskScore(id: string, tenantId: string, score: number, level: string, userId: string) {
        await this.update(id, tenantId, {
            riskScore: score,
            riskLevel: level as any,
            lastRiskUpdateBy: userId
        })
    }

    async approveRisk(id: string, tenantId: string, userId: string) {
        return this.update(id, tenantId, {
            kycStatus: 'APPROVED',
            lastRiskApprovalBy: userId,
            kycCompletedAt: new Date()
        })
    }

    async softDelete(id: string, tenantId: string) {
        return this.update(id, tenantId, { status: 'INACTIVE' })
    }
}
