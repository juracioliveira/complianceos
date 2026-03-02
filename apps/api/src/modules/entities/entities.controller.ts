import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { tenantMiddleware } from '../../middlewares/tenant.middleware.js'
import type { JwtPayload } from '@compliance-os/types'
import { ValidationError, ForbiddenError, paginationSchema } from '@compliance-os/types'
import { EntitiesService } from './services/entities.service.js'
import { EntitiesRepository } from './repositories/entities.repository.js'

const listEntitiesSchema = paginationSchema.extend({
    'filter[risk_level]': z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'UNKNOWN']).optional(),
    'filter[status]': z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']).optional(),
    'filter[entity_type]': z.enum(['CLIENTE', 'FORNECEDOR', 'PARCEIRO', 'COLABORADOR']).optional(),
    search: z.string().max(100).optional(),
    sort: z.enum(['name:asc', 'name:desc', 'risk_level:asc', 'risk_level:desc', 'created_at:desc', 'created_at:asc']).default('created_at:desc'),
})

const createEntitySchema = z.object({
    name: z.string().min(3).max(200),
    entityType: z.enum(['CLIENTE', 'FORNECEDOR', 'PARCEIRO', 'COLABORADOR']),
    cnpj: z.string().length(14).optional(),
    cpf: z.string().length(11).optional(),
    sector: z.string().max(100).optional(),
})

// Injeção de Dependência Manual
const entitiesRepository = new EntitiesRepository()
const entitiesService = new EntitiesService(entitiesRepository)

export const entitiesRoutes: FastifyPluginAsync = async (fastify) => {
    // POST /v1/entities
    fastify.post('/', {
        preHandler: [authMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as JwtPayload
            const body = createEntitySchema.safeParse(request.body)
            if (!body.success) throw new ValidationError('Dados de entidade inválidos', body.error)

            const entity = await entitiesService.createEntity(user.tenantId, user.sub, body.data as any)

            return reply.status(201).send({ data: entity })
        }
    })

    // GET /v1/entities
    fastify.get('/', {
        preHandler: [authMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as JwtPayload
            const query = listEntitiesSchema.safeParse(request.query)
            if (!query.success) throw new ValidationError('Parâmetros inválidos', query.error)

            const data = await entitiesService.listEntities(user.tenantId)

            return reply.send({
                data: data.map(r => ({
                    id: r.id,
                    name: r.name,
                    cnpj: r.cnpj,
                    cpf: r.cpf,
                    entityType: r.entityType,
                    riskLevel: r.riskLevel,
                    kycStatus: r.kycStatus,
                    status: r.status,
                    createdAt: r.createdAt
                })),
                meta: {
                    total: data.length,
                    limit: query.data.limit,
                    hasMore: false,
                }
            })
        },
    })

    // GET /v1/entities/:id
    fastify.get('/:id', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string }
            const entity = await entitiesService.getEntityDetails(id, request.tenantId)
            return reply.send({ data: entity })
        },
    })

    // POST /v1/entities/:id/sync
    fastify.post('/:id/sync', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as JwtPayload
            if (!['COMPLIANCE_OFFICER', 'ADMIN'].includes(user.role)) {
                throw new ForbiddenError('Apenas COMPLIANCE_OFFICER ou ADMIN podem sincronizar dados')
            }
            const { id } = request.params as { id: string }
            const result = await entitiesService.syncKybData(id, request.tenantId)
            return reply.send(result)
        }
    })

    // POST /v1/entities/:id/due-diligence
    fastify.post('/:id/due-diligence', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as JwtPayload
            const { id } = request.params as { id: string }
            const result = await entitiesService.startAutomatedDueDiligence(id, request.tenantId, user.sub)
            return reply.send(result)
        }
    })
}
