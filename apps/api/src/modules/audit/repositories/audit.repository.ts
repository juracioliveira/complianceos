import { db } from '../../../infra/db/db.js'
import { auditEvents } from '../../../infra/db/schema.js'
import { eq, and, asc, desc, gte, lte, sql } from 'drizzle-orm'

export class AuditRepository {
    async list(tenantId: string, filters: any) {
        const conditions = [eq(auditEvents.tenantId, tenantId)]

        if (filters.from) conditions.push(gte(auditEvents.occurredAt, new Date(filters.from)))
        if (filters.to) conditions.push(lte(auditEvents.occurredAt, new Date(filters.to)))
        if (filters.module) conditions.push(eq(auditEvents.module, filters.module))
        if (filters.action) conditions.push(eq(auditEvents.action, filters.action))
        if (filters.actorId) conditions.push(eq(auditEvents.actorId, filters.actorId))
        if (filters.resourceId) conditions.push(eq(auditEvents.resourceId, filters.resourceId))
        if (filters.result) conditions.push(eq(auditEvents.result, filters.result))

        return db
            .select()
            .from(auditEvents)
            .where(and(...conditions))
            .orderBy(asc(auditEvents.occurredAt))
            .limit(filters.limit || 100)
    }

    async listAll(tenantId: string) {
        return db
            .select()
            .from(auditEvents)
            .where(eq(auditEvents.tenantId, tenantId))
            .orderBy(asc(auditEvents.occurredAt))
    }

    async getLastEvent(tenantId: string) {
        const [last] = await db
            .select()
            .from(auditEvents)
            .where(eq(auditEvents.tenantId, tenantId))
            .orderBy(desc(auditEvents.occurredAt))
            .limit(1)

        return last
    }

    async create(data: any) {
        const [event] = await db.insert(auditEvents).values(data).returning()
        return event
    }
}
