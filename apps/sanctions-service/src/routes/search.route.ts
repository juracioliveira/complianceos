import { FastifyPluginAsync } from 'fastify';
import { db } from '../db/index.js';
import { performScreening } from '../matcher/score.js';
import { requireAuth } from '../middleware/auth.js';

export const searchRoutes: FastifyPluginAsync = async (fastify) => {
    // /search?q=NOME&source=OFAC_SDN
    fastify.get('/', { preHandler: requireAuth }, async (request, reply) => {
        const query = request.query as any;
        const q = query.q || '';
        const source = query.source;

        if (!q) {
            return reply.status(400).send({ error: 'Missing parameter q' });
        }

        try {
            const matchOpts = {
                name: q,
                sources: source ? [source] : [
                    'OFAC_SDN', 'OFAC_CONSOLIDATED', 'UN_SC', 'EU_FSF',
                    'UK_OFSI', 'CGU_CEIS', 'CGU_CNEP', 'CGU_CEPIM', 'INTERPOL_RED'
                ],
                min_score: 60,
            };

            const results = await performScreening(matchOpts);
            return results;
        } catch (e) {
            request.log.error(e);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
};
