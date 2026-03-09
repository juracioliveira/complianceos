import { getDb } from '../../../infra/db/db.js'
import { webhooks } from '../../../infra/db/schema.js'
import { eq, and } from 'drizzle-orm'

export class WebhooksRepository {
    async create(data: any) {
        const [webhook] = await getDb().insert(webhooks).values(data).returning()
        return webhook
    }

    async findById(id: string, tenantId: string) {
        const [webhook] = await getDb()
            .select()
            .from(webhooks)
            .where(
                and(
                    eq(webhooks.id, id),
                    eq(webhooks.tenantId, tenantId)
                )
            )
            .limit(1)
        return webhook
    }

    async findActiveByTenant(tenantId: string) {
        return getDb()
            .select()
            .from(webhooks)
            .where(
                and(
                    eq(webhooks.tenantId, tenantId),
                    eq(webhooks.status, 'ACTIVE')
                )
            )
    }

    async delete(id: string, tenantId: string) {
        await getDb()
            .delete(webhooks)
            .where(
                and(
                    eq(webhooks.id, id),
                    eq(webhooks.tenantId, tenantId)
                )
            )
    }
}
