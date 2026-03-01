import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { loginSchema, refreshSchema } from './auth.schema.js'
import { AuthService } from './auth.service.js'
import { ValidationError } from '@compliance-os/types'
import { authMiddleware } from '../../middlewares/auth.middleware.js'

export const authRoutes: FastifyPluginAsync = async (fastify) => {
    const authService = new AuthService(
        (payload) => fastify.jwt.sign(payload as object),
        (payload) => fastify.jwt.sign(payload, { expiresIn: '7d' }),
    )

    // POST /v1/auth/login
    fastify.post('/login', {
        config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const result = loginSchema.safeParse(request.body)
            if (!result.success) throw new ValidationError('Dados de login inválidos', result.error)

            const { email, password, mfaCode } = result.data
            const clientIp = request.ip

            const loginResult = await authService.login(email, password, mfaCode, clientIp)

            // Refresh token em cookie httpOnly
            reply.setCookie('refreshToken', loginResult.refreshToken, {
                httpOnly: true,
                secure: process.env['NODE_ENV'] === 'production',
                sameSite: 'strict',
                path: '/v1/auth/refresh',
                maxAge: 604_800, // 7 dias
            })

            return reply.status(200).send({ data: loginResult })
        },
    })

    // POST /v1/auth/refresh
    fastify.post('/refresh', {
        config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const cookieToken = (request.cookies as Record<string, string>)['refreshToken']
            const bodyToken = (request.body as { refreshToken?: string })?.refreshToken
            const refreshToken = cookieToken ?? bodyToken

            if (!refreshToken) {
                return reply.status(401).send({
                    type: 'https://complianceos.com.br/errors/UNAUTHORIZED',
                    title: 'Token de refresh ausente',
                    status: 401,
                    detail: 'Refresh token não encontrado',
                    instance: request.url,
                    requestId: request.id,
                    timestamp: new Date().toISOString(),
                })
            }

            try {
                const decoded = fastify.jwt.decode<{ sub: string }>(refreshToken)
                if (!decoded?.sub) throw new Error('Token inválido')

                // Gerar novo access token
                const newAccessToken = fastify.jwt.sign({ sub: decoded.sub })

                return reply.send({
                    data: {
                        accessToken: newAccessToken,
                        expiresIn: Number(process.env['JWT_ACCESS_TOKEN_EXPIRY'] ?? 900),
                    },
                })
            } catch {
                return reply.status(401).send({
                    type: 'https://complianceos.com.br/errors/UNAUTHORIZED',
                    title: 'Refresh token inválido',
                    status: 401,
                    detail: 'Refresh token expirado ou inválido. Faça login novamente.',
                    instance: request.url,
                    requestId: request.id,
                    timestamp: new Date().toISOString(),
                })
            }
        },
    })

    // POST /v1/auth/logout
    fastify.post(
        '/logout',
        { preHandler: [authMiddleware] },
        async (request: FastifyRequest, reply: FastifyReply) => {
            await authService.logout(request.user.sub)

            reply.clearCookie('refreshToken', { path: '/v1/auth/refresh' })
            return reply.status(204).send()
        },
    )

    // GET /v1/auth/me — dados do usuário atual
    fastify.get(
        '/me',
        { preHandler: [authMiddleware] },
        async (request: FastifyRequest, reply: FastifyReply) => {
            return reply.send({ data: request.user })
        },
    )
}
