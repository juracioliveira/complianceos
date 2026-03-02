import Fastify from 'fastify';
import fastifyRateLimit from '@fastify/rate-limit';
import { logger } from './utils/logger.js';
import { redis } from './cache/redis.js';
import { healthRoutes } from './routes/health.route.js';
import { cnpjRoutes } from './routes/cnpj.route.js';
import { searchRoutes } from './routes/search.route.js';
import dotenv from 'dotenv';

dotenv.config();

const port = Number(process.env.PORT || 4001);
const host = process.env.HOST || '0.0.0.0';

export const app = Fastify({
    logger,
    trustProxy: true,
});

async function start() {
    await app.register(fastifyRateLimit, {
        max: 100,
        timeWindow: '1 minute',
        redis,
    });

    // Rotas
    await app.register(healthRoutes, { prefix: '/health' });
    app.get('/health', async (request, reply) => {
        return reply.redirect('/health/');
    });
    app.get('/', async () => ({ status: 'ok', service: 'CNPJ Service', uptime: process.uptime() }));

    await app.register(cnpjRoutes, { prefix: '/cnpj' });
    await app.register(searchRoutes, { prefix: '/search' });

    // Job trigger protegido
    // await app.register(syncTriggerRoutes, { prefix: '/sync' });

    app.setErrorHandler((error, request, reply) => {
        if (error.statusCode === 429) {
            reply.status(429).send({ error: 'Too Many Requests', message: 'Rate limit exceeded' });
            return;
        }
        request.log.error(error);
        reply.status(500).send({ error: 'Internal Server Error' });
    });

    try {
        await app.listen({ port, host });
        app.log.info(`🚀 CNPJ Service rodando em http://${host}:${port}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}

// Graceful shutdown
const listeners = ['SIGINT', 'SIGTERM'];
listeners.forEach((signal) => {
    process.on(signal, async () => {
        app.log.info(`Received ${signal}. Shutting down gracefully...`);
        await app.close();
        await redis.quit();
        process.exit(0);
    });
});

start();
