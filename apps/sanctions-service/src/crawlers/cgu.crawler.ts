import got from 'got';
import { logger } from '../utils/logger.js';
import { SanctionEntity } from '../normalizer.js';
import dotenv from 'dotenv';
dotenv.config();

export class CGUCrawler {
    private apiKey = process.env.CGU_API_KEY;
    private baseUrl = 'https://api.portaltransparencia.gov.br/api-de-dados';
    private sources = ['ceis', 'cnep', 'cepim'];

    public async getParsedEntities(sourceType: 'ceis' | 'cnep' | 'cepim'): Promise<{ entities: SanctionEntity[] } | null> {
        if (!this.apiKey) {
            logger.error('CGU_API_KEY not configured. Skipping CGU crawl.');
            return null;
        }

        logger.info(`Starting CGU fetch for ${sourceType}`);
        const entities: SanctionEntity[] = [];

        let page = 1;
        const tamanhoPagina = 500;

        while (true) {
            try {
                const data = await got(`${this.baseUrl}/${sourceType}?pagina=${page}&tamanhoPagina=${tamanhoPagina}`, {
                    headers: {
                        'chave-api-dados': this.apiKey,
                    },
                    responseType: 'json',
                    timeout: { request: 30000 },
                }).json<any[]>();

                if (!data || data.length === 0) break;

                for (const item of data) {
                    // Normalization for CEIS
                    const cnpjObj = item.pessoaJuridica || item.sancionado || {};
                    const cpfObj = item.pessoaFisica || item.sancionado || {};

                    const doc = item.cnpj || item.cpf || cnpjObj.cpfFormatado || cnpjObj.cnpjFormatado || null;
                    const name = item.razaoSocial || item.nome || cnpjObj.nomeFantasia || cnpjObj.razaoSocial || cpfObj.nome || 'Unknown';
                    const entityType = item.tipoPessoa === 'J' || item.tipoPessoa === 'Jurídica' ? 'entity' : 'individual';
                    const cleanDoc = doc ? doc.replace(/[^\d]/g, '') : undefined;

                    const idDocuments = [];
                    if (cleanDoc) {
                        idDocuments.push({
                            type: cleanDoc.length === 11 ? 'CPF' : 'CNPJ',
                            number: cleanDoc,
                            country: 'BR'
                        });
                    }

                    entities.push({
                        source_id: (doc || name) + `-${sourceType}`,
                        entity_type: entityType,
                        name_primary: name,
                        names_aliases: [],
                        dob: null,
                        dob_raw: null,
                        nationalities: ['BR'],
                        id_documents: idDocuments,
                        addresses: [],
                        programs: [`CGU_${sourceType.toUpperCase()}`],
                        listed_at: item.dataInicioSancao || undefined,
                        delisted_at: item.dataFimSancao || undefined,
                        remarks: item.fundamentacaoLegal || undefined,
                        raw_data: item,
                    });
                }

                if (data.length < tamanhoPagina) break; // Last page
                page++;
                await new Promise(r => setTimeout(r, 200)); // Respect CGU rate limits
            } catch (err) {
                logger.error({ err, page, sourceType }, 'Error crawling CGU');
                break;
            }
        }

        return { entities };
    }
}
