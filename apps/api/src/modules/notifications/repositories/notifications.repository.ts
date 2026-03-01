import { db } from '../../../infra/db/db.js'
import { notifications } from '../../../infra/db/schema.js'
import { eq, and, desc, isNull } from 'drizzle-orm'

export class NotificationsRepository {
    async list(tenantId: string, userId: string, filters: { unreadOnly?: boolean; limit?: number }) {
        const conditions = [
            eq(notifications.tenantId, tenantId),
            sql`(${notifications.userId} = ${userId} OR ${notifications.userId} IS NULL)`,
            isNull(notifications.dismissedAt)
        ]

        if (filters.unreadOnly) {
            conditions.push(isNull(notifications.readAt))
        }

        return db
            .select()
            .from(notifications)
            .where(and(...conditions))
            .orderBy(desc(notifications.severity), desc(notifications.createdAt))
            .limit(filters.limit || 20)
    }

    async markAsRead(id: string, userId: string, tenantId: string) {
        await db
            .update(notifications)
            .set({ readAt: new Date() })
            .where(
                and(
                    eq(notifications.id, id),
                    eq(notifications.tenantId, tenantId),
                    sql`(${notifications.userId} = ${userId} OR ${notifications.userId} IS NULL)`,
                    isNull(notifications.readAt)
                )
            )
    }

    async markAllAsRead(userId: string, tenantId: string) {
        await db
            .update(notifications)
            .set({ readAt: new Date() })
            .where(
                and(
                    eq(notifications.tenantId, tenantId),
                    sql`(${notifications.userId} = ${userId} OR ${notifications.userId} IS NULL)`,
                    isNull(notifications.readAt)
                )
            )
    }
}

import { sql } from 'drizzle-orm'
