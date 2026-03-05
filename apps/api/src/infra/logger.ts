import pino from 'pino'

const isDev = process.env['NODE_ENV'] === 'development'

export const logger = pino({
    level: process.env['API_LOG_LEVEL'] ?? 'info',
    redact: {
        paths: [
            'req.headers.authorization',
            'body.password',
            'body.mfaCode',
            'body.cpf',
            'body.cnpj',
            'password',
            'mfaSecret',
            'refreshToken',
            'accessToken',
            'secret'
        ],
        remove: true
    },
    serializers: {
        req(request) {
            return {
                method: request.method,
                url: request.url,
                hostname: request.hostname,
                remoteAddress: request.ip,
                requestId: request.id,
                tenantId: request.tenantId
            }
        },
        err: pino.stdSerializers.err,
    },
    transport: isDev ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
        }
    } as any : undefined
})

/**
 * Cria um logger filho para workers do BullMQ com contexto de Job.
 */
export function createWorkerLogger(workerName: string, jobContext: Record<string, any>) {
    return logger.child({
        service: 'worker',
        worker: workerName,
        ...jobContext
    })
}
