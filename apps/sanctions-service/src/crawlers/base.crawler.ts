import got, { Response, RequestError } from 'got';
import { logger } from '../utils/logger.js';
import { db } from '../db/index.js';
import { sanctionsSyncLog } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { XMLParser } from 'fast-xml-parser';

export abstract class BaseCrawler {
    protected abstract sourceName: string;
    protected abstract url: string;

    // ETag cache system
    public async fetch(): Promise<Buffer | null> {
        logger.info(`Starting fetch for ${this.sourceName} at ${this.url}`);

        let lastEtag: string | null = null;
        try {
            const lastSync = await db.select()
                .from(sanctionsSyncLog)
                .where(eq(sanctionsSyncLog.source, this.sourceName))
                .orderBy(desc(sanctionsSyncLog.id))
                .limit(1);

            if (lastSync[0]?.etag && lastSync[0].status === 'success') {
                lastEtag = lastSync[0].etag;
            }
        } catch (e) {
            logger.warn('Could not fetch last ETag from DB. Proceeding without If-None-Match header.');
        }

        const headers: Record<string, string> = {};
        if (lastEtag) {
            headers['If-None-Match'] = lastEtag;
        }

        try {
            const response = await got(this.url, {
                method: 'GET',
                headers,
                responseType: 'buffer',
                timeout: { request: 120000 }, // 120s timeout for large XMLs
                retry: {
                    limit: 5,
                    methods: ['GET'],
                    statusCodes: [408, 429, 500, 502, 503, 504]
                }
            });

            if (response.statusCode === 304) {
                logger.info(`Source ${this.sourceName} has not changed (304 Not Modified). Skipping parse.`);
                return null;
            }

            const etag = response.headers.etag as string | undefined;
            // We will securely pass the etag along via an internal state or properties if needed, 
            // but typically the orchestrator saves it. For simplicity, we just save the etag here or let the orchestrator do it.
            (this as any)._latestEtag = etag;

            return response.body;

        } catch (error) {
            if (error instanceof RequestError) {
                if (error.response?.statusCode === 304) {
                    logger.info(`Source ${this.sourceName} has not changed (304 Not Modified). Skipping parse.`);
                    return null;
                }
            }
            logger.error({ error, source: this.sourceName }, `Error fetching data from ${this.url}`);
            throw error;
        }
    }

    public getLatestEtag(): string | undefined {
        return (this as any)._latestEtag;
    }
}
