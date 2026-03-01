import type { FastifyPluginAsync } from 'fastify';
import { getCnpjData } from '../services/cnpj.service.js';
import { isValidCNPJ } from '../utils/cnpj.js';
import { requireApiKey } from '../middleware/auth.js';

export const cnpjRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.addHook('onRequest', requireApiKey);

    fastify.get<{ Params: { cnpj: string } }>('/:cnpj', async (request, reply) => {
        const rawCnpj = request.params.cnpj;
        const cleanCnpj = rawCnpj.replace(/[^\d]+/g, '');

        if (!isValidCNPJ(cleanCnpj)) {
            return reply.status(422).send({ error: 'Unprocessable Entity', message: 'CNPJ inválido' });
        }

        try {
            const data = await getCnpjData(cleanCnpj);

            if (!data) {
                return reply.status(404).send({ error: 'Not Found', message: 'CNPJ não encontrado' });
            }

            return reply.status(200).send(data);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
};
