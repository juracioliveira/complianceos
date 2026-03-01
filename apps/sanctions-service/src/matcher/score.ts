import { matchExact, ScoreHit } from './exact.matcher.js';
import { matchFuzzy } from './fuzzy.matcher.js';

export async function scoreDocumentAndMerge(
    hits: ScoreHit[],
    queryDocument: string | undefined
): Promise<ScoreHit[]> {
    if (!queryDocument) return hits;
    const cleanQueryDoc = queryDocument.replace(/[^\w\d]/g, '').toUpperCase();
    if (!cleanQueryDoc) return hits;

    for (const hit of hits) {
        // In a real scenario, we'd lookup the actual JSONB idDocuments.
        // Since hits doesn't embed all raw docs by default to save bandwidth, 
        // we assume we passed them or can do another DB query. 
        // For simplicity let's assume `hit` is enriched or we give a blanket boost conceptually.
        // A more robust implementation queries id_documents constraint:
    }

    return hits; // Simplified for this scaffold. Check logic below.
}

export async function performScreening(params: {
    name: string;
    document?: string;
    entity_type?: 'individual' | 'entity';
    sources: string[];
    min_score: number;
}): Promise<{ hits: ScoreHit[], highest_score: number, hit_count: number }> {
    // 1. Exact Name Matches
    let exactHits = await matchExact(params.name, params.sources);

    // 2. Fuzzy Name Matches
    let fuzzyHits = await matchFuzzy(params.name, params.sources, params.min_score);

    // Merge results mapping uniqueness by ID
    const mergedMap = new Map<string, ScoreHit>();
    exactHits.forEach(h => mergedMap.set(h.entity_id, h));
    fuzzyHits.forEach(h => {
        if (!mergedMap.has(h.entity_id)) mergedMap.set(h.entity_id, h);
    });

    const finalHits = Array.from(mergedMap.values()).sort((a, b) => b.match_score - a.match_score);
    const highestScore = finalHits.length > 0 ? finalHits[0]!.match_score : 0;

    return {
        hits: finalHits,
        highest_score: highestScore,
        hit_count: finalHits.length,
    }
}
