import { Queue } from 'bullmq';
import { redis } from '../cache/redis.js';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';
dotenv.config();

const syncQueue = new Queue('rfb-sync', { connection: redis as any });

export async function setupScheduler() {
    const cronExpr = process.env.SYNC_CRON || '0 3 5 * *';

    await syncQueue.add('rfb-sync-job', {}, {
        repeat: {
            pattern: cronExpr,
        }
    });

    logger.info(`Scheduler configured for RFB Sync with cron: ${cronExpr}`);
}
