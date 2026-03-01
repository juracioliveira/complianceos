import type { FastifyRequest, FastifyReply } from 'fastify'
import { ForbiddenError, type JwtPayload } from '@compliance-os/types'

/**
 * Middleware para controle de acesso granular e Segregação de Funções (SoD).
 * Pode ser usado para verificar permissões específicas ou papéis (roles).
 */
export function authorize(requiredPermission?: string, requiredRole?: string | string[]) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.user as JwtPayload
        
        if (!user) {
            return reply.status(401).send({
                type: 'https://complianceos.com.br/errors/UNAUTHORIZED',
                title: 'Não autorizado',
                status: 401,
                detail: 'Usuário não autenticado no contexto de autorização',
                instance: request.url,
                requestId: request.id,
                timestamp: new Date().toISOString(),
            })
        }

        // 1. Verificar Role (Papel)
        if (requiredRole) {
            const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
            if (!roles.includes(user.role)) {
                return reply.status(403).send({
                    type: 'https://complianceos.com.br/errors/FORBIDDEN',
                    title: 'Acesso negado',
                    status: 403,
                    detail: `Esta ação requer um dos seguintes papéis: ${roles.join(', ')}`,
                    instance: request.url,
                    requestId: request.id,
                    timestamp: new Date().toISOString(),
                })
            }
        }

        // 2. Verificar Permissão Granular (Se disponível no token ou injetada)
        if (requiredPermission) {
            const permissions = (user as any).permissions || []
            if (!permissions.includes(requiredPermission) && user.role !== 'ADMIN') {
                return reply.status(403).send({
                    type: 'https://complianceos.com.br/errors/FORBIDDEN',
                    title: 'Acesso negado',
                    status: 403,
                    detail: `Você não tem a permissão necessária: ${requiredPermission}`,
                    instance: request.url,
                    requestId: request.id,
                    timestamp: new Date().toISOString(),
                })
            }
        }
    }
}
