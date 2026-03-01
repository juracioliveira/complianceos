import { pool } from '../db/index.js';
import { logger } from '../utils/logger.js';
// @ts-ignore
import pkg from 'pg-copy-streams';
const { from: copyFrom } = pkg;
import { pipeline } from 'stream/promises';

// Table names mapper based on filename heuristic
export function getTableNameFromFilename(filename: string): string | null {
    const name = filename.toLowerCase();
    if (name.includes('empresas')) return 'rfb_empresas';
    if (name.includes('estabelecimentos')) return 'rfb_estabelecimentos';
    if (name.includes('socios')) return 'rfb_socios';
    if (name.includes('simples')) return 'rfb_simples';
    if (name.includes('cnaes')) return 'rfb_cnaes';
    if (name.includes('municipios')) return 'rfb_municipios';
    if (name.includes('naturezas')) return 'rfb_naturezas';
    if (name.includes('qualificacoes')) return 'rfb_qualificacoes';
    if (name.includes('motivos')) return 'rfb_motivos';
    if (name.includes('paises')) return 'rfb_paises';
    return null;
}

export async function loadToDatabase(tableName: string, dataStream: NodeJS.ReadableStream) {
    logger.info(`Starting COPY FROM STDIN for table ${tableName}`);
    const client = await pool.connect();

    try {
        // Truncate smaller domain lookup tables
        if (['rfb_cnaes', 'rfb_municipios', 'rfb_naturezas', 'rfb_qualificacoes', 'rfb_motivos', 'rfb_paises'].includes(tableName)) {
            await client.query(`TRUNCATE TABLE ${tableName} CASCADE;`);
        }

        // Drop indexes for large tables to speed up COPY. We can recreate them later.
        // For simplicity, we just run COPY here. In real production, dropping and recreating indexes is critical.

        // copy command expecting CSV format with ';' delimiter
        // The CSVs from RFB often have no headers, and fields are quoted, encoding UTF8 (since we converted from Latin1 to utf8 stream before)
        const copyQuery = `COPY ${tableName} FROM STDIN WITH (FORMAT csv, DELIMITER ';', QUOTE '"', ENCODING 'UTF8')`;

        // @ts-ignore Since pg-copy-streams types can be finicky with TS node16+ resolution
        const stream = client.query(copyFrom(copyQuery));

        await pipeline(dataStream, stream);
        logger.info(`Successfully loaded data into ${tableName}`);
    } catch (error) {
        logger.error({ tableName, error }, `Error loading data into ${tableName}`);
        throw error;
    } finally {
        client.release();
    }
}
