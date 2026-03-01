import pg from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema'
import { AsyncLocalStorage } from 'node:async_hooks'

const { Pool } = pg

// Contexto para Multi-tenancy (RLS + Isolamento)
export const dbContext = new AsyncLocalStorage<{ tenantId: string }>()

const connectionString =
    process.env['DATABASE_URL'] ??
    'postgresql://compliance_app:app_password_dev@localhost:5432/compliance'

export const pool = new Pool({
    connectionString,
    min: Number(process.env['DATABASE_POOL_MIN'] ?? 2),
    max: Number(process.env['DATABASE_POOL_MAX'] ?? 10),
    idleTimeoutMillis: Number(process.env['DATABASE_POOL_IDLE_TIMEOUT'] ?? 30_000),
    connectionTimeoutMillis: 5_000,
})

// Drizzle instance export
export const db = drizzle(pool, { schema })

/**
 * Retorna uma instância do Drizzle configurada para o tenant atual.
 * Se houver um tenantId no contexto, executa SET LOCAL para RLS.
 */
export async function getTenantDb(tenantId?: string) {
    const id = tenantId || dbContext.getStore()?.tenantId
    
    if (!id) {
        return db // Fallback para query global (uso administrativo restrito)
    }

    const client = await pool.connect()
    await client.query(pg.format('SET LOCAL app.tenant_id = %L', id))
    
    // Retornamos um proxy ou wrapper que libera o client após o uso?
    // Para simplificar no Drizzle, podemos usar o client diretamente.
    return drizzle(client, { schema })
}

export async function checkDatabaseConnection(): Promise<boolean> {
    const client = await pool.connect()
    try {
        await client.query('SELECT 1')
        return true
    } catch {
        return false
    } finally {
        client.release()
    }
}

export type DbClient = pg.PoolClient
export type DbPool = pg.Pool
