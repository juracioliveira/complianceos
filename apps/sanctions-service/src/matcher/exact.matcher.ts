import { db } from '../db/index.js';
import { sanctionsEntities } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { normalizeName } from '../utils/nameNormalizer.js';

export interface ScoreHit {
    entity_id: string;
    source: string;
    source_id: string;
    name_primary: string;
    names_aliases: string[];
    match_score: number;
    match_type: 'exact' | 'fuzzy' | 'token';
    entity_type: string;
    dob?: string;
    nationalities?: string[];
    programs?: string[];
    listed_at?: string;
    is_active: boolean;
}

export async function matchExact(queryName: string, activeSources: string[]): Promise<ScoreHit[]> {
    const normalizedQuery = normalizeName(queryName);
    if (!normalizedQuery) return [];

    // Fetch where name_normalized matches directly
    const results = await db.select()
        .from(sanctionsEntities)
        .where(sql`${sanctionsEntities.nameNormalized} = ${normalizedQuery} AND ${sanctionsEntities.isActive} = true AND ${sanctionsEntities.source} = ANY(${activeSources})`);

    return results.map(r => ({
        entity_id: r.id,
        source: r.source,
        source_id: r.sourceId,
        name_primary: r.namePrimary,
        names_aliases: r.namesAliases || [],
        match_score: 100,
        match_type: 'exact',
        entity_type: r.entityType,
        dob: r.dob || undefined,
        nationalities: r.nationalities || [],
        programs: r.programs || [],
        listed_at: r.listedAt || undefined,
        is_active: r.isActive,
    }));
}
