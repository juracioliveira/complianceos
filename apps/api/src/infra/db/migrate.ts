import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const MIGRATIONS_DIR = join(__dirname, 'migrations')

async function createMigrationsTable(client: pg.Client): Promise<void> {
    await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id         SERIAL       PRIMARY KEY,
      filename   VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `)
}

async function getAppliedMigrations(client: pg.Client): Promise<Set<string>> {
    const result = await client.query<{ filename: string }>(
        'SELECT filename FROM _migrations ORDER BY id ASC'
    )
    return new Set(result.rows.map((r) => r.filename))
}

async function runMigrations(): Promise<void> {
    const databaseUrl = process.env['DATABASE_MIGRATOR_URL'] ?? process.env['DATABASE_URL']
    if (!databaseUrl) {
        throw new Error('DATABASE_MIGRATOR_URL ou DATABASE_URL não configurada')
    }

    const client = new pg.Client({ connectionString: databaseUrl })
    await client.connect()
    console.log('✅ Conectado ao PostgreSQL')

    try {
        await createMigrationsTable(client)
        const applied = await getAppliedMigrations(client)

        const migrationFiles = readdirSync(MIGRATIONS_DIR)
            .filter((f) => f.endsWith('.sql'))
            .sort()

        const pending = migrationFiles.filter((f) => !applied.has(f))

        if (pending.length === 0) {
            console.log('✅ Nenhuma migration pendente')
            return
        }

        console.log(`📦 ${pending.length} migration(s) pendente(s):\n`)

        for (const filename of pending) {
            const filepath = join(MIGRATIONS_DIR, filename)
            const sql = readFileSync(filepath, 'utf8')

            console.log(`  ⏳ Aplicando: ${filename}`)
            await client.query('BEGIN')

            try {
                await client.query(sql)
                await client.query(
                    'INSERT INTO _migrations (filename) VALUES ($1)',
                    [filename]
                )
                await client.query('COMMIT')
                console.log(`  ✅ OK: ${filename}`)
            } catch (error) {
                await client.query('ROLLBACK')
                console.error(`  ❌ ERRO em ${filename}:`, error)
                throw error
            }
        }

        console.log('\n🎉 Todas as migrations aplicadas com sucesso!')
    } finally {
        await client.end()
    }
}

runMigrations().catch((err) => {
    console.error('❌ Migration falhou:', err)
    process.exit(1)
})
