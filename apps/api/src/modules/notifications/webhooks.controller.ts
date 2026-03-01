import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { tenantMiddleware } from '../../middlewares/tenant.middleware.js'
import { WebhooksService } from './services/webhooks.service.js'
import { WebhooksRepository } from './repositories/webhooks.repository.js'
import type { JwtPayload } from '@compliance-os/types'

const webhookSchema = z.object({
    url: z.string().url(),
    description: z.string().max(200).optional(),
    events: z.array(z.string()).default(['*']),
})

export const webhooksRoutes: FastifyPluginAsync = async (fastify) => {
    const webhooksRepository = new WebhooksRepository()
    const webhooksService = new WebhooksService(webhooksRepository)

    fastify.get('/', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const result = await webhooksService.listWebhooks(request.tenantId)
            return reply.send({ data: result })
        }
    })

    fastify.post('/', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as JwtPayload
            if (user.role !== 'ADMIN') {
                return reply.status(403).send({ message: 'Somente admins podem gerenciar webhooks' })
            }

            const body = webhookSchema.parse(request.body)
            const webhookData: any = {
                url: body.url,
                events: body.events
            }
            if (body.description) webhookData.description = body.description

            const result = await webhooksService.registerWebhook(request.tenantId, webhookData)
            return reply.status(201).send({ data: result })
        }
    })

    fastify.delete('/:id', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as JwtPayload
            if (user.role !== 'ADMIN') {
                return reply.status(403).send({ message: 'Somente admins podem gerenciar webhooks' })
            }

            const { id } = request.params as { id: string }
            await webhooksService.deleteWebhook(id, request.tenantId)
            return reply.status(204).send()
        }
    })
}
