import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { tenantMiddleware } from '../../middlewares/tenant.middleware.js'
import { authorize } from '../../middlewares/authorize.middleware.js'
import type { JwtPayload } from '@compliance-os/types'
import { ValidationError, ForbiddenError } from '@compliance-os/types'
import { EntitiesService } from './services/entities.service.js'
import { EntitiesRepository } from './repositories/entities.repository.js'

const listQuerySchema = z.object({
    riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'UNKNOWN']).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']).optional(),
    entityType: z.enum(['CLIENTE', 'FORNECEDOR', 'PARCEIRO', 'COLABORADOR']).optional(),
    search: z.string().max(100).optional(),
    sort: z.enum(['name:asc', 'name:desc', 'risk_level:asc', 'risk_level:desc', 'created_at:desc', 'created_at:asc']).default('created_at:desc'),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0),
})

const createEntitySchema = z.object({
    name: z.string().min(3).max(200),
    entityType: z.enum(['CLIENTE', 'FORNECEDOR', 'PARCEIRO', 'COLABORADOR']),
    cnpj: z.string().length(14).optional(),
    cpf: z.string().length(11).optional(),
    sector: z.string().max(100).optional(),
})

const updateEntitySchema = z.object({
    name: z.string().min(3).max(200).optional(),
    sector: z.string().max(100).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']).optional(),
    blockedReason: z.string().max(500).optional(),
})

const entitiesRepository = new EntitiesRepository()
const entitiesService = new EntitiesService(entitiesRepository)

export const entitiesRoutes: FastifyPluginAsync = async (fastify) => {

    // POST /v1/entities — criar entidade
    fastify.post('/', {
        preHandler: [authMiddleware, tenantMiddleware, authorize('create', ['ADMIN', 'COMPLIANCE_OFFICER', 'ANALYST'])],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as JwtPayload
            const body = createEntitySchema.safeParse(request.body)
            if (!body.success) throw new ValidationError('Dados de entidade inválidos', body.error)

            const entity = await entitiesService.createEntity(request.tenantId, user.sub, body.data as any)
            return reply.status(201).send({ data: entity })
        }
    })

    // GET /v1/entities — listar com paginação real e filtros
    fastify.get('/', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as JwtPayload
            const query = listQuerySchema.safeParse(request.query)
            if (!query.success) throw new ValidationError('Parâmetros inválidos', query.error)
            const q = query.data

            const { data, total } = await entitiesService.listEntities(
                request.tenantId,
                // Construir objeto apenas com chaves definidas (exactOptionalPropertyTypes)
                Object.fromEntries(
                    Object.entries({
                        riskLevel: q.riskLevel,
                        status: q.status,
                        entityType: q.entityType,
                        search: q.search,
                        sort: q.sort,
                        limit: q.limit,
                        offset: q.offset,
                    }).filter(([, v]) => v !== undefined)
                ) as Parameters<typeof entitiesService.listEntities>[1]
            )

            const isReadOnly = user.role === 'READONLY'

            return reply.send({
                data: data.map(r => ({
                    id: r.id,
                    name: r.name,
                    cnpj: isReadOnly ? '••••••••••••••' : r.cnpj,
                    cpf: isReadOnly ? '•••••••••••' : r.cpf,
                    entityType: r.entityType,
                    riskLevel: r.riskLevel,
                    riskScore: r.riskScore,
                    kycStatus: r.kycStatus,
                    status: r.status,
                    sector: r.sector,
                    createdAt: r.createdAt
                })),
                meta: {
                    total,
                    limit: q.limit,
                    offset: q.offset,
                    hasMore: q.offset + q.limit < total,
                }
            })
        },
    })

    // GET /v1/entities/:id — detalhe
    fastify.get('/:id', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as JwtPayload
            const { id } = request.params as { id: string }
            const entity = await entitiesService.getEntityDetails(id, request.tenantId)

            if (user.role === 'READONLY' && entity) {
                if (entity.cnpj) (entity as any).cnpj = '••••••••••••••'
                if (entity.cpf) (entity as any).cpf = '•••••••••••'
            }

            return reply.send({ data: entity })
        },
    })

    // PATCH /v1/entities/:id — atualizar dados
    fastify.patch('/:id', {
        preHandler: [authMiddleware, tenantMiddleware, authorize('edit', ['ADMIN', 'COMPLIANCE_OFFICER', 'ANALYST'])],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string }
            const body = updateEntitySchema.safeParse(request.body)
            if (!body.success) throw new ValidationError('Dados inválidos', body.error)

            const updated = await entitiesService.updateEntity(
                id,
                request.tenantId,
                Object.fromEntries(
                    Object.entries(body.data).filter(([, v]) => v !== undefined)
                ) as Parameters<typeof entitiesService.updateEntity>[2]
            )
            return reply.send({ data: updated })
        }
    })

    // DELETE /v1/entities/:id — inativar (soft delete)
    fastify.delete('/:id', {
        preHandler: [authMiddleware, tenantMiddleware, authorize('delete', ['ADMIN', 'COMPLIANCE_OFFICER'])],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string }
            await entitiesService.deleteEntity(id, request.tenantId)
            return reply.status(204).send()
        }
    })

    // POST /v1/entities/:id/approve-risk — aprovar avaliação de risco (SoD enforcement)
    fastify.post('/:id/approve-risk', {
        preHandler: [authMiddleware, tenantMiddleware, authorize('approve', ['ADMIN', 'COMPLIANCE_OFFICER'])],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as JwtPayload
            const { id } = request.params as { id: string }
            const result = await entitiesService.approveRisk(id, request.tenantId, user.sub)
            return reply.send({ data: result })
        }
    })

    // POST /v1/entities/:id/sync — sincronizar dados da RFB
    fastify.post('/:id/sync', {
        preHandler: [authMiddleware, tenantMiddleware, authorize(undefined, ['ADMIN', 'COMPLIANCE_OFFICER'])],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string }
            const result = await entitiesService.syncKybData(id, request.tenantId)
            return reply.send(result)
        }
    })

    // POST /v1/entities/:id/due-diligence — iniciar due diligence automatizada
    fastify.post('/:id/due-diligence', {
        preHandler: [authMiddleware, tenantMiddleware, authorize('create', ['ADMIN', 'COMPLIANCE_OFFICER', 'ANALYST'])],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as JwtPayload
            const { id } = request.params as { id: string }
            const result = await entitiesService.startAutomatedDueDiligence(id, request.tenantId, user.sub)
            return reply.send(result)
        }
    })
}
