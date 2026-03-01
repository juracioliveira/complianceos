import { Worker, Job } from 'bullmq';
import { redis } from '../cache/redis.js';
import { logger } from '../utils/logger.js';
import { db } from '../db/index.js';
import { sanctionsEntities, sanctionsSyncLog } from '../db/schema.js';
import { eq, and, notInArray, sql } from 'drizzle-orm';
import { chunk } from 'lodash-es';
import { normalizeName } from '../utils/nameNormalizer.js';

import { OfacCrawler } from '../crawlers/ofac.crawler.js';
import { UNCrawler } from '../crawlers/un.crawler.js';
import { EUCrawler } from '../crawlers/eu.crawler.js';
import { InterpolCrawler } from '../crawlers/interpol.crawler.js';
import { CGUCrawler } from '../crawlers/cgu.crawler.js';

function getCrawler(source: string) {
    switch (source) {
        case 'OFAC_SDN': return new OfacCrawler();
        case 'UN_SC': return new UNCrawler();
        case 'EU_FSF': return new EUCrawler();
        case 'INTERPOL_RED': return new InterpolCrawler();
        case 'CGU_CEIS':
        case 'CGU_CNEP':
        case 'CGU_CEPIM':
            const cguType = source.split('_')[1]!.toLowerCase() as any;
            return {
                sourceName: source,
                getParsedEntities: () => new CGUCrawler().getParsedEntities(cguType)
            };
        default:
            throw new Error(`Unknown source: ${source}`);
    }
}

async function syncSource(source: string) {
    logger.info(`Starting sync for ${source}`);
    const crawler = getCrawler(source);

    const logId = await db.insert(sanctionsSyncLog).values({
        source,
        status: 'running',
    }).returning({ id: sanctionsSyncLog.id });

    try {
        const result = await crawler.getParsedEntities();

        if (!result) {
            await db.update(sanctionsSyncLog)
                .set({ status: 'skipped', concluidoEm: new Date(), erroMsg: '304 Not Modified' })
                .where(eq(sanctionsSyncLog.id, logId[0]!.id));
            return;
        }

        const { entities, etag } = result as any;

        // Normalizar
        const normalized = entities.map((e: any) => ({
            ...e,
            name_normalized: normalizeName(e.name_primary),
            source,
            is_active: true,
            last_synced_at: new Date(),
        }));

        await db.transaction(async (tx) => {
            const currentIds: string[] = Array.from(new Set(normalized.map((e: any) => e.source_id as string)));

            // Desativar removidos (only if we got any payload back, to prevent dropping all on failure)
            if (currentIds.length > 0) {
                // Batch notInArray cause PG limit is 65k params
                for (const idBatch of chunk(currentIds, 10000)) {
                    await tx.update(sanctionsEntities)
                        .set({ isActive: false, lastSyncedAt: new Date() })
                        .where(and(
                            eq(sanctionsEntities.source, source),
                            eq(sanctionsEntities.isActive, true),
                            notInArray(sanctionsEntities.sourceId, idBatch)
                        ));
                }
            }

            // Upsert ativos em lotes de 500
            for (const batch of chunk(normalized, 500)) {
                await tx.insert(sanctionsEntities)
                    .values(batch.map((b: any) => ({
                        source: b.source,
                        sourceId: b.source_id,
                        entityType: b.entity_type,
                        namePrimary: b.name_primary,
                        namesAliases: b.names_aliases,
                        nameNormalized: b.name_normalized,
                        dob: b.dob,
                        dobRaw: b.dob_raw,
                        nationalities: b.nationalities,
                        idDocuments: b.id_documents,
                        addresses: b.addresses,
                        programs: b.programs,
                        remarks: b.remarks,
                        listedAt: b.listed_at,
                        isActive: b.is_active,
                        lastSyncedAt: b.last_synced_at,
                        rawData: b.raw_data,
                    })))
                    .onConflictDoUpdate({
                        target: [sanctionsEntities.source, sanctionsEntities.sourceId],
                        set: {
                            entityType: sql`EXCLUDED.entity_type`,
                            namePrimary: sql`EXCLUDED.name_primary`,
                            namesAliases: sql`EXCLUDED.names_aliases`,
                            nameNormalized: sql`EXCLUDED.name_normalized`,
                            dob: sql`EXCLUDED.dob`,
                            dobRaw: sql`EXCLUDED.dob_raw`,
                            nationalities: sql`EXCLUDED.nationalities`,
                            idDocuments: sql`EXCLUDED.id_documents`,
                            addresses: sql`EXCLUDED.addresses`,
                            programs: sql`EXCLUDED.programs`,
                            remarks: sql`EXCLUDED.remarks`,
                            listedAt: sql`EXCLUDED.listed_at`,
                            isActive: sql`EXCLUDED.is_active`,
                            lastSyncedAt: sql`EXCLUDED.last_synced_at`,
                            rawData: sql`EXCLUDED.raw_data`,
                        }
                    });
            }
        });

        await db.update(sanctionsSyncLog)
            .set({
                status: 'success',
                concluidoEm: new Date(),
                etag: etag || null,
                entitiesAdded: normalized.length,
            })
            .where(eq(sanctionsSyncLog.id, logId[0]!.id));

        logger.info(`Sync complete for ${source}`);
    } catch (err: any) {
        logger.error({ err, source }, `Error syncing ${source}`);
        await db.update(sanctionsSyncLog)
            .set({
                status: 'error',
                concluidoEm: new Date(),
                erroMsg: err.message,
            })
            .where(eq(sanctionsSyncLog.id, logId[0]!.id));
        throw err;
    }
}

export const syncWorker = new Worker('sanctions-sync', async (job: Job) => {
    const sources = job.data.sources || [];

    let targetSources = sources;
    if (targetSources.length === 0) {
        targetSources = [
            'OFAC_SDN', 'UN_SC', 'EU_FSF',
            'CGU_CEIS', 'CGU_CNEP', 'CGU_CEPIM', 'INTERPOL_RED'
        ];
    }

    for (const source of targetSources) {
        if (process.env[`SOURCE_${source}`] !== 'false') {
            try {
                await syncSource(source);
            } catch (e) { /* logged internally, proceed to next */ }
        }
    }

}, {
    connection: redis as any,
    concurrency: Number(process.env.SYNC_CONCURRENCY || 2),
});

syncWorker.on('completed', job => logger.info(`Job ${job.id} completed.`));
syncWorker.on('failed', (job, err) => logger.error({ err }, `Job ${job?.id} failed.`));

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, closing BullMQ worker...');
    await syncWorker.close();
    process.exit(0);
});
