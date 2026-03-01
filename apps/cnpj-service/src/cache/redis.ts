import { Redis } from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: null,
});

export async function checkRedisConnection(): Promise<boolean> {
    try {
        await redis.ping();
        return true;
    } catch {
        return false;
    }
}

export const cache = {
    async get<T>(key: string): Promise<T | null> {
        const value = await redis.get(key);
        if (!value) return null;
        try {
            return JSON.parse(value) as T;
        } catch {
            return null;
        }
    },

    async set<T>(key: string, value: T, ttlSeconds = 3600): Promise<void> {
        if (ttlSeconds > 0) {
            await redis.setex(key, ttlSeconds, JSON.stringify(value));
        } else {
            await redis.set(key, JSON.stringify(value));
        }
    },

    async del(key: string): Promise<void> {
        await redis.del(key);
    }
};
