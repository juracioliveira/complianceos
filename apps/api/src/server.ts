import Fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import fastifyRateLimit from '@fastify/rate-limit'
import fastifyCookie from '@fastify/cookie'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { checkDatabaseConnection, pool } from './infra/db/db.js'
import { redis, checkRedisConnection } from './infra/redis.js'
import { logger } from './infra/logger.js'
import { initWorkers } from './infra/queue/workers/index.js'
import type { ProblemDetails, JwtPayload } from '@compliance-os/types'
import { ComplianceOSError } from '@compliance-os/types'

// ─── Importar rotas dos módulos ──────────────────────────────────────────────
import { authRoutes } from './modules/auth/auth.controller.js'
import { entitiesRoutes } from './modules/entities/entities.controller.js'
import { checklistsRoutes } from './modules/checklists/checklists.controller.js'
import { documentsRoutes } from './modules/documents/documents.controller.js'
import { auditRoutes } from './modules/audit/audit.controller.js'
import { dashboardRoutes } from './modules/dashboard/dashboard.controller.js'
import { notificationsRoutes } from './modules/notifications/notifications.controller.js'
import { webhooksRoutes } from './modules/notifications/webhooks.controller.js'
import { usersRoutes } from './modules/users/users.controller.js'
import { intelligenceRoutes } from './modules/intelligence/intelligence.controller.js'
import { billingRoutes } from './modules/billing/billing.controller.js'
import { alertCasesRoutes } from './modules/alert-cases/alert-cases.controller.js'

const isDev = process.env['NODE_ENV'] === 'development'
const PORT = Number(process.env['API_PORT'] ?? 4000)
const HOST = process.env['API_HOST'] ?? '0.0.0.0'

// Initialize BullMQ Workers
initWorkers()

export const app = Fastify({
    logger,
    genReqId: () => crypto.randomUUID(),
})

// ─── Registrar plugins ───────────────────────────────────────────────────────
await app.register(fastifyHelmet, { contentSecurityPolicy: false })
const cookieSecret = process.env['COOKIE_SECRET'] || 'default-compliance-os-cookie-secret-for-dev-only'
await app.register(fastifyCookie, { secret: cookieSecret })
await app.register(fastifyCors, {
    origin: (origin, cb) => {
        const allowed = (process.env['CORS_ALLOWED_ORIGINS'] ?? 'http://localhost:3000,http://localhost:4000').split(',')
        if (!origin || allowed.includes(origin) || origin.endsWith('.easypanel.host') || origin.includes('complianceos.com.br')) {
            cb(null, true)
            return
        }
        cb(new Error('Not allowed by CORS'), false)
    },
    credentials: true,
})
await app.register(fastifyRateLimit, {
    global: true,
    max: 1000,
    timeWindow: '1 minute',
    redis,
    keyGenerator: (request) => {
        const authHeader = request.headers.authorization
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7)
            try {
                // Instância de JWT de fastify usada optimisticamente
                const decoded = app.jwt.decode<{ tenantId?: string }>(token)
                if (decoded && decoded.tenantId) {
                    return `rate-limit:tenant:${decoded.tenantId}`
                }
            } catch {
                // Fallback para IP em caso malformado
            }
        }
        return `rate-limit:ip:${request.ip}`
    }
})

const secretKey = process.env['JWT_SECRET']
    || process.env['JWT_PRIVATE_KEY_BASE64']
    || 'default-compliance-os-jwt-secret-for-dev-only-do-not-use-in-prod'

await app.register(fastifyJwt, {
    secret: secretKey,
    sign: { algorithm: 'HS256', expiresIn: 900 },
})

if (isDev) {
    await app.register(fastifySwagger, {
        openapi: {
            info: { title: 'ComplianceOS API', version: '1.0.0' },
            servers: [{ url: 'http://localhost:4000' }],
        }
    })
    await app.register(fastifySwaggerUi, { routePrefix: '/docs' })
}

// Injetar contexto de logs (tenantId) após validação de rotas autenticadas
app.addHook('preHandler', async (request) => {
    if (request.tenantId) {
        request.log = request.log.child({ tenantId: request.tenantId })
    }
})

// Global Error Handler
app.setErrorHandler((error, request, reply) => {
    const statusCode = error instanceof ComplianceOSError ? error.statusCode : (error.statusCode || 500)

    // Log estruturado do erro
    request.log.error({
        err: error,
        requestId: request.id,
        tenantId: request.tenantId,
        url: request.url,
        method: request.method
    }, error.message)

    if (error instanceof ComplianceOSError) {
        return reply.status(error.statusCode).send({
            type: `https://complianceos.com.br/errors/${error.code}`,
            title: error.message,
            status: error.statusCode,
            detail: error.message,
            instance: request.url,
            requestId: request.id,
            timestamp: new Date().toISOString(),
        })
    }

    return reply.status(statusCode).send({
        status: statusCode,
        title: statusCode === 500 ? 'Internal Server Error' : error.message,
        requestId: request.id
    })
})

// ─── Registrar rotas ──────────────────────────────────────────────────────────
await app.register(authRoutes, { prefix: '/v1/auth' })
await app.register(entitiesRoutes, { prefix: '/v1/entities' })
await app.register(checklistsRoutes, { prefix: '/v1/checklists' })
await app.register(checklistsRoutes, { prefix: '/v1/checklist-runs' })
await app.register(documentsRoutes, { prefix: '/v1/documents' })
await app.register(auditRoutes, { prefix: '/v1/audit' })
await app.register(dashboardRoutes, { prefix: '/v1/dashboard' })
await app.register(notificationsRoutes, { prefix: '/v1/notifications' })
await app.register(webhooksRoutes, { prefix: '/v1/webhooks' })
await app.register(usersRoutes, { prefix: '/v1/users' })
await app.register(intelligenceRoutes, { prefix: '/v1/intelligence' })
await app.register(billingRoutes, { prefix: '/v1/billing' })
await app.register(alertCasesRoutes, { prefix: '/v1/alert-cases' })

// ─── Health Checks ───────────────────────────────────────────────────────────
app.get('/', async () => ({ status: 'ok', service: 'ComplianceOS API', timestamp: new Date().toISOString() }))
app.get('/health', async (request, reply) => {
    const dbOk = await checkDatabaseConnection()
    const redisOk = await checkRedisConnection()

    const status = dbOk && redisOk ? 200 : 503
    return reply.status(status).send({
        status: dbOk && redisOk ? 'ok' : 'degraded',
        database: dbOk ? 'ok' : 'error',
        redis: redisOk ? 'ok' : 'error',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    })
})

async function start(): Promise<void> {
    try {
        await app.listen({ port: PORT, host: HOST })
        app.log.info(`🚀 ComplianceOS API rodando em http://${HOST}:${PORT}`)
    } catch (err) {
        app.log.error(err)
        process.exit(1)
    }
}

start()
