import { getDb } from '../../../infra/db/db.js'
import { checklistRuns, checklists } from '../../../infra/db/schema.js'
import { eq, and } from 'drizzle-orm'

export class ChecklistsRepository {
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

    async findTemplateById(id: string, tenantId: string) {
        const [template] = await getDb()
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

    async updateRunStatus(id: string, tenantId: string, status: string, answers?: any) {
        await getDb()
            .update(checklistRuns)
            .set({
                status,
                answers: answers ? JSON.stringify(answers) : undefined,
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
