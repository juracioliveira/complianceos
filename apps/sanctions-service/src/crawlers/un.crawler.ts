import { BaseCrawler } from './base.crawler.js';
import { SanctionEntity } from '../normalizer.js';
import { UNParser } from '../parsers/un.parser.js';

export class UNCrawler extends BaseCrawler {
    protected sourceName = 'UN_SC';
    protected url = 'https://scsanctions.un.org/resources/xml/en/consolidated.xml';

    private parser = new UNParser();

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
