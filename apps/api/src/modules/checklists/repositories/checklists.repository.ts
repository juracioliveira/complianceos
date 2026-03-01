import { db } from '../../../infra/db/db.js'
import { checklistRuns, checklists } from '../../../infra/db/schema.js'
import { eq, and } from 'drizzle-orm'

export class ChecklistsRepository {
    async findRunById(id: string, tenantId: string) {
        const [run] = await db
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

    async findTemplateById(id: string, tenantId: string) {
        const [template] = await db
            .select()
            .from(checklists)
            .where(
                and(
                    eq(checklists.id, id),
                    eq(checklists.tenantId, tenantId)
                )
            )
        return template
    }

    async updateRunStatus(id: string, tenantId: string, status: string, responses?: any) {
        await db
            .update(checklistRuns)
            .set({
                status,
                responses: responses ? JSON.stringify(responses) : undefined,
                completedAt: status === 'COMPLETED' ? new Date() : null,
                updatedAt: new Date()
            })
            .where(
                and(
                    eq(checklistRuns.id, id),
                    eq(checklistRuns.tenantId, tenantId)
                )
            )
    }
}
