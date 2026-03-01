import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/index.js';
import { rfbEmpresas, rfbEstabelecimentos } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { requireApiKey } from '../middleware/auth.js';

export const searchRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.addHook('onRequest', requireApiKey);

    fastify.get<{ Querystring: { q: string, uf?: string, limite?: string } }>('/', async (request, reply) => {
        const { q, uf, limite } = request.query;

        if (!q || q.length < 3) {
            return reply.status(400).send({ error: 'Bad Request', message: 'A busca precisa ter no mínimo 3 caracteres (q)' });
        }

        const limitNum = limite ? Math.min(Number(limite), 100) : 20;

        try {
            // Full-text search ignoring accents using vector
            const searchVector = sql`to_tsquery('portuguese', func_remove_accents(${q.replace(/\s+/g, ' & ')}))`;

            const results = await db.select({
                cnpjBasico: rfbEmpresas.cnpjBasico,
                razaoSocial: rfbEmpresas.razaoSocial,
                cnpjOrdem: rfbEstabelecimentos.cnpjOrdem,
                cnpjDv: rfbEstabelecimentos.cnpjDv,
                uf: rfbEstabelecimentos.uf,
            })
                .from(rfbEmpresas)
                .innerJoin(rfbEstabelecimentos, eq(rfbEmpresas.cnpjBasico, rfbEstabelecimentos.cnpjBasico))
                .where(sql`to_tsvector('portuguese', func_remove_accents(${rfbEmpresas.razaoSocial})) @@ ${searchVector}`)
                .limit(limitNum);

            return reply.status(200).send({ results });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
};
