
import pg from 'pg'
const { Pool } = pg
import { dbContext, getDb } from './src/infra/db/db.js'
import { logger } from './src/infra/logger.js'
import { sql } from 'drizzle-orm'

async function verify() {
    console.log('--- Verifying RLS Fix with dbContext ---')

    // Simulate tenant context
    const testTenantId = '00000000-0000-0000-0000-000000000001' // Use a valid UUID from your DB if possible

    // We need a real PoolClient for the context
    const pool = new Pool({ connectionString: process.env['DATABASE_URL'] })
    const client = await pool.connect()

    try {
        await dbContext.run({ tenantId: testTenantId, db: client }, async () => {
            console.log('Running within tenant context:', testTenantId)

            // 1. Manually set the tenant ID on the connection (Simulating what the middleware does)
            await client.query(`SET LOCAL app.tenant_id = '${testTenantId}'`)

            try {
                // 2. Try to list entities using the context-aware getDb()
                // the policy is: tenant_id = current_setting('app.tenant_id', TRUE)::UUID
                const results: any = await getDb().execute(sql.raw('SELECT id, name, tenant_id FROM entities LIMIT 1'))
                console.log('Successfully queried entities with RLS active!')
                if (results.rows && results.rows.length > 0) {
                    console.log('Result:', JSON.stringify(results.rows[0], null, 2))
                } else {
                    console.log('No entities found for this tenant, but query succeeded.')
                }
            } catch (err: any) {
                console.error('FAILED to query entities even within context!')
                console.error(err.message)
            }
        })
    } finally {
        client.release()
        await pool.end()
    }
}

verify().catch(console.error)
