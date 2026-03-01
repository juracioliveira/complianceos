import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://cnpj:cnpj123@localhost:5432/cnpj_rfb',
    max: 1,
});

const db = drizzle(pool);

async function run() {
    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: './src/db/migrations' });
    console.log('Migrations completed successfully.');
    await pool.end();
    process.exit(0);
}

run().catch((err) => {
    console.error('Migration failed!', err);
    process.exit(1);
});
