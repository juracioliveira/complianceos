import type { FastifyRequest, FastifyReply } from 'fastify'
import { UnauthorizedError } from '@compliance-os/types'
import type { JwtPayload } from '@compliance-os/types'

// Estender o tipo FastifyRequest para incluir o tenantId
declare module 'fastify' {
    interface FastifyRequest {
        tenantId: string
    }
}
// O campo 'user' é injetado pelo @fastify/jwt e deve ser castado nos controllers para JwtPayload

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
        // Verificar e decodificar o JWT (fastify-jwt injeta o método)
        await request.jwtVerify()
        const payload = request.user as JwtPayload

        if (!payload.sub || !payload.tenantId || !payload.role) {
            throw new UnauthorizedError('Token JWT inválido ou payload incompleto')
        }

        // Injetar tenantId no request para uso nos handlers
        request.tenantId = payload.tenantId
    } catch (err) {
        if (err instanceof UnauthorizedError) {
            return reply.status(401).send({
                type: 'https://complianceos.com.br/errors/UNAUTHORIZED',
                title: 'Não autorizado',
                status: 401,
                detail: err.message,
                instance: request.url,
                requestId: request.id,
                timestamp: new Date().toISOString(),
            })
        }
        return reply.status(401).send({
            type: 'https://complianceos.com.br/errors/UNAUTHORIZED',
            title: 'Não autorizado',
            status: 401,
            detail: 'Token ausente, expirado ou inválido',
            instance: request.url,
            requestId: request.id,
            timestamp: new Date().toISOString(),
        })
    }
}
