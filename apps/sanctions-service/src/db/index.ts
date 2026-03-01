import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://sanctions:sanctions123@localhost:5432/sanctions_db',
    min: Number(process.env.DATABASE_POOL_MIN || 2),
    max: Number(process.env.DATABASE_POOL_MAX || 10),
});

export const db = drizzle(pool, { schema });
export { pool };
