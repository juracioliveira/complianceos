import type { FastifyRequest, FastifyReply } from 'fastify'
import { pool, dbContext } from '../infra/db/db.js'
import type { DbClient } from '../infra/db/db.js'

export async function tenantMiddleware(
    request: FastifyRequest,
    reply: FastifyReply,
): Promise<void> {
    const tenantId = request.tenantId

    if (!tenantId) {
        return reply.status(401).send({
            type: 'https://complianceos.com.br/errors/UNAUTHORIZED',
            title: 'Não autorizado',
            status: 401,
            detail: 'tenantId não encontrado no token',
            instance: request.url,
            requestId: request.id,
            timestamp: new Date().toISOString(),
        })
    }

    // 1. Injetar o tenantId no AsyncLocalStorage para propagação global de contexto
    // Isso garante que QUALQUER código chamado nesta request tenha acesso ao tenant_id
    // sem precisar passá-lo manualmente por todos os métodos.
    return new Promise((resolve, reject) => {
        dbContext.run({ tenantId }, async () => {
            try {
                // 2. Adquirir conexão do pool para configurar o RLS no PostgreSQL
                const client = await pool.connect()

                try {
                    // CRÍTICO: esta linha ativa o Row Level Security no nível da conexão
                    await client.query(`SET LOCAL app.tenant_id = '${tenantId}'`)

                        // Injetar o client no request para handlers que ainda usam db injetado
                        ; (request as any).db = client

                    // Continuar o processamento da request dentro do contexto
                    resolve(undefined)
                } catch (err) {
                    client.release()
                    reject(err)
                }
            } catch (err) {
                reject(err)
            }
        })
    }).then(() => {
        // Garantir que a conexão seja liberada após o envio da resposta
        reply.raw.on('finish', () => {
            if ((request as any).db) {
                (request as any).db.release()
            }
        })
    }).catch(err => {
        return reply.status(500).send({
            type: 'https://complianceos.com.br/errors/INTERNAL_ERROR',
            title: 'Erro interno',
            status: 500,
            detail: 'Erro ao inicializar contexto de tenant (RLS)',
            instance: request.url,
            requestId: request.id,
            timestamp: new Date().toISOString(),
        })
    })
}

// Extender o tipo FastifyRequest para incluir db
declare module 'fastify' {
    interface FastifyRequest {
        db: DbClient
    }
}
