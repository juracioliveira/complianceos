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
    // Injeção manual (pode ser melhorada com DI no futuro)
    const auditRepository = new AuditRepository()
    const documentsRepository = new DocumentsRepository()
    const documentsService = new DocumentsService(documentsRepository)
    const auditService = new AuditService(auditRepository, documentsService)
    const intelligenceRepository = new IntelligenceRepository()
    const intelligenceService = new IntelligenceService(intelligenceRepository, auditService)

    // GET /v1/intelligence/ubo/:entityId
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
}
