import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { tenantMiddleware } from '../../middlewares/tenant.middleware.js'
import { ValidationError, ForbiddenError, ConflictError, NotFoundError } from '@compliance-os/types'
import type { JwtPayload } from '@compliance-os/types'
import { getDb } from '../../infra/db/db.js'
import { users } from '../../infra/db/schema.js'
import { eq, and, desc, sql } from 'drizzle-orm'

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

    // GET /v1/users — listar usuários do tenant
    fastify.get('/', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as JwtPayload
            if (user.role !== 'ADMIN') throw new ForbiddenError('Apenas ADMIN pode listar usuários')

            const rows = await getDb()
                .select({
                    id: users.id,
                    email: users.email,
                    name: users.name,
                    role: users.role,
                    status: users.status,
                    mfaEnabled: users.mfaEnabled,
                    lastLoginAt: users.lastLoginAt,
                    createdAt: users.createdAt,
                })
                .from(users)
                .where(eq(users.tenantId, request.tenantId))
                .orderBy(asc_name())

            return reply.send({ data: rows, meta: { total: rows.length } })
        },
    })

    // GET /v1/users/:id — detalhe de usuário
    fastify.get('/:id', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string }
            const user = request.user as JwtPayload
            const isSelf = id === user.sub

            if (!isSelf && user.role !== 'ADMIN') throw new ForbiddenError('Sem permissão para ver este usuário')

            const [row] = await getDb()
                .select({
                    id: users.id,
                    email: users.email,
                    name: users.name,
                    role: users.role,
                    status: users.status,
                    mfaEnabled: users.mfaEnabled,
                    lastLoginAt: users.lastLoginAt,
                    createdAt: users.createdAt,
                })
                .from(users)
                .where(and(eq(users.id, id), eq(users.tenantId, request.tenantId)))
                .limit(1)

            if (!row) throw new NotFoundError('Usuário')
            return reply.send({ data: row })
        },
    })

    // POST /v1/users/invite — convidar novo usuário
    fastify.post('/invite', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as JwtPayload
            if (user.role !== 'ADMIN') throw new ForbiddenError('Apenas ADMIN pode convidar usuários')

            const body = inviteUserSchema.safeParse(request.body)
            if (!body.success) throw new ValidationError('Dados inválidos', body.error)

            // Verificar duplicidade dentro do tenant
            const [existing] = await getDb()
                .select({ id: users.id })
                .from(users)
                .where(and(
                    eq(users.email, body.data.email.toLowerCase()),
                    eq(users.tenantId, request.tenantId)
                ))
                .limit(1)

            if (existing) throw new ConflictError(`Usuário com email ${body.data.email} já existe neste tenant`)

            const inviteToken = crypto.randomUUID()
            const inviteExpires = new Date(Date.now() + 48 * 60 * 60 * 1000) // 48h

            const [newUser] = await getDb()
                .insert(users)
                .values({
                    tenantId: request.tenantId,
                    email: body.data.email.toLowerCase(),
                    name: body.data.name,
                    role: body.data.role,
                    status: 'INACTIVE',
                    inviteToken,
                    inviteExpires,
                    invitedBy: user.sub,
                    passwordHash: '',
                })
                .returning({ id: users.id })

            // TODO: enviar email de convite
            if (process.env['NODE_ENV'] !== 'production') {
                console.log(`[DEV] Invite token for ${body.data.email}: ${inviteToken}`)
            }

            return reply.status(201).send({
                data: {
                    id: newUser!.id,
                    email: body.data.email,
                    role: body.data.role,
                    status: 'INVITED',
                    inviteExpires: inviteExpires.toISOString(),
                    inviteToken: process.env['NODE_ENV'] !== 'production' ? inviteToken : undefined,
                },
                meta: { inviteEmailSent: false },
            })
        },
    })

    // PATCH /v1/users/:id — atualizar usuário
    fastify.patch('/:id', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string }
            const user = request.user as JwtPayload
            const isSelf = id === user.sub

            if (!isSelf && user.role !== 'ADMIN') throw new ForbiddenError('Sem permissão para alterar este usuário')

            const body = updateUserSchema.safeParse(request.body)
            if (!body.success) throw new ValidationError('Dados inválidos', body.error)

<<<<<<< HEAD
            // Apenas ADMIN pode alterar roles (de qualquer usuário, incluindo o próprio)
            if (request.user.role !== 'ADMIN') {
                delete body.data.role
=======
            const updateData: any = {}
            if (body.data.name !== undefined) updateData.name = body.data.name
            // Only ADMIN can change role/status
            if (user.role === 'ADMIN') {
                if (body.data.role !== undefined) updateData.role = body.data.role
                if (body.data.status !== undefined) updateData.status = body.data.status
>>>>>>> be9ff4e (fix(api): corrigir todas as APIs quebradas e erros TypeScript)
            }

            if (Object.keys(updateData).length === 0) return reply.status(204).send()

            const [updated] = await getDb()
                .update(users)
                .set({ ...updateData, updatedAt: new Date() })
                .where(and(eq(users.id, id), eq(users.tenantId, request.tenantId)))
                .returning({ id: users.id })

            if (!updated) throw new NotFoundError('Usuário')
            return reply.send({ data: { id, updated: true } })
        },
    })

    // DELETE /v1/users/:id — desativar usuário (soft delete)
    fastify.delete('/:id', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string }
            const user = request.user as JwtPayload

            if (user.role !== 'ADMIN') throw new ForbiddenError('Apenas ADMIN pode desativar usuários')
            if (id === user.sub) throw new ForbiddenError('Não é possível desativar a própria conta')

            const [updated] = await getDb()
                .update(users)
                .set({ status: 'INACTIVE', updatedAt: new Date() })
                .where(and(eq(users.id, id), eq(users.tenantId, request.tenantId)))
                .returning({ id: users.id })

            if (!updated) throw new NotFoundError('Usuário')
            return reply.status(204).send()
        },
    })
}

function asc_name() {
    return users.name
}
