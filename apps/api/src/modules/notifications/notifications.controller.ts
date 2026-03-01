import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { tenantMiddleware } from '../../middlewares/tenant.middleware.js'
import { NotificationsRepository } from './repositories/notifications.repository.js'
import { NotificationsService } from './services/notifications.service.js'
import { WebhooksRepository } from './repositories/webhooks.repository.js'
import { WebhooksService } from './services/webhooks.service.js'
import type { JwtPayload } from '@compliance-os/types'

export const notificationsRoutes: FastifyPluginAsync = async (fastify) => {
    const webhooksRepository = new WebhooksRepository()
    const webhooksService = new WebhooksService(webhooksRepository)
    const notificationsRepository = new NotificationsRepository()
    const notificationsService = new NotificationsService(notificationsRepository, webhooksService)

    // GET /v1/notifications
    fastify.get('/', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as JwtPayload
            const { unread, limit } = request.query as { unread?: string; limit?: string }

            const filters: any = {
                unreadOnly: unread === 'true',
                limit: limit ? Number(limit) : 20
            }

            const result = await notificationsService.listNotifications(request.tenantId, user.sub, filters)
            return reply.send({ data: result })
        },
    })

    // PATCH /v1/notifications/:id/read
    fastify.patch('/:id/read', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as JwtPayload
            const { id } = request.params as { id: string }
            await notificationsService.readNotification(id, user.sub, request.tenantId)
            return reply.status(204).send()
        },
    })

    // POST /v1/notifications/mark-all-read
    fastify.post('/mark-all-read', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as JwtPayload
            await notificationsService.readAllNotifications(user.sub, request.tenantId)
            return reply.status(204).send()
        },
    })
}
