import { Queue } from 'bullmq';
import { redis } from '../cache/redis.js';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';
dotenv.config();

const syncQueue = new Queue('sanctions-sync', { connection: redis as any });

const SYNC_SCHEDULES = {
    OFAC_SDN: '0 */6 * * *',   // a cada 6h
    UN_SC: '0 8 * * *',     // 1x/dia
    EU_FSF: '0 7 * * *',     // 1x/dia
    UK_OFSI: '0 7 * * *',
    CGU_CEIS: '0 4 * * 0',     // 1x/semana Sunday
    CGU_CNEP: '0 4 * * 0',
    CGU_CEPIM: '0 4 * * 0',
    INTERPOL_RED: '0 */12 * * *',  // 2x/dia
};

export async function setupSchedules() {
    logger.info('Setting up repeatable Sync schedules...');

    for (const [source, cron] of Object.entries(SYNC_SCHEDULES)) {
        if (process.env[`SOURCE_${source}`] === 'false') continue;

        logger.info(`Scheduling ${source} with cron ${cron}`);
        await syncQueue.add(
            `scheduled-sync-${source}`,
            { sources: [source] },
            {
                repeat: { pattern: cron },
                jobId: `repeatable-${source}`, // Prevent duplicates
            }
        );
    }
}

// Removido o bloco de execução standalone (if import.meta.url ...)
// porque quando o ts-node ou tsup faz o bundle para o server.js,
// ele engana a condição e faz o Fastify dar process.exit(0) logo ao iniciar.
