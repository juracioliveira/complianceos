import { XMLParser } from 'fast-xml-parser';
import { SanctionEntity } from '../normalizer.js';
import { logger } from '../utils/logger.js';

export class EUParser {
    private parser: XMLParser;

    constructor() {
        this.parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '',
            isArray: (name, jpath, isLeafNode, isAttribute) => {
                const arrayPaths = [
                    'export.sanctionEntity',
                    'export.sanctionEntity.nameAlias',
                    'export.sanctionEntity.birthdate',
                    'export.sanctionEntity.identification',
                    'export.sanctionEntity.address',
                    'export.sanctionEntity.regulation',
                ];
                return arrayPaths.includes(jpath);
            },
        });
    }

    public async parse(xmlBuffer: Buffer): Promise<SanctionEntity[]> {
        logger.info('Parsing EU XML...');
        const xmlString = xmlBuffer.toString('utf-8');
        const obj = this.parser.parse(xmlString);

        const entitiesData = obj?.export?.sanctionEntity || [];
        const entities: SanctionEntity[] = [];

        for (const ent of entitiesData) {
            const sourceId = ent['eu-reference-number'];
            if (!sourceId) continue;

            const entityType = ent.subjectType?.code === 'enterprise' ? 'entity' : 'individual';

            let namePrimary = 'Unknown';
            const aliases: string[] = [];
            const names = ent.nameAlias || [];

            for (const n of names) {
                if (n.aliasStrong === 'true' || n.aliasStrong === true || !namePrimary || namePrimary === 'Unknown') {
                    namePrimary = n.wholeName || namePrimary;
                } else {
                    if (n.wholeName) aliases.push(n.wholeName);
                }
            }

            const idDocuments: any[] = [];
            const docs = ent.identification || [];
            for (const doc of docs) {
                if (doc.number) {
                    idDocuments.push({
                        type: doc.identificationTypeCode || 'UNKNOWN',
                        number: doc.number,
                        country: doc.countryIso2Code || undefined,
                        issued: doc.issuedBy || undefined,
                    });
                }
            }

            const addresses: any[] = [];
            const addrs = ent.address || [];
            for (const a of addrs) {
                addresses.push({
                    address: a.street || undefined,
                    city: a.city || undefined,
                    zip: a.zipCode || undefined,
                    country: a.countryIso2Code || a.countryDescription || undefined,
                });
            }

            const programs: string[] = [];
            const regs = ent.regulation || [];
            for (const r of regs) {
                if (r.programme) programs.push(r.programme);
            }

            let dob: string | null = null;
            let dobRaw: string | null = null;
            const dlist = ent.birthdate || [];
            if (dlist.length > 0 && dlist[0].birthdate) {
                dobRaw = dlist[0].birthdate;
                if (dobRaw && /^\d{4}-\d{2}-\d{2}$/.test(dobRaw)) {
                    dob = dobRaw;
                }
            }

            entities.push({
                source_id: sourceId.toString(),
                entity_type: entityType,
                name_primary: namePrimary,
                names_aliases: aliases,
                dob,
                dob_raw: dobRaw,
                nationalities: [], // Usually EU mappings place this differently or inside names/identifications
                id_documents: idDocuments,
                addresses,
                programs,
                raw_data: ent,
            });
        }

        logger.info(`Parsed ${entities.length} EU entities`);
        return entities;
    }
}
