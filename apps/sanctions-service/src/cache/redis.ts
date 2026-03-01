import { Redis } from 'ioredis';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';
dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
});

redis.on('error', (err) => {
    logger.error(err, 'Redis connection error');
});

export async function checkRedisConnection(): Promise<boolean> {
    try {
        const res = await redis.ping();
        return res === 'PONG';
    } catch (e) {
        return false;
    }
}
