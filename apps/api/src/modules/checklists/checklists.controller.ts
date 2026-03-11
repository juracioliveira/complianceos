import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { tenantMiddleware } from '../../middlewares/tenant.middleware.js'
import { authorize } from '../../middlewares/authorize.middleware.js'
import { ValidationError, ForbiddenError } from '@compliance-os/types'
import type { JwtPayload } from '@compliance-os/types'
import { ChecklistsService } from './services/checklists.service.js'
import { ChecklistsRepository } from './repositories/checklists.repository.js'

const createRunSchema = z.object({
    checklistId: z.string().uuid(),
    entityId: z.string().uuid(),
    answers: z.array(z.object({
        itemId: z.string(),
        answer: z.union([z.boolean(), z.number(), z.string()]),
        note: z.string().optional(),
    })).default([]),
})

const listRunsQuerySchema = z.object({
    entityId: z.string().uuid().optional(),
    status: z.enum(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
})

const checklistsRepository = new ChecklistsRepository()
const checklistsService = new ChecklistsService(checklistsRepository)

// ─── Handler: criar run ───────────────────────────────────────────────────────
async function handleCreateRun(request: FastifyRequest, reply: FastifyReply) {
    const body = createRunSchema.parse(request.body)
    const user = request.user as JwtPayload

    const run = await checklistsRepository.createRun({
        tenantId: request.tenantId,
        checklistId: body.checklistId,
        entityId: body.entityId,
        executedBy: user.sub,
    })

    return reply.status(201).send({ data: run })
}

// ─── Handler: buscar run por ID ───────────────────────────────────────────────
async function handleGetRun(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const run = await checklistsRepository.findRunById(id, request.tenantId)
    if (!run) return reply.status(404).send({ error: 'Execução não encontrada' })
    return reply.send({ data: run })
}

// ─── Handler: completar run ───────────────────────────────────────────────────
async function handleCompleteRun(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user as JwtPayload
    if (!['COMPLIANCE_OFFICER', 'ADMIN'].includes(user.role)) {
        throw new ForbiddenError('Apenas COMPLIANCE_OFFICER ou ADMIN podem completar checklists')
    }
    const { id } = request.params as { id: string }
    const result = await checklistsService.completeChecklist(id, request.tenantId)
    return reply.send(result)
}

export const checklistsRoutes: FastifyPluginAsync = async (fastify) => {

    // GET /v1/checklists — listar templates de sistema e do tenant
    fastify.get('/', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const { status = 'ACTIVE' } = request.query as { status?: string }
            const templates = await checklistsRepository.listTemplates(request.tenantId, status)
            return reply.send({ data: templates })
        },
    })

    // GET /v1/checklists/runs — listar execuções
    fastify.get('/runs', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const query = listRunsQuerySchema.safeParse(request.query)
            if (!query.success) throw new ValidationError('Parâmetros inválidos', query.error)
            const result = await checklistsRepository.listRuns(
                request.tenantId,
                Object.fromEntries(
                    Object.entries(query.data).filter(([, v]) => v !== undefined)
                ) as Parameters<typeof checklistsRepository.listRuns>[1]
            )
            return reply.send(result)
        },
    })

    // POST /v1/checklists/run — iniciar nova execução
    fastify.post('/run', { preHandler: [authMiddleware, tenantMiddleware], handler: handleCreateRun })
    // GET /v1/checklists/run/:id
    fastify.get('/run/:id', { preHandler: [authMiddleware, tenantMiddleware], handler: handleGetRun })
    // POST /v1/checklists/run/:id/complete
    fastify.post('/run/:id/complete', { preHandler: [authMiddleware, tenantMiddleware], handler: handleCompleteRun })
}
