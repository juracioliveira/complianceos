import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer } from '@testcontainers/redis';

// Simplified integration test placeholder focusing on containers
describe('Integration - CNPJ Routes', () => {
    let pgContainer: any;
    let redisContainer: any;

    beforeAll(async () => {
        // Start containers
        pgContainer = await new PostgreSqlContainer().start();
        redisContainer = await new RedisContainer().start();

        process.env.DATABASE_URL = pgContainer.getConnectionUri();
        process.env.REDIS_URL = redisContainer.getConnectionUrl();
        process.env.CNPJ_API_KEY = 'test-key';
    }, 60000);

    afterAll(async () => {
        await pgContainer.stop();
        await redisContainer.stop();
    });

    it('Should start dependencies', () => {
        expect(process.env.DATABASE_URL).toBeDefined();
        expect(process.env.REDIS_URL).toBeDefined();
    });
});
