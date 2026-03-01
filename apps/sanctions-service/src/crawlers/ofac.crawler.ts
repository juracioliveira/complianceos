import { BaseCrawler } from './base.crawler.js';
import { SanctionEntity } from '../normalizer.js';
import { OFACParser } from '../parsers/ofac.parser.js';

export class OfacCrawler extends BaseCrawler {
    protected sourceName = 'OFAC_SDN';
    protected url = 'https://www.treasury.gov/ofac/downloads/sanctions/1.0/sdn_advanced.xml';

    private parser = new OFACParser();

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
