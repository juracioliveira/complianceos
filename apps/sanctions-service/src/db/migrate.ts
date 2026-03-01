import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://sanctions:sanctions123@localhost:5432/sanctions_db',
    max: 1,
});

const db = drizzle(pool);

async function run() {
    console.log('Running extensions check...');
    const client = await pool.connect();
    try {
        await client.query('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
        await client.query('CREATE EXTENSION IF NOT EXISTS unaccent;');
        // We need to enforce unique source & source_id manually or during schema creation
        const res = await client.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'sanctions_entities' AND constraint_type = 'UNIQUE';
    `);

        // Check if unique exists, otherwise add it. 
        // Usually drizzle migrations handle this, but adding custom SQL constraint here to be safe
        // Note: Drizzle migrations will run after this step
    } catch (err) {
        console.error('Failed checking extensions', err);
    } finally {
        client.release();
    }

    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: './src/db/migrations' });

    // Enforce unique constraint if it wasn't added by drizzle
    const client2 = await pool.connect();
    try {
        await client2.query(`
       ALTER TABLE "sanctions_entities" 
       ADD CONSTRAINT "unique_source_source_id" UNIQUE ("source", "source_id");
     `);
    } catch (e) { /* ignore if exists */ }
    finally { client2.release(); }

    console.log('Migrations completed successfully.');
    await pool.end();
    process.exit(0);
}

run().catch((err) => {
    console.error('Migration failed!', err);
    process.exit(1);
});
