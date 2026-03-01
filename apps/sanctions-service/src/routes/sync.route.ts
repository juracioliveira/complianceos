import { FastifyPluginAsync } from 'fastify';
import { Queue } from 'bullmq';
import { requireAdminAuth } from '../middleware/auth.js';
import { checkRedisConnection } from '../cache/redis.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
export const syncQueue = new Queue('sanctions-sync', { connection: { url: REDIS_URL } });

export const syncRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post('/trigger', { preHandler: requireAdminAuth }, async (request, reply) => {
        const isRedisOk = await checkRedisConnection();
        if (!isRedisOk) {
            return reply.status(503).send({ error: 'Redis unvailable. Cannot trigger sync jobs.' });
        }

        const body = request.body as any;
        const sources = body?.sources || [];
        // empty means all

        const job = await syncQueue.add('syncSources', { sources });

        return reply.status(202).send({
            job_id: job.id,
            sources: sources.length === 0 ? 'ALL' : sources,
        });
    });
};
