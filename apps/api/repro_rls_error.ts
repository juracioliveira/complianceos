
import pg from 'pg';
const { Pool } = pg;

async function test() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL || 'postgresql://compliance_app:app_password_dev@localhost:5432/compliance'
    });

    const client = await pool.connect();
    try {
        console.log('Testando query com app.tenant_id NÃO definido...');
        // Simulando a política de RLS: tenant_id = current_setting('app.tenant_id', TRUE)::UUID
        const res = await client.query("SELECT 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID = current_setting('app.tenant_id', TRUE)::UUID as match");
        console.log('Resultado:', res.rows[0]);
    } catch (err) {
        console.error('ERRO DETECTADO:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

test();
