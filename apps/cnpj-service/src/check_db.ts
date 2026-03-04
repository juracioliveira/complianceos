import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;

async function run() {
    if (!connectionString) {
        console.error('DATABASE_URL not found in .env');
        process.exit(1);
    }

    const client = new Client({
        connectionString,
        connectionTimeoutMillis: 15000,
    });

    try {
        await client.connect();
        console.log('Successfully connected to the database.');

        const syncRes = await client.query('SELECT competencia, status, arquivos_ok, iniciado_em, concluido_em FROM rfb_sync_log ORDER BY id DESC LIMIT 5');
        console.log('\n--- Sync Status ---');
        console.table(syncLogFormat(syncRes.rows));

        const tables = [
            'rfb_empresas',
            'rfb_estabelecimentos',
            'rfb_socios',
            'rfb_simples',
            'rfb_cnaes',
            'rfb_municipios'
        ];

        console.log('\n--- Table Counts ---');
        for (const table of tables) {
            try {
                const countRes = await client.query(\`SELECT count(*) FROM \${table}\`);
                console.log(\`\${table.padEnd(25)}: \${Number(countRes.rows[0].count).toLocaleString('pt-BR')}\`);
            } catch (e) {
                console.log(\`\${table.padEnd(25)}: Error or not created yet\`);
            }
        }

    } catch (err) {
        console.error('Error:', (err as Error).message);
    } finally {
        await client.end();
    }
}

function syncLogFormat(rows: any[]) {
    return rows.map(r => ({
        ...r,
        iniciado_em: r.iniciado_em?.toLocaleString(),
        concluido_em: r.concluido_em?.toLocaleString(),
    }));
}

run();
