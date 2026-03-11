import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { tenantMiddleware } from '../../middlewares/tenant.middleware.js'
import { IntelligenceService } from './services/intelligence.service.js'
import { IntelligenceRepository } from './repositories/intelligence.repository.js'
import { AuditService } from '../audit/services/audit.service.js'
import { AuditRepository } from '../audit/repositories/audit.repository.js'
import { DocumentsService } from '../documents/services/documents.service.js'
import { DocumentsRepository } from '../documents/repositories/documents.repository.js'
import type { JwtPayload } from '@compliance-os/types'

export const intelligenceRoutes: FastifyPluginAsync = async (fastify) => {
    const auditRepository = new AuditRepository()
    const documentsRepository = new DocumentsRepository()
    const documentsService = new DocumentsService(documentsRepository)
    const auditService = new AuditService(auditRepository, documentsService)
    const intelligenceRepository = new IntelligenceRepository()
    const intelligenceService = new IntelligenceService(intelligenceRepository, auditService)

    // GET /v1/intelligence/ubo/:entityId — buscar dados UBO
    fastify.get('/ubo/:entityId', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as JwtPayload
            const { entityId } = request.params as { entityId: string }
            const { taxId } = request.query as { taxId?: string }

            if (!taxId) {
                return reply.status(400).send({ error: 'taxId (CNPJ/TaxId) é obrigatório' })
            }

            const data = await intelligenceService.fetchGlobalUboData(
                entityId,
                taxId,
                request.tenantId,
                user.sub
            )

            return reply.send({ data })
        }
    })

    // GET /v1/intelligence/sanctions/:entityId — screening de sanções
    fastify.get('/sanctions/:entityId', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as JwtPayload
            const { entityId } = request.params as { entityId: string }

            const data = await intelligenceService.getSanctionsData(entityId, request.tenantId, user.sub)
            return reply.send({ data })
        }
    })

    // GET /v1/intelligence/report/:entityId — relatório consolidado de inteligência
    fastify.get('/report/:entityId', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const { entityId } = request.params as { entityId: string }
            const data = await intelligenceService.getIntelligenceReport(entityId, request.tenantId)
            return reply.send({ data })
        }
    })
}
