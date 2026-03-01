export interface SanctionEntity {
    source_id: string;
    entity_type: 'individual' | 'entity';
    name_primary: string;
    names_aliases: string[];
    dob: string | null;           // SQL format: 'YYYY-MM-DD'
    dob_raw: string | null;       // 'circa 1970'
    nationalities: string[];
    id_documents: { type: string; number: string; country?: string; issued?: string; expiration?: string }[];
    addresses: { address?: string; city?: string; state?: string; country?: string; zip?: string }[];
    programs: string[];
    sanctions_type?: string;
    remarks?: string;
    listed_at?: string;           // SQL format: 'YYYY-MM-DD'
    delisted_at?: string;         // SQL format: 'YYYY-MM-DD'
    raw_data?: any;
}
