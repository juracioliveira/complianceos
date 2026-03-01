import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { tenantMiddleware } from '../../middlewares/tenant.middleware.js'
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

const checklistsRepository = new ChecklistsRepository()
const checklistsService = new ChecklistsService(checklistsRepository)

export const checklistsRoutes: FastifyPluginAsync = async (fastify) => {
    // Rotas de Template
    fastify.get('/', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const { status = 'ACTIVE' } = request.query as { status?: string }
            const result = await request.db.query(
                `SELECT c.id, c.module, c.regulation_code, c.title, c.description,
                c.version, c.status, c.periodicity_days, c.applies_to,
                jsonb_array_length(c.items) AS total_items
         FROM checklists c
         WHERE (c.tenant_id IS NULL OR c.tenant_id = $1) AND c.status = $2
         ORDER BY c.module, c.title`,
                [request.tenantId, status],
            )
            return reply.send({ data: result.rows })
        },
    })

    // Rotas de Execução (Runs)
    fastify.post('/run', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const body = createRunSchema.parse(request.body)
            const user = request.user as JwtPayload
            const { rows: [run] } = await request.db.query(
                `INSERT INTO checklist_runs (tenant_id, checklist_id, entity_id, executed_by, status, answers)
                 VALUES ($1, $2, $3, $4, 'IN_PROGRESS', $5)
                 RETURNING id`,
                [request.tenantId, body.checklistId, body.entityId, user.sub, JSON.stringify(body.answers)]
            )
            return reply.status(201).send({ data: run })
        }
    })

    fastify.get('/run/:id', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string }
            const run = await checklistsRepository.findRunById(id, request.tenantId)
            return reply.send({ data: run })
        },
    })

    fastify.post('/run/:id/complete', {
        preHandler: [authMiddleware, tenantMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as JwtPayload
            if (!['COMPLIANCE_OFFICER', 'ADMIN'].includes(user.role)) {
                throw new ForbiddenError('Apenas COMPLIANCE_OFFICER ou ADMIN podem completar checklists')
            }

            const { id } = request.params as { id: string }
            const result = await checklistsService.completeChecklist(id, request.tenantId)

            return reply.send(result)
        },
    })
}
