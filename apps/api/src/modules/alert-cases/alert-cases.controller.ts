import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { tenantMiddleware } from '../../middlewares/tenant.middleware.js'
import { authorize } from '../../middlewares/authorize.middleware.js'
import type { JwtPayload } from '@compliance-os/types'
import { ValidationError } from '@compliance-os/types'
import { AlertCasesService } from './services/alert-cases.service.js'
import { AlertCasesRepository } from './repositories/alert-cases.repository.js'
import { AuditService } from '../audit/services/audit.service.js'
import { AuditRepository } from '../audit/repositories/audit.repository.js'
import { DocumentsService } from '../documents/services/documents.service.js'
import { DocumentsRepository } from '../documents/repositories/documents.repository.js'
import { NotificationsService } from '../notifications/services/notifications.service.js'
import { NotificationsRepository } from '../notifications/repositories/notifications.repository.js'
import { WebhooksService } from '../notifications/services/webhooks.service.js'
import { WebhooksRepository } from '../notifications/repositories/webhooks.repository.js'
import { generateAlertCasesPdf } from './services/pdf-report.service.js'

// ─── Schemas de Validação ─────────────────────────────────────────────────────
const listQuerySchema = z.object({
    status: z.union([z.string(), z.array(z.string())]).optional(),
    severity: z.union([z.string(), z.array(z.string())]).optional(),
    source: z.string().optional(),
    assignedTo: z.string().uuid().optional(),
    entityId: z.string().uuid().optional(),
    limit: z.coerce.number().int().min(1).max(200).default(50),
    offset: z.coerce.number().int().min(0).default(0),
})

const createSchema = z.object({
    entityId: z.string().uuid().optional(),
    source: z.enum(['SANCTIONS_MATCH', 'PEP_MATCH', 'CHECKLIST_OVERDUE', 'HIGH_RISK_ENTITY', 'MANUAL']),
    severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
    title: z.string().min(5).max(300),
    description: z.string().max(5000).default(''),
    evidence: z.record(z.any()).optional(),
})

const updateSchema = z.object({
    status: z.enum(['OPEN', 'UNDER_REVIEW', 'ESCALATED', 'CLOSED_FALSE_POSITIVE', 'CLOSED_CONFIRMED']).optional(),
    severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
    assignedTo: z.string().uuid().nullable().optional(),
    resolutionNote: z.string().max(5000).optional(),
})

const exportSchema = z.object({
    status: z.union([z.string(), z.array(z.string())]).optional(),
    severity: z.union([z.string(), z.array(z.string())]).optional(),
    source: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(500).default(100),
})

// ─── Injeção de Dependência ───────────────────────────────────────────────────
const alertCasesRepository = new AlertCasesRepository()
const auditRepository = new AuditRepository()
const documentsRepository = new DocumentsRepository()
const documentsService = new DocumentsService(documentsRepository)
const auditService = new AuditService(auditRepository, documentsService)
const webhooksRepository = new WebhooksRepository()
const webhooksService = new WebhooksService(webhooksRepository)
const notificationsRepository = new NotificationsRepository()
const notificationsService = new NotificationsService(notificationsRepository, webhooksService)
const alertCasesService = new AlertCasesService(alertCasesRepository, auditService, notificationsService)

export const alertCasesRoutes: FastifyPluginAsync = async (fastify) => {

    // GET /v1/alert-cases
    fastify.get('/', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const query = listQuerySchema.safeParse(request.query)
            if (!query.success) throw new ValidationError('Parâmetros inválidos', query.error)

            const result = await alertCasesService.listCases(request.tenantId, query.data)
            return reply.send(result)
        },
    })

    // GET /v1/alert-cases/:id
    fastify.get('/:id', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string }
            const alertCase = await alertCasesService.getCase(id, request.tenantId)
            return reply.send({ data: alertCase })
        },
    })

    // POST /v1/alert-cases
    fastify.post('/', {
        preHandler: [authMiddleware, tenantMiddleware, authorize('create', ['ADMIN', 'COMPLIANCE_OFFICER', 'ANALYST'])],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as JwtPayload
            const body = createSchema.safeParse(request.body)
            if (!body.success) throw new ValidationError('Dados inválidos', body.error)

            const alertCase = await alertCasesService.createCase(
                request.tenantId,
                user.sub,
                {
                    source: body.data.source,
                    severity: body.data.severity,
                    title: body.data.title,
                    description: body.data.description,
                    ...(body.data.entityId !== undefined ? { entityId: body.data.entityId } : {}),
                    ...(body.data.evidence !== undefined ? { evidence: body.data.evidence } : {}),
                },
            )
            return reply.status(201).send({ data: alertCase })
        },
    })

    // PATCH /v1/alert-cases/:id
    fastify.patch('/:id', {
        preHandler: [authMiddleware, tenantMiddleware, authorize('edit', ['ADMIN', 'COMPLIANCE_OFFICER', 'ANALYST'])],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as JwtPayload
            const { id } = request.params as { id: string }
            const body = updateSchema.safeParse(request.body)
            if (!body.success) throw new ValidationError('Dados inválidos', body.error)

            let updated: any

            // Atualização de status com máquina de estados
            if (body.data.status) {
                updated = await alertCasesService.updateCaseStatus(
                    id,
                    request.tenantId,
                    user.sub,
                    body.data.status,
                    body.data.resolutionNote,
                )
            }
            // Reatribuição de responsável
            else if ('assignedTo' in body.data) {
                updated = await alertCasesService.assignCase(
                    id,
                    request.tenantId,
                    user.sub,
                    body.data.assignedTo ?? null,
                )
            }
            else {
                // Atualização de severity ou outros campos via update direto
                const existing = await alertCasesService.getCase(id, request.tenantId)
                updated = existing // retorna sem alterar se nenhum campo relevante
            }

            return reply.send({ data: updated })
        },
    })

    // POST /v1/alert-cases/export  — P1-C: Download do relatório PDF regulatório
    fastify.post('/export', {
        preHandler: [authMiddleware, tenantMiddleware, authorize('export', ['ADMIN', 'COMPLIANCE_OFFICER', 'AUDITOR'])],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as JwtPayload
            const body = exportSchema.safeParse(request.body)
            if (!body.success) throw new ValidationError('Parâmetros inválidos', body.error)

            // Buscar casos com os filtros solicitados
            const { data: cases } = await alertCasesService.listCases(request.tenantId, {
                ...(body.data.status !== undefined ? { status: body.data.status } : {}),
                ...(body.data.severity !== undefined ? { severity: body.data.severity } : {}),
                ...(body.data.source !== undefined ? { source: body.data.source } : {}),
                limit: body.data.limit,
                offset: 0,
            })

            // Gerar PDF
            const pdfBuffer = generateAlertCasesPdf(cases, {
                tenantName: request.tenantId,
                generatedByName: user.sub,
                filters: {
                    ...(body.data.status !== undefined ? { status: body.data.status } : {}),
                    ...(body.data.severity !== undefined ? { severity: body.data.severity } : {}),
                    ...(body.data.source !== undefined ? { source: body.data.source } : {}),
                },
            })

            const filename = `relatorio-alertas-${new Date().toISOString().slice(0, 10)}.pdf`

            return reply
                .header('Content-Type', 'application/pdf')
                .header('Content-Disposition', `attachment; filename="${filename}"`)
                .header('Content-Length', pdfBuffer.length)
                .send(pdfBuffer)
        },
    })
}
