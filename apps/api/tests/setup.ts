import { vi } from 'vitest'

// Mock environment variables
process.env['JWT_SECRET'] = 'test-jwt-secret'
process.env['COOKIE_SECRET'] = 'test-cookie-secret'
process.env['INTERNAL_API_KEY'] = 'test-internal-api-key'
process.env['DATABASE_URL'] = 'postgres://postgres:postgres@localhost:5432/test'
process.env['REDIS_URL'] = 'redis://localhost:6379'

// Mock the external cache module globally
// apps/api/tests/setup.ts -> ../src/infra/redis
vi.mock('../src/infra/redis', () => ({
    cache: {
        get: vi.fn(),
        set: vi.fn(),
        del: vi.fn(),
        delPattern: vi.fn(),
        keys: {
            refreshToken: (th: string) => `refresh_token:${th}`
        }
    },
    redis: {
        ping: vi.fn(),
        on: vi.fn()
    },
    checkRedisConnection: vi.fn()
}))

// Mock Drizzle DB and pool
vi.mock('../src/infra/db/db', () => ({
    db: {
        execute: vi.fn()
    },
    pool: {
        connect: vi.fn()
    },
    checkDatabaseConnection: vi.fn()
}))

// Mock Queue globally
vi.mock('../src/infra/queue', () => ({
    sanctionsScreeningQueue: {
        add: vi.fn().mockResolvedValue({ id: 'job-id' })
    },
    queue: {
        add: vi.fn().mockResolvedValue({ id: 'job-id' })
    }
}))

// Global fetch mock
global.fetch = vi.fn() as any
