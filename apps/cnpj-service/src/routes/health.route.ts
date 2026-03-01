import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/index.js';
import { checkRedisConnection } from '../cache/redis.js';
import { rfbSyncLog } from '../db/schema.js';
import { desc, sql } from 'drizzle-orm';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/', async (request, reply) => {
        let dbStatus = 'ok';
        try {
            await db.execute(sql`SELECT 1`);
        } catch (e) {
            dbStatus = 'error';
        }

        const redisStatus = await checkRedisConnection() ? 'ok' : 'error';

        return {
            status: 'ok',
            db: dbStatus,
            redis: redisStatus,
            uptime: process.uptime(),
        };
    });

    fastify.get('/sync', async (request, reply) => {
        try {
            const result = await db.select()
                .from(rfbSyncLog)
                .orderBy(desc(rfbSyncLog.id))
                .limit(1);

            const latestSync = result[0];
            if (!latestSync) {
                return reply.status(404).send({ error: 'Nenhuma sincronização encontrada' });
            }

            // We should ideally return row counts, but querying count from a 51M row table might be slow.
            // So returning dummy data here or skipping the row count if not tracked in the db precisely.
            return {
                ultima_competencia: latestSync.competencia,
                status: latestSync.status,
                concluido_em: latestSync.concluidoEm,
                total_arquivos_sucesso: latestSync.arquivosOk,
            };
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Erro ao buscar sync status' });
        }
    });

};
