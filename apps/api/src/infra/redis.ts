import Redis from 'ioredis'

const redisUrl = process.env['REDIS_URL'] ?? 'redis://localhost:6379'

export const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
        return Math.min(times * 200, 3000)
    },
    lazyConnect: true,
})

redis.on('error', (err) => {
    // Log sem dados sensíveis — apenas o código de erro
    if ((err as NodeJS.ErrnoException).code !== 'ECONNREFUSED') {
        console.error('Redis: erro de conexão', { code: (err as NodeJS.ErrnoException).code })
    }
})

export async function checkRedisConnection(): Promise<boolean> {
    try {
        await redis.ping()
        return true
    } catch {
        return false
    }
}

// Helpers de cache com TTL
export const cache = {
    async get<T>(key: string): Promise<T | null> {
        const value = await redis.get(key)
        if (!value) return null
        try {
            return JSON.parse(value) as T
        } catch {
            return null
        }
    },

    async set<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
        await redis.setex(key, ttlSeconds, JSON.stringify(value))
    },

    async del(key: string): Promise<void> {
        await redis.del(key)
    },

    async delPattern(pattern: string): Promise<void> {
        const keys = await redis.keys(pattern)
        if (keys.length > 0) {
            await redis.del(...keys)
        }
    },

    // Chaves padronizadas por tenant
    keys: {
        tenantDashboard: (tenantId: string) => `tenant:${tenantId}:dashboard:summary`,
        userSession: (userId: string) => `session:user:${userId}`,
        refreshToken: (tokenHash: string) => `refresh_token:${tokenHash}`,
        mfaAttempts: (userId: string) => `mfa:attempts:${userId}`,
        checklistRun: (runId: string) => `checklist_run:${runId}`,
    },
}
