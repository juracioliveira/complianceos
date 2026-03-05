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

    async create(data: {
        tenantId: string
        userId?: string | undefined
        type: string
        severity: 'INFO' | 'WARNING' | 'CRITICAL'
        title: string
        body: string
        relatedEntityType?: string | undefined
        relatedEntityId?: string | undefined
        actionUrl?: string | undefined
    }) {
        const result = await db.execute(
            sql`INSERT INTO notifications
                (tenant_id, user_id, type, severity, title, body, related_entity_type, related_entity_id, action_url)
            VALUES
                (${data.tenantId}, ${data.userId ?? null}, ${data.type}, ${data.severity},
                 ${data.title}, ${data.body}, ${data.relatedEntityType ?? null},
                 ${data.relatedEntityId ?? null}, ${data.actionUrl ?? null})
            RETURNING id`
        )
        return result.rows[0]
    }
}

import { sql } from 'drizzle-orm'
