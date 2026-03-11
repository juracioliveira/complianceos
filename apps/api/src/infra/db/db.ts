import pg from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema'
import { AsyncLocalStorage } from 'node:async_hooks'
import { logger } from '../logger.js'

const { Pool } = pg

// Contexto para Multi-tenancy (RLS + Isolamento)
export const dbContext = new AsyncLocalStorage<{ tenantId: string; db?: pg.PoolClient }>()

const connectionString = process.env['DATABASE_URL']
if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required')
}

export const pool = new Pool({
    connectionString,
    min: Number(process.env['DATABASE_POOL_MIN'] ?? 2),
    max: Number(process.env['DATABASE_POOL_MAX'] ?? 10),
    idleTimeoutMillis: Number(process.env['DATABASE_POOL_IDLE_TIMEOUT'] ?? 30_000),
    connectionTimeoutMillis: 5_000,
})

// Drizzle instance export
class MyLogger {
    logQuery(query: string, params: unknown[]): void {
        if (process.env['NODE_ENV'] === 'development') {
            logger.debug({ query, params }, 'Executando Query SQL')
        }
    }
}

export const db = drizzle(pool, {
    schema,
    logger: new MyLogger()
})

/**
 * Retorna a instância do Drizzle (global ou limitada ao tenant no AsyncLocalStorage).
 * Se houver um cliente no contexto, usa-o.
 */
export function getDb() {
    const store = dbContext.getStore()
    if (store?.db) {
        return drizzle(store.db, { schema })
    }
    return db
}



export async function checkDatabaseConnection(): Promise<boolean> {
    try {
        const client = await pool.connect()
        try {
            await client.query('SELECT 1')
            return true
        } finally {
            client.release()
        }
    } catch (err) {
        logger.error({ err }, 'Erro na conexão com o Banco de Dados')
        return false
    }
}

export type DbClient = pg.PoolClient
export type DbPool = pg.Pool
