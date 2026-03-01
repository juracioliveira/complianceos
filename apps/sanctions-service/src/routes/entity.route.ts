import { FastifyPluginAsync } from 'fastify';
import { db } from '../db/index.js';
import { sanctionsEntities } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';

export const entityRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/:id', { preHandler: requireAuth }, async (request, reply) => {
        const { id } = request.params as { id: string };

        try {
            const result = await db.select()
                .from(sanctionsEntities)
                .where(eq(sanctionsEntities.id, id))
                .limit(1);

            if (result.length === 0) {
                return reply.status(404).send({ error: 'Entity not found' });
            }

            return result[0];
        } catch (e) {
            request.log.error(e);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
};
