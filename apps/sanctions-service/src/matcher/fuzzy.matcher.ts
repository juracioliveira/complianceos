import { db } from '../db/index.js';
import { sanctionsEntities } from '../db/schema.js';
import { sql } from 'drizzle-orm';
import { normalizeName } from '../utils/nameNormalizer.js';
import { ScoreHit } from './exact.matcher.js';

export async function matchFuzzy(queryName: string, activeSources: string[], minScore: number): Promise<ScoreHit[]> {
    const normalizedQuery = normalizeName(queryName);
    if (!normalizedQuery) return [];

    // Convert minScore to threshold (0.0 to 1.0)
    const threshold = minScore / 100;

    // Trigram fuzzy similarity over name_normalized
    const results = await db.execute(sql`
     SELECT 
       id, source, source_id, name_primary, names_aliases, entity_type, dob, nationalities, programs, listed_at, is_active,
       similarity(name_normalized, ${normalizedQuery}) AS trgm_score
     FROM sanctions_entities
     WHERE 
       is_active = true 
       AND source = ANY(${activeSources})
       AND similarity(name_normalized, ${normalizedQuery}) >= ${threshold}
     ORDER BY trgm_score DESC
     LIMIT 50
   `);

    return results.rows.map(r => {
        // Calculate token score (fallback for partial token match logic vs trgm)
        // trgm works mostly as expected, but token subset helps if Trigram penalizes length.
        // Drizzle raw returns fields, compute final scaled score:
        const trgmScoreScaled = Math.round(Number(r.trgm_score) * 100);

        // Checking for exact token containment
        const queryTokens = normalizedQuery.split(' ');
        const entityNameNorm = normalizeName(r.name_primary as string);
        const entityTokens = entityNameNorm.split(' ');
        const hasAllTokens = queryTokens.every(t => entityTokens.includes(t));

        let finalScore = trgmScoreScaled;
        let matchType: 'fuzzy' | 'token' = 'fuzzy';

        if (hasAllTokens) {
            matchType = 'token';
            // if all tokens match exactly but there are extra, bump the score if it's below 75
            if (finalScore < 75) finalScore = 75;
        }

        return {
            entity_id: r.id as string,
            source: r.source as string,
            source_id: r.source_id as string,
            name_primary: r.name_primary as string,
            names_aliases: r.names_aliases as string[] || [],
            match_score: finalScore,
            match_type: matchType,
            entity_type: r.entity_type as string,
            dob: r.dob as string | undefined,
            nationalities: r.nationalities as string[] || [],
            programs: r.programs as string[] || [],
            listed_at: r.listed_at as string | undefined,
            is_active: r.is_active as boolean,
        };
    });
}
