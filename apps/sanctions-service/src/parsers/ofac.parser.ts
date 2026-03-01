import { XMLParser } from 'fast-xml-parser';
import { SanctionEntity } from '../normalizer.js';
import { logger } from '../utils/logger.js';

export class OFACParser {
    private parser: XMLParser;

    constructor() {
        this.parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '',
            isArray: (name, jpath, isLeafNode, isAttribute) => {
                // Enforce array for elements that can appear multiple times
                const arrayPaths = [
                    'sdnList.sdnEntry',
                    'sdnList.sdnEntry.akaList.aka',
                    'sdnList.sdnEntry.programList.program',
                    'sdnList.sdnEntry.idList.id',
                    'sdnList.sdnEntry.addressList.address',
                    'sdnList.sdnEntry.nationalityList.nationality',
                    'sdnList.sdnEntry.dateOfBirthList.dateOfBirthItem',
                ];
                return arrayPaths.includes(jpath);
            },
        });
    }

    public async parse(xmlBuffer: Buffer): Promise<SanctionEntity[]> {
        logger.info('Parsing OFAC XML...');
        const xmlString = xmlBuffer.toString('utf-8');
        const obj = this.parser.parse(xmlString);

        const sdnEntries = obj?.sdnList?.sdnEntry || [];
        const entities: SanctionEntity[] = [];

        for (const entry of sdnEntries) {
            if (!entry.uid) continue;

            const entityType = entry.entityType?.toLowerCase() === 'individual' ? 'individual' : 'entity';
            const lastName = entry.lastName || '';
            const firstName = entry.firstName || '';

            let namePrimary = `${lastName}${firstName ? ', ' + firstName : ''}`;
            if (!namePrimary) namePrimary = 'Unknown';

            const aliases: string[] = [];
            const akaList = entry.akaList?.aka || [];
            for (const aka of akaList) {
                const akaLast = aka.lastName || '';
                const akaFirst = aka.firstName || '';
                if (akaLast || akaFirst) {
                    aliases.push(`${akaLast}${akaFirst ? ', ' + akaFirst : ''}`);
                }
            }

            const programs: string[] = [];
            const programList = entry.programList?.program || [];
            for (const prog of programList) {
                if (prog) programs.push(prog);
            }

            const idDocuments: any[] = [];
            const idList = entry.idList?.id || [];
            for (const idObj of idList) {
                if (idObj.idNumber) {
                    idDocuments.push({
                        type: idObj.idType || 'UNKNOWN',
                        number: idObj.idNumber,
                        country: idObj.idCountry || undefined,
                        issued: idObj.idIssueDate || undefined,
                        expiration: idObj.idExpirationDate || undefined,
                    });
                }
            }

            const addresses: any[] = [];
            const addressList = entry.addressList?.address || [];
            for (const addr of addressList) {
                addresses.push({
                    address: addr.address1 || addr.address2 || undefined,
                    city: addr.city || undefined,
                    state: addr.stateOrProvince || undefined,
                    country: addr.country || undefined,
                    zip: addr.postalCode || undefined,
                });
            }

            const nationalities: string[] = [];
            const natList = entry.nationalityList?.nationality || [];
            for (const nat of natList) {
                if (nat.country) nationalities.push(nat.country);
            }

            let dob: string | null = null;
            let dobRaw: string | null = null;
            const dobList = entry.dateOfBirthList?.dateOfBirthItem || [];
            if (dobList.length > 0) {
                const dobItem = dobList[0].dateOfBirth || '';
                if (dobItem) {
                    dobRaw = dobItem;
                    // If looks like YYYY-MM-DD
                    if (/^\d{4}-\d{2}-\d{2}$/.test(dobItem)) {
                        dob = dobItem;
                    } else if (/^\d{4}$/.test(dobItem)) {
                        // circa YYYY -> keep raw only, exact date null
                    }
                }
            }

            const remarks = entry.remarks || undefined;

            entities.push({
                source_id: entry.uid.toString(),
                entity_type: entityType,
                name_primary: namePrimary,
                names_aliases: aliases,
                dob,
                dob_raw: dobRaw,
                nationalities,
                id_documents: idDocuments,
                addresses,
                programs,
                remarks,
                raw_data: entry,
            });
        }

        logger.info(`Parsed ${entities.length} OFAC entities`);
        return entities;
    }
}
