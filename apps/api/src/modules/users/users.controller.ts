import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { tenantMiddleware } from '../../middlewares/tenant.middleware.js'
import { ValidationError, ForbiddenError, ConflictError, NotFoundError } from '@compliance-os/types'

const inviteUserSchema = z.object({
    email: z.string().email(),
    name: z.string().min(2).max(200),
    role: z.enum(['COMPLIANCE_OFFICER', 'ANALYST', 'AUDITOR', 'READONLY']),
})

const updateUserSchema = z.object({
    role: z.enum(['ADMIN', 'COMPLIANCE_OFFICER', 'ANALYST', 'AUDITOR', 'READONLY']).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
    name: z.string().min(2).max(200).optional(),
})

export const usersRoutes: FastifyPluginAsync = async (fastify) => {
    // GET /v1/users
    fastify.get('/', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            if (request.user.role !== 'ADMIN') {
                throw new ForbiddenError('Apenas ADMIN pode listar usuários')
            }

            const result = await request.db.query(
                `SELECT id, email, name, role, status, mfa_enabled,
                last_login_at, created_at
         FROM users
         ORDER BY name ASC`,
            )

            return reply.send({ data: result.rows })
        },
    })

    // POST /v1/users/invite
    fastify.post('/invite', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            if (request.user.role !== 'ADMIN') {
                throw new ForbiddenError('Apenas ADMIN pode convidar usuários')
            }

            const body = inviteUserSchema.safeParse(request.body)
            if (!body.success) throw new ValidationError('Dados inválidos', body.error)

            // Verificar se email já existe no tenant
            const existing = await request.db.query(
                `SELECT id FROM users WHERE email = $1 LIMIT 1`,
                [body.data.email.toLowerCase()],
            )
            if (existing.rows.length > 0) {
                throw new ConflictError(`Usuário com email ${body.data.email} já existe neste tenant`)
            }

            const inviteToken = crypto.randomUUID()
            const inviteExpires = new Date(Date.now() + 48 * 60 * 60 * 1000) // 48h

            const result = await request.db.query<{ id: string }>(
                `INSERT INTO users (
          tenant_id, email, name, role, status,
          invite_token, invite_expires, invited_by, password_hash
        ) VALUES ($1, $2, $3, $4, 'INACTIVE', $5, $6, $7, '')
        RETURNING id`,
                [
                    request.tenantId,
                    body.data.email.toLowerCase(),
                    body.data.name,
                    body.data.role,
                    inviteToken,
                    inviteExpires.toISOString(),
                    request.user.sub,
                ],
            )

            // TODO: enviar email de convite com o token

            return reply.status(201).send({
                data: {
                    id: result.rows[0]!.id,
                    email: body.data.email,
                    role: body.data.role,
                    status: 'INVITED',
                    inviteExpires: inviteExpires.toISOString(),
                },
                meta: { inviteEmailSent: false }, // TODO: true após integrar email
            })
        },
    })

    // PATCH /v1/users/:id
    fastify.patch('/:id', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string }
            const isSelf = id === request.user.sub

            // ADMIN pode alterar qualquer usuário; outros apenas o próprio perfil
            if (!isSelf && request.user.role !== 'ADMIN') {
                throw new ForbiddenError('Sem permissão para alterar este usuário')
            }

            const body = updateUserSchema.safeParse(request.body)
            if (!body.success) throw new ValidationError('Dados inválidos', body.error)

            // Apenas ADMIN pode alterar roles (de qualquer usuário, incluindo o próprio)
            if (request.user.role !== 'ADMIN') {
                delete body.data.role
            }

            const updates: string[] = []
            const params: unknown[] = []
            let idx = 1

            if (body.data.role !== undefined) { updates.push(`role = $${idx++}`); params.push(body.data.role) }
            if (body.data.status !== undefined) { updates.push(`status = $${idx++}`); params.push(body.data.status) }
            if (body.data.name !== undefined) { updates.push(`name = $${idx++}`); params.push(body.data.name) }

            if (updates.length === 0) return reply.status(204).send()

            params.push(id)
            const result = await request.db.query(
                `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id`,
                params,
            )

            if (result.rowCount === 0) throw new NotFoundError('Usuário')
            return reply.send({ data: { id, updated: true } })
        },
    })
}
