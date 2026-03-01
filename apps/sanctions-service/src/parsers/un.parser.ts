import { XMLParser } from 'fast-xml-parser';
import { SanctionEntity } from '../normalizer.js';
import { logger } from '../utils/logger.js';

export class UNParser {
    private parser: XMLParser;

    constructor() {
        this.parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '',
            isArray: (name, jpath, isLeafNode, isAttribute) => {
                const arrayPaths = [
                    'CONSOLIDATED_LIST.INDIVIDUALS.INDIVIDUAL',
                    'CONSOLIDATED_LIST.ENTITIES.ENTITY',
                    'CONSOLIDATED_LIST.INDIVIDUALS.INDIVIDUAL.INDIVIDUAL_ALIAS',
                    'CONSOLIDATED_LIST.INDIVIDUALS.INDIVIDUAL.NATIONALITY',
                    'CONSOLIDATED_LIST.INDIVIDUALS.INDIVIDUAL.INDIVIDUAL_DOCUMENT',
                    'CONSOLIDATED_LIST.INDIVIDUALS.INDIVIDUAL.INDIVIDUAL_DATE_OF_BIRTH',
                    'CONSOLIDATED_LIST.ENTITIES.ENTITY.ENTITY_ALIAS',
                    'CONSOLIDATED_LIST.ENTITIES.ENTITY.ENTITY_ADDRESS',
                ];
                return arrayPaths.includes(jpath);
            },
        });
    }

    public async parse(xmlBuffer: Buffer): Promise<SanctionEntity[]> {
        logger.info('Parsing UN XML...');
        const xmlString = xmlBuffer.toString('utf-8');
        const obj = this.parser.parse(xmlString);

        const individuals = obj?.CONSOLIDATED_LIST?.INDIVIDUALS?.INDIVIDUAL || [];
        const entitiesData = obj?.CONSOLIDATED_LIST?.ENTITIES?.ENTITY || [];
        const entities: SanctionEntity[] = [];

        // Parse individuals
        for (const ind of individuals) {
            if (!ind.DATAID) continue;

            const first = ind.FIRST_NAME || '';
            const second = ind.SECOND_NAME || '';
            const third = ind.THIRD_NAME || '';
            const fourth = ind.FOURTH_NAME || '';
            const namePrimary = `${first} ${second} ${third} ${fourth}`.replace(/\s+/g, ' ').trim();

            const aliases: string[] = [];
            const aliasList = ind.INDIVIDUAL_ALIAS || [];
            for (const al of aliasList) {
                if (al.ALIAS_NAME) aliases.push(al.ALIAS_NAME.trim());
            }

            const nationalities: string[] = [];
            const natList = ind.NATIONALITY || [];
            for (const nat of natList) {
                if (nat.VALUE) nationalities.push(nat.VALUE.trim());
            }

            const idDocuments: any[] = [];
            const docList = ind.INDIVIDUAL_DOCUMENT || [];
            for (const doc of docList) {
                if (doc.NUMBER) {
                    idDocuments.push({
                        type: doc.TYPE_OF_DOCUMENT || 'UNKNOWN',
                        number: doc.NUMBER,
                        country: doc.ISSUING_COUNTRY || undefined,
                    });
                }
            }

            let dob: string | null = null;
            let dobRaw: string | null = null;
            const dobList = ind.INDIVIDUAL_DATE_OF_BIRTH || [];
            if (dobList.length > 0) {
                const dItem = dobList[0];
                if (dItem.DATE) {
                    dobRaw = dItem.DATE;
                    if (/^\d{4}-\d{2}-\d{2}$/.test(dItem.DATE)) {
                        dob = dItem.DATE;
                    }
                } else if (dItem.FROM_YEAR) {
                    dobRaw = dItem.FROM_YEAR;
                }
            }

            entities.push({
                source_id: ind.DATAID.toString(),
                entity_type: 'individual',
                name_primary: namePrimary || 'Unknown',
                names_aliases: aliases,
                dob,
                dob_raw: dobRaw,
                nationalities,
                id_documents: idDocuments,
                addresses: [],
                programs: ['UN_SC'],
                listed_at: ind.LISTED_ON || undefined,
                remarks: ind.DESIGNATION?.VALUE || undefined,
                raw_data: ind,
            });
        }

        // Parse entities
        for (const ent of entitiesData) {
            if (!ent.DATAID) continue;

            const namePrimary = ent.FIRST_NAME?.trim();

            const aliases: string[] = [];
            const aliasList = ent.ENTITY_ALIAS || [];
            for (const al of aliasList) {
                if (al.ALIAS_NAME) aliases.push(al.ALIAS_NAME.trim());
            }

            const addresses: any[] = [];
            const addrList = ent.ENTITY_ADDRESS || [];
            for (const addr of addrList) {
                addresses.push({
                    city: addr.CITY || undefined,
                    country: addr.COUNTRY || undefined,
                    address: [addr.STREET, addr.STATE_PROVINCE, addr.ZIP_CODE].filter(Boolean).join(', ') || undefined,
                });
            }

            entities.push({
                source_id: ent.DATAID.toString(),
                entity_type: 'entity',
                name_primary: namePrimary || 'Unknown',
                names_aliases: aliases,
                dob: null,
                dob_raw: null,
                nationalities: [],
                id_documents: [],
                addresses,
                programs: ['UN_SC'],
                listed_at: ent.LISTED_ON || undefined,
                remarks: ent.DESIGNATION?.VALUE || undefined,
                raw_data: ent,
            });
        }

        logger.info(`Parsed ${entities.length} UN entities`);
        return entities;
    }
}
