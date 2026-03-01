import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { tenantMiddleware } from '../../middlewares/tenant.middleware.js'
import { ForbiddenError } from '@compliance-os/types'

import { AuditRepository } from './repositories/audit.repository.js'
import { AuditService } from './services/audit.service.js'
import { DocumentsRepository } from '../documents/repositories/documents.repository.js'
import { DocumentsService } from '../documents/services/documents.service.js'
import type { JwtPayload } from '@compliance-os/types'

export const auditRoutes: FastifyPluginAsync = async (fastify) => {
    const auditRepository = new AuditRepository()
    const documentsRepository = new DocumentsRepository()
    const documentsService = new DocumentsService(documentsRepository)
    const auditService = new AuditService(auditRepository, documentsService)

    // GET /v1/audit/events
    fastify.get('/events', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as JwtPayload
            const query = request.query as any

            const events = await auditService.listEvents(request.tenantId, query, user.role)

            // Meta-auditoria
            await auditService.logEvent({
                tenantId: request.tenantId,
                actorId: user.sub,
                actorType: 'USER',
                module: 'ADMIN',
                action: 'audit.events.query',
                resourceType: 'audit_events',
                result: 'SUCCESS',
                metadata: { query }
            })

            return reply.send({ data: events })
        },
    })

    // POST /v1/audit/entities/:id/certificate
    fastify.post('/entities/:id/certificate', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as JwtPayload
            const { id } = request.params as { id: string }

            const result = await auditService.generateComplianceCertificate(
                request.tenantId,
                id,
                user.sub
            )

            return reply.status(202).send({ data: result })
        }
    })

    // GET /v1/audit/verify
    // Endpoint para auditores validarem a integridade da corrente de logs
    fastify.get('/verify', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as JwtPayload
            if (!['AUDITOR', 'ADMIN'].includes(user.role)) {
                throw new ForbiddenError('Acesso restrito a auditores e administradores')
            }

            const result = await auditService.verifyIntegrity(request.tenantId)

            await auditService.logEvent({
                tenantId: request.tenantId,
                actorId: user.sub,
                actorType: 'USER',
                module: 'AUDIT',
                action: 'audit.integrity.verify',
                result: result.valid ? 'SUCCESS' : 'FAILURE',
                metadata: { violationsCount: result.violations.length }
            })

            return reply.send({ data: result })
        }
    })
}
