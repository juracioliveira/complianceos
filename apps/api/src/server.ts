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

const isDev = process.env['NODE_ENV'] === 'development'
const PORT = Number(process.env['API_PORT'] ?? 4000)
const HOST = process.env['API_HOST'] ?? '0.0.0.0'

// Initialize BullMQ Workers
initWorkers()

export const app = Fastify({
    logger: {
        level: process.env['API_LOG_LEVEL'] ?? 'info',
        ...(isDev
            ? {
                transport: {
                    target: 'pino-pretty',
                    options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
                },
            }
            : {}),
        redact: ['req.headers.authorization', 'req.body.password', 'req.body.mfaCode', 'req.body.cpf'],
    },
    genReqId: () => crypto.randomUUID(),
})

// ─── Registrar plugins ───────────────────────────────────────────────────────
await app.register(fastifyHelmet, { contentSecurityPolicy: false })
await app.register(fastifyCookie, { secret: process.env['COOKIE_SECRET'] ?? 'dev_secret' })
await app.register(fastifyCors, {
    origin: (process.env['CORS_ALLOWED_ORIGINS'] ?? 'http://localhost:3000').split(','),
    credentials: true,
})
await app.register(fastifyRateLimit, { global: false, redis })

const cleanB64 = (val?: string) => val ? val.replace(/["'\s]/g, '') : ''

const privateKey = process.env['JWT_PRIVATE_KEY_BASE64']
    ? Buffer.from(cleanB64(process.env['JWT_PRIVATE_KEY_BASE64']), 'base64').toString('utf8')
    : 'dev_private_key'
const publicKey = process.env['JWT_PUBLIC_KEY_BASE64']
    ? Buffer.from(cleanB64(process.env['JWT_PUBLIC_KEY_BASE64']), 'base64').toString('utf8')
    : 'dev_public_key'

await app.register(fastifyJwt, {
    secret: { private: privateKey, public: publicKey },
    sign: { algorithm: 'RS256', expiresIn: 900 },
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

// Global Error Handler
app.setErrorHandler((error, request, reply) => {
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
    request.log.error(error)
    return reply.status(500).send({ status: 500, title: 'Internal Server Error' })
})

// ─── Registrar rotas ──────────────────────────────────────────────────────────
await app.register(authRoutes, { prefix: '/v1/auth' })
await app.register(entitiesRoutes, { prefix: '/v1/entities' })
await app.register(checklistsRoutes, { prefix: '/v1/checklists' })
await app.register(documentsRoutes, { prefix: '/v1/documents' })
await app.register(auditRoutes, { prefix: '/v1/audit' })
await app.register(dashboardRoutes, { prefix: '/v1/dashboard' })
await app.register(notificationsRoutes, { prefix: '/v1/notifications' })
await app.register(webhooksRoutes, { prefix: '/v1/webhooks' })
await app.register(usersRoutes, { prefix: '/v1/users' })
await app.register(intelligenceRoutes, { prefix: '/v1/intelligence' })
await app.register(billingRoutes, { prefix: '/v1/billing' })

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
