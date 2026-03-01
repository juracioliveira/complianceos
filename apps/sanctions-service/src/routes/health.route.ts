import { FastifyPluginAsync } from 'fastify';
import { db } from '../db/index.js';
import { checkRedisConnection } from '../cache/redis.js';
import { sanctionsEntities, sanctionsSyncLog } from '../db/schema.js';
import { sql } from 'drizzle-orm';

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

    fastify.get('/sources', async (request, reply) => {
        try {
            // Aggregate entity count by active sources
            const countRes = await db.execute(sql`
         SELECT source, count(*) as c 
         FROM sanctions_entities 
         WHERE is_active = true 
         GROUP BY source
      `);

            // Find the last successful sync per source
            const lastSyncRes = await db.execute(sql`
         SELECT source, MAX(concluido_em) as last_sync, etag
         FROM sanctions_sync_log
         WHERE status = 'success'
         GROUP BY source, etag
      `);

            const countsMap = new Map();
            countRes.rows.forEach(r => countsMap.set(r.source, Number(r.c)));

            const syncMaps = new Map();
            lastSyncRes.rows.forEach(r => syncMaps.set(r.source, { last_sync: r.last_sync, etag: r.etag }));

            const allSources = [
                'OFAC_SDN', 'OFAC_CONSOLIDATED', 'UN_SC', 'EU_FSF',
                'UK_OFSI', 'CGU_CEIS', 'CGU_CNEP', 'CGU_CEPIM', 'INTERPOL_RED'
            ];

            const sources = allSources.map(s => ({
                name: s,
                status: 'ok',
                last_sync: syncMaps.get(s)?.last_sync || null,
                entity_count: countsMap.get(s) || 0,
                etag: syncMaps.get(s)?.etag || null,
            }));

            const totalEntities = sources.reduce((sum, s) => sum + s.entity_count, 0);

            // Extract most recent global sync
            const maxSync = sources.reduce((max, s) => {
                if (!s.last_sync) return max;
                const d = new Date(s.last_sync);
                return d > max ? d : max;
            }, new Date(0));

            return {
                sources,
                total_entities: totalEntities,
                last_full_sync: maxSync.getTime() === 0 ? null : maxSync.toISOString(),
            };
        } catch (e) {
            request.log.error(e);
            return reply.status(500).send({ error: 'Failed fetching source stats' });
        }
    });
};
