import { getLatestCompetencia, zipFilesList } from '../utils/rfbFolders.js';
import { db } from '../db/index.js';
import { rfbSyncLog } from '../db/schema.js';
import { desc, eq } from 'drizzle-orm';
import { logger } from '../utils/logger.js';
import { downloadFile } from '../etl/downloader.js';
import { getExtractedStream } from '../etl/transformer.js';
import { getTableNameFromFilename, loadToDatabase } from '../etl/loader.js';
import pLimit from 'p-limit';
import fs from 'fs';
import path from 'path';

export async function runSyncJob() {
    logger.info('Starting RFB sync pipeline...');
    const baseUrl = process.env.RFB_BASE_URL || 'https://arquivos.receitafederal.gov.br/dados/cnpj/dados_abertos_cnpj';
    const downloadDir = process.env.RFB_DOWNLOAD_DIR || '/tmp/rfb';
    const concurrency = Number(process.env.RFB_DOWNLOAD_CONCURRENCY || 3);
    const limit = pLimit(concurrency);

    let targetCompetencia = process.env.SYNC_FORCE_COMPETENCIA;

    if (!targetCompetencia) {
        targetCompetencia = await getLatestCompetencia();
        logger.info(`Detected latest RFB folder: ${targetCompetencia}`);
    }

    // Check if it was already processed successfully
    const latestSyncResult = await db.select()
        .from(rfbSyncLog)
        .where(eq(rfbSyncLog.competencia, targetCompetencia))
        .orderBy(desc(rfbSyncLog.id))
        .limit(1);

    if (latestSyncResult[0] && latestSyncResult[0].status === 'success') {
        logger.info(`Competencia ${targetCompetencia} is already fully synchronized! Exiting...`);
        return;
    }

    // Start Sync tracking
    const [syncRun] = await db.insert(rfbSyncLog).values({
        competencia: targetCompetencia,
        status: 'running',
    }).returning({ id: rfbSyncLog.id });

    if (!syncRun) throw new Error("Could not create sync log entry");

    let filesOk = 0;

    try {
        const promises = zipFilesList.map(fileName => limit(async () => {
            const fileUrl = `${baseUrl}/${targetCompetencia}/${fileName}`;
            logger.info(`Processing ${fileUrl}`);

            const zipLocalPath = await downloadFile(fileUrl, downloadDir, fileName);

            const extraction = await getExtractedStream(zipLocalPath);

            if (extraction) {
                const { stream: dataStream, filename: internalFilename } = extraction;
                const tableName = getTableNameFromFilename(fileName);

                if (tableName) {
                    await loadToDatabase(tableName, dataStream);
                    filesOk++;
                } else {
                    logger.warn(`Could not map zip file ${fileName} to a valid database table.`);
                }
            }

            // Cleanup
            if (fs.existsSync(zipLocalPath)) {
                fs.unlinkSync(zipLocalPath);
                logger.info(`Cleaned up temp ZIP: ${zipLocalPath}`);
            }

            // Update sync row 
            await db.update(rfbSyncLog)
                .set({ arquivosOk: filesOk })
                .where(eq(rfbSyncLog.id, syncRun.id));
        }));

        await Promise.all(promises);

        logger.info('All files processed successfully! Finishing up sync log.');
        await db.update(rfbSyncLog)
            .set({
                status: 'success',
                concluidoEm: new Date()
            })
            .where(eq(rfbSyncLog.id, syncRun.id));

    } catch (error) {
        logger.error({ error }, 'Sync job failed');
        await db.update(rfbSyncLog)
            .set({
                status: 'error',
                erroMsg: (error as Error).message || 'Unknown error',
                concluidoEm: new Date(),
            })
            .where(eq(rfbSyncLog.id, syncRun.id));
        throw error;
    }
}
