import { FastifyRequest, FastifyReply } from 'fastify';
import dotenv from 'dotenv';
dotenv.config();

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
    const key = request.headers['x-api-key'];
    if (!key || key !== process.env.SANCTIONS_API_KEY) {
        return reply.status(401).send({ error: 'Unauthorized. Invalid x-api-key.' });
    }
}

export async function requireAdminAuth(request: FastifyRequest, reply: FastifyReply) {
    const adminKey = request.headers['x-admin-key'];
    if (!adminKey || adminKey !== process.env.SANCTIONS_ADMIN_KEY) {
        return reply.status(401).send({ error: 'Unauthorized. Invalid x-admin-key.' });
    }
}
