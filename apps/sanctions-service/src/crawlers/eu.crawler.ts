import { BaseCrawler } from './base.crawler.js';
import { SanctionEntity } from '../normalizer.js';
import { EUParser } from '../parsers/eu.parser.js';

export class EUCrawler extends BaseCrawler {
    protected sourceName = 'EU_FSF';
    // Standard full sanctions list URL
    protected url = 'https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content?token=dG9rZW4tMjAxNw';

    private parser = new EUParser();

    public async getParsedEntities(): Promise<{ entities: SanctionEntity[], etag?: string } | null> {
        const rawBuffer = await this.fetch();
        if (!rawBuffer) return null;

        const entities = await this.parser.parse(rawBuffer);

        return {
            entities,
            etag: this.getLatestEtag(),
        };
    }
}
