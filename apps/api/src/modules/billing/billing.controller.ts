import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { tenantMiddleware } from '../../middlewares/tenant.middleware.js'
import { BillingService } from './services/billing.service.js'
import { BillingRepository } from './repositories/billing.repository.js'
import type { JwtPayload } from '@compliance-os/types'

export const billingRoutes: FastifyPluginAsync = async (fastify) => {
    const billingRepository = new BillingRepository()
    const billingService = new BillingService(billingRepository)

    // GET /v1/billing/subscription
    fastify.get('/subscription', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const data = await billingService.getSubscription(request.tenantId)
            return reply.send({ data })
        }
    })

    // POST /v1/billing/pix
    fastify.post('/pix', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const { amount } = request.body as { amount: number }
            if (!amount || amount <= 0) {
                return reply.status(400).send({ error: 'Valor inválido' })
            }
            const data = await billingService.createPixCharge(request.tenantId, amount)
            return reply.send({ data })
        }
    })

    // POST /v1/billing/webhook (Público, validado por signature do provider)
    fastify.post('/webhook', async (request: FastifyRequest, reply: FastifyReply) => {
        const result = await billingService.handleWebhook(request.body)
        return reply.send(result)
    })
}
