import Fastify from 'fastify';
import pino from 'pino';
import rateLimit from '@fastify/rate-limit';
import { healthRoutes } from './routes/health.route.js';
import { screeningRoutes } from './routes/screening.route.js';
import { entityRoutes } from './routes/entity.route.js';
import { searchRoutes } from './routes/search.route.js';
import { syncRoutes } from './routes/sync.route.js';
import { setupSchedules } from './jobs/scheduler.js';
import './jobs/sync.job.js'; // Inicializa o worker do BullMQ

import dotenv from 'dotenv';
dotenv.config();

export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    ...(process.env.NODE_ENV === 'development' ? {} : {})
});

const server = Fastify({
    logger: logger,
    disableRequestLogging: true,
});

server.addHook('onRequest', (request, reply, done) => {
    request.log.info({ req: request }, 'incoming request');
    done();
});

server.addHook('onResponse', (request, reply, done) => {
    request.log.info({ res: reply, time: reply.elapsedTime }, 'request completed');
    done();
});

server.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute'
});

server.register(healthRoutes, { prefix: '/health' });
server.get('/', async () => ({ status: 'ok', service: 'Sanctions Service', uptime: process.uptime() }));

server.register(screeningRoutes, { prefix: '/screen' });
server.register(entityRoutes, { prefix: '/entities' });
server.register(searchRoutes, { prefix: '/search' });
server.register(syncRoutes, { prefix: '/sync' });

const PORT = Number(process.env.PORT) || 4002;

const start = async () => {
    try {
        await server.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`Sanctions Service running on port ${PORT}`);

        // Configura os agendamentos e garante que o Worker inicie
        if (process.env.DISABLE_SYNC_WORKER !== 'true') {
            await setupSchedules();
            logger.info('Sanctions Sync schedules initialized and Worker is running');
        }
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
