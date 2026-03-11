import { getDb } from '../../../infra/db/db.js'
import { checklistRuns, checklists, entities, users } from '../../../infra/db/schema.js'
import { eq, and, or, isNull, desc, count, sql } from 'drizzle-orm'

export class ChecklistsRepository {

    // ─── Templates ──────────────────────────────────────────────────────────────

    async listTemplates(tenantId: string, status: string = 'ACTIVE') {
        return getDb()
            .select({
                id: checklists.id,
                module: checklists.module,
                regulationCode: checklists.regulationCode,
                title: checklists.title,
                description: checklists.description,
                version: checklists.version,
                status: checklists.status,
                periodicityDays: checklists.periodicityDays,
                appliesTo: checklists.appliesTo,
                totalItems: sql<number>`jsonb_array_length(${checklists.items})`,
                createdAt: checklists.createdAt,
            })
            .from(checklists)
            .where(
                and(
                    or(isNull(checklists.tenantId), eq(checklists.tenantId, tenantId)),
                    eq(checklists.status, status)
                )
            )
            .orderBy(checklists.module, checklists.title)
    }

    async findTemplateById(id: string, tenantId: string) {
        const [template] = await getDb()
            .select()
            .from(checklists)
            .where(
                and(
                    eq(checklists.id, id),
                    or(isNull(checklists.tenantId), eq(checklists.tenantId, tenantId))
                )
            )
        return template
    }

    // ─── Runs ────────────────────────────────────────────────────────────────────

    async createRun(data: {
        tenantId: string
        checklistId: string
        entityId: string
        executedBy: string
    }) {
        const [run] = await getDb()
            .insert(checklistRuns)
            .values({
                tenantId: data.tenantId,
                checklistId: data.checklistId,
                entityId: data.entityId,
                executedBy: data.executedBy,
                status: 'IN_PROGRESS',
                answers: [],
            })
            .returning()
        return run
    }

    async findRunById(id: string, tenantId: string) {
        const [run] = await getDb()
            .select()
            .from(checklistRuns)
            .where(
                and(
                    eq(checklistRuns.id, id),
                    eq(checklistRuns.tenantId, tenantId)
                )
            )
        return run
    }

    async listRuns(tenantId: string, filters: {
        entityId?: string
        status?: string
        limit?: number
        offset?: number
    } = {}) {
        const { limit = 20, offset = 0 } = filters

        const conditions = [eq(checklistRuns.tenantId, tenantId)]
        if (filters.entityId) conditions.push(eq(checklistRuns.entityId, filters.entityId))
        if (filters.status) conditions.push(eq(checklistRuns.status, filters.status))

        const [rows, totalResult] = await Promise.all([
            getDb()
                .select({
                    id: checklistRuns.id,
                    checklistId: checklistRuns.checklistId,
                    checklistTitle: checklists.title,
                    entityId: checklistRuns.entityId,
                    entityName: entities.name,
                    executedBy: checklistRuns.executedBy,
                    executedByName: users.name,
                    status: checklistRuns.status,
                    score: checklistRuns.score,
                    riskLevel: checklistRuns.riskLevel,
                    startedAt: checklistRuns.startedAt,
                    completedAt: checklistRuns.completedAt,
                    createdAt: checklistRuns.createdAt,
                })
                .from(checklistRuns)
                .leftJoin(checklists, eq(checklistRuns.checklistId, checklists.id))
                .leftJoin(entities, eq(checklistRuns.entityId, entities.id))
                .leftJoin(users, eq(checklistRuns.executedBy, users.id))
                .where(and(...conditions))
                .orderBy(desc(checklistRuns.createdAt))
                .limit(limit)
                .offset(offset),
            getDb()
                .select({ total: count() })
                .from(checklistRuns)
                .where(and(...conditions)),
        ])

        return { data: rows, total: Number(totalResult[0]?.total ?? 0), hasMore: offset + limit < Number(totalResult[0]?.total ?? 0) }
    }

    async updateRunStatus(id: string, tenantId: string, status: string, score?: number, riskLevel?: string) {
        const setData: Record<string, unknown> = {
            status,
            updatedAt: new Date(),
        }
        if (score !== undefined) setData['score'] = score
        if (riskLevel) setData['riskLevel'] = riskLevel
        if (status === 'COMPLETED') setData['completedAt'] = new Date()

        const [run] = await getDb()
            .update(checklistRuns)
            .set(setData as any)
            .where(
                and(
                    eq(checklistRuns.id, id),
                    eq(checklistRuns.tenantId, tenantId)
                )
            )
            .returning()
        return run
    }
}
