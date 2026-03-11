import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { loginSchema, refreshSchema } from './auth.schema.js'
import { AuthService } from './auth.service.js'
import { ValidationError } from '@compliance-os/types'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { AuthRepository } from './auth.repository.js'

const mfaConfirmSchema = z.object({ code: z.string().length(6) })
const mfaDisableSchema = z.object({ password: z.string().min(8) })
const forgotPasswordSchema = z.object({ email: z.string().email() })
const resetPasswordSchema = z.object({
    token: z.string().min(1),
    newPassword: z.string().min(8),
})
const acceptInviteSchema = z.object({
    token: z.string().min(1),
    name: z.string().min(2).max(200),
    password: z.string().min(8),
})

export const authRoutes: FastifyPluginAsync = async (fastify) => {
    const authRepo = new AuthRepository()
    const authService = new AuthService(
        authRepo,
        (payload) => fastify.jwt.sign(payload as object),
        (payload) => fastify.jwt.sign(payload, { expiresIn: '7d' }),
    )

    // ─── Login ────────────────────────────────────────────────────────────────
    fastify.post('/login', {
        config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const result = loginSchema.safeParse(request.body)
            if (!result.success) throw new ValidationError('Dados de login inválidos', result.error)

            const { email, password, mfaCode } = result.data
            const loginResult = await authService.login(email, password, mfaCode, request.ip)

            reply.setCookie('refreshToken', loginResult.refreshToken, {
                httpOnly: true,
                secure: process.env['NODE_ENV'] === 'production',
                sameSite: 'strict',
                path: '/v1/auth/refresh',
                maxAge: 604_800,
            })

            return reply.status(200).send({ data: loginResult })
        },
    })

    // ─── Refresh ──────────────────────────────────────────────────────────────
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
                })
            }

            try {
                const decoded = fastify.jwt.decode<{ sub: string }>(refreshToken)
                if (!decoded?.sub) throw new Error('Token inválido')

                const refreshResult = await authService.refresh(refreshToken, decoded.sub)

                reply.setCookie('refreshToken', refreshResult.refreshToken, {
                    httpOnly: true,
                    secure: process.env['NODE_ENV'] === 'production',
                    sameSite: 'strict',
                    path: '/v1/auth/refresh',
                    maxAge: 604_800,
                })

                return reply.send({ data: { accessToken: refreshResult.accessToken, expiresIn: refreshResult.expiresIn } })
            } catch (err: any) {
                return reply.status(401).send({
                    type: 'https://complianceos.com.br/errors/UNAUTHORIZED',
                    title: 'Refresh token inválido',
                    status: 401,
                    detail: err.message || 'Refresh token expirado ou inválido. Faça login novamente.',
                })
            }
        },
    })

    // ─── Logout ───────────────────────────────────────────────────────────────
    fastify.post('/logout', { preHandler: [authMiddleware] }, async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.user as import('@compliance-os/types').JwtPayload
        await authService.logout(user.sub)
        reply.clearCookie('refreshToken', { path: '/v1/auth/refresh' })
        return reply.status(204).send()
    })

    // ─── Me ───────────────────────────────────────────────────────────────────
    fastify.get('/me', { preHandler: [authMiddleware] }, async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.user as import('@compliance-os/types').JwtPayload
        const userProfile = await authService.getMe(user.sub)
        if (!userProfile) return reply.status(404).send({ detail: 'Usuário não encontrado' })
        return reply.send({ data: userProfile })
    })

    // ─── MFA Setup ────────────────────────────────────────────────────────────
    fastify.post('/mfa/setup', { preHandler: [authMiddleware] }, async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.user as import('@compliance-os/types').JwtPayload
        const result = await authService.setupMfa(user.sub)
        return reply.send({ data: result })
    })

    // POST /v1/auth/mfa/confirm — confirmar código TOTP para ativar MFA
    fastify.post('/mfa/confirm', { preHandler: [authMiddleware] }, async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.user as import('@compliance-os/types').JwtPayload
        const body = mfaConfirmSchema.safeParse(request.body)
        if (!body.success) throw new ValidationError('Código inválido', body.error)
        const result = await authService.confirmMfa(user.sub, body.data.code)
        return reply.send({ data: result })
    })

    // DELETE /v1/auth/mfa — desativar MFA (requer senha)
    fastify.delete('/mfa', { preHandler: [authMiddleware] }, async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.user as import('@compliance-os/types').JwtPayload
        const body = mfaDisableSchema.safeParse(request.body)
        if (!body.success) throw new ValidationError('Dados inválidos', body.error)
        await authService.disableMfa(user.sub, body.data.password)
        return reply.status(204).send()
    })

    // ─── Password Reset ───────────────────────────────────────────────────────
    fastify.post('/forgot-password', {
        config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const body = forgotPasswordSchema.safeParse(request.body)
            if (!body.success) throw new ValidationError('Email inválido', body.error)
            await authService.forgotPassword(body.data.email)
            return reply.send({ data: { message: 'Se o e-mail existir, você receberá as instruções de recuperação.' } })
        },
    })

    fastify.post('/reset-password', async (request: FastifyRequest, reply: FastifyReply) => {
        const body = resetPasswordSchema.safeParse(request.body)
        if (!body.success) throw new ValidationError('Dados inválidos', body.error)
        await authService.resetPassword(body.data.token, body.data.newPassword)
        return reply.send({ data: { message: 'Senha alterada com sucesso.' } })
    })

    // ─── Accept Invite ────────────────────────────────────────────────────────
    fastify.post('/accept-invite', async (request: FastifyRequest, reply: FastifyReply) => {
        const body = acceptInviteSchema.safeParse(request.body)
        if (!body.success) throw new ValidationError('Dados inválidos', body.error)

        const result = await authService.acceptInvite(body.data.token, body.data.name, body.data.password)

        reply.setCookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env['NODE_ENV'] === 'production',
            sameSite: 'strict',
            path: '/v1/auth/refresh',
            maxAge: 604_800,
        })

        return reply.status(201).send({ data: result })
    })
}
