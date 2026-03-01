import type { FastifyRequest, FastifyReply } from 'fastify';

export async function requireApiKey(request: FastifyRequest, reply: FastifyReply) {
    const apiKey = request.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.CNPJ_API_KEY) {
        reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or missing x-api-key' });
        return;
    }
}

export async function requireAdminKey(request: FastifyRequest, reply: FastifyReply) {
    const apiKey = request.headers['x-admin-key'];
    if (!apiKey || apiKey !== process.env.CNPJ_ADMIN_KEY) {
        reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or missing x-admin-key' });
        return;
    }
}
