import { Worker, Job } from 'bullmq';
import { redis } from '../cache/redis.js';
import { runSyncJob } from '../services/sync.service.js';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';
dotenv.config();

export const syncWorker = new Worker(
    'rfb-sync',
    async (job: Job) => {
        logger.info(`Starting bullmq sync job ${job.id}`);
        await runSyncJob();
    },
    { connection: redis as any }
);

syncWorker.on('completed', (job: Job) => {
    logger.info(`Sync job ${job.id} has completed successfully!`);
});

syncWorker.on('failed', (job: Job | undefined, err: Error) => {
    if (job) {
        logger.error({ err }, `Sync job ${job.id} has failed`);
    } else {
        logger.error({ err }, `Sync job failed and no job details were found`);
    }
});

// To be run directly if called through "npm run sync:run"
if (import.meta.url === `file://${process.argv[1]}`) {
    runSyncJob().then(() => {
        logger.info('Manual script run finished');
        process.exit(0);
    }).catch((err) => {
        logger.error('Manual script run failed', err);
        process.exit(1);
    });
}
