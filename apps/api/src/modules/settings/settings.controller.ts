import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { tenantMiddleware } from '../../middlewares/tenant.middleware.js'
import { ForbiddenError, ValidationError } from '@compliance-os/types'

const updateSettingsSchema = z.object({
    name: z.string().min(2).max(200).optional(),
    authorizedDomain: z.string().max(200).optional(),
})

export const settingsRoutes: FastifyPluginAsync = async (fastify) => {
    // GET /v1/settings
    fastify.get('/', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const result = await request.db.query(
                `SELECT id, name, cnpj, plan, status, settings, billing_email, created_at
                 FROM tenants
                 WHERE id = $1
                 LIMIT 1`,
                [request.tenantId],
            )

            if (result.rows.length === 0) {
                return reply.status(404).send({ error: 'Tenant não encontrado' })
            }

            const tenant = result.rows[0] as any
            return reply.send({
                data: {
                    id: tenant.id,
                    name: tenant.name,
                    cnpj: tenant.cnpj,
                    plan: tenant.plan,
                    status: tenant.status,
                    authorizedDomain: tenant.settings?.authorizedDomain ?? null,
                    billingEmail: tenant.billing_email,
                    createdAt: tenant.created_at,
                },
            })
        },
    })

    // PATCH /v1/settings
    fastify.patch('/', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            if (request.user.role !== 'ADMIN') {
                throw new ForbiddenError('Apenas ADMIN pode alterar as configurações do tenant')
            }

            const body = updateSettingsSchema.safeParse(request.body)
            if (!body.success) throw new ValidationError('Dados inválidos', body.error)

            const updates: string[] = []
            const params: unknown[] = []
            let idx = 1

            if (body.data.name !== undefined) {
                updates.push(`name = $${idx++}`)
                params.push(body.data.name)
            }

            if (body.data.authorizedDomain !== undefined) {
                updates.push(`settings = jsonb_set(settings, '{authorizedDomain}', $${idx++}::jsonb)`)
                params.push(JSON.stringify(body.data.authorizedDomain))
            }

            if (updates.length === 0) return reply.status(204).send()

            params.push(request.tenantId)
            await request.db.query(
                `UPDATE tenants SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx}`,
                params,
            )

            return reply.send({ data: { updated: true } })
        },
    })
}
