import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { tenantMiddleware } from '../../middlewares/tenant.middleware.js'
import { ValidationError } from '@compliance-os/types'
import type { JwtPayload } from '@compliance-os/types'
import { DocumentsService } from './services/documents.service.js'
import { DocumentsRepository } from './repositories/documents.repository.js'

const generateDocSchema = z.object({
    docType: z.string(), // O service valida o enum ou roles
    entityId: z.string().uuid().optional().nullable(),
    params: z.record(z.unknown()).default({}),
})

export const documentsRoutes: FastifyPluginAsync = async (fastify) => {
    const documentsRepository = new DocumentsRepository()
    const documentsService = new DocumentsService(documentsRepository)

    // POST /v1/documents/generate
    fastify.post('/generate', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as JwtPayload
            const body = generateDocSchema.safeParse(request.body)
            if (!body.success) throw new ValidationError('Dados inválidos', body.error)

            const result = await documentsService.requestDocumentGeneration({
                tenantId: request.tenantId,
                userId: user.sub,
                userRole: user.role,
                docType: body.data.docType,
                entityId: body.data.entityId ?? null,
                params: body.data.params,
            })

            return reply.status(202).send({
                data: result,
                meta: {
                    webhookEvent: 'document.ready',
                    pollUrl: `/v1/documents/jobs/${result.jobId}`,
                },
            })
        },
    })

    // GET /v1/documents/jobs/:jobId
    fastify.get('/jobs/:jobId', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const { jobId } = request.params as { jobId: string }
            const result = await documentsService.getJobStatus(jobId, request.tenantId)
            return reply.send({ data: result })
        },
    })

    // GET /v1/documents/:id/download
    fastify.get('/:id/download', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string }
            const result = await documentsService.getDownloadLink(id, request.tenantId)
            return reply.send({ data: result })
        },
    })

    // GET /v1/documents
    fastify.get('/', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const { docType, limit } = request.query as { docType?: string; limit?: string }
            const filters: { docType?: string; limit?: number } = {
                limit: limit ? Number(limit) : 50
            }
            if (docType) filters.docType = docType

            const result = await documentsService.listDocuments(request.tenantId, filters)
            return reply.send({ data: result })
        },
    })
    // POST /v1/documents/:id/sign
    fastify.post('/:id/sign', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as JwtPayload
            const { id } = request.params as { id: string }
            const result = await documentsService.signDocument(id, request.tenantId, user.sub)
            return reply.send({ data: result })
        }
    })
}
