import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db } from '../db/index.js';
import { screeningResults } from '../db/schema.js';
import { performScreening, scoreDocumentAndMerge } from '../matcher/score.js';
import { maskName, maskDocument, normalizeName } from '../utils/nameNormalizer.js';
import { requireAdminAuth } from '../middleware/auth.js'; // Requires auth.ts middleware

const screenSchema = z.object({
    name: z.string().min(2),
    document: z.string().optional(),
    document_type: z.string().optional(),
    entity_type: z.enum(['individual', 'entity']).optional(),
    sources: z.array(z.string()).min(1),
    min_score: z.number().min(0).max(100).default(70),
    tenant_id: z.string().uuid(),
    user_id: z.string().uuid(),
});

export const screeningRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post('/', async (request, reply) => {
        const start = Date.now();
        const parsed = screenSchema.safeParse(request.body);

        if (!parsed.success) {
            return reply.status(422).send({ error: 'Validation Error', issues: parsed.error.issues });
        }

        const input = parsed.data;

        try {
            // 1. Core Screening
            const rawRes = await performScreening({
                name: input.name,
                document: input.document,
                entity_type: input.entity_type,
                sources: input.sources,
                min_score: input.min_score,
            });

            // 2. Score Document Post-Processing Boost
            const hits = await scoreDocumentAndMerge(rawRes.hits, input.document);

            const highestScore = hits.length > 0 ? Math.max(...hits.map(h => h.match_score)) : 0;

            let riskLevel = 'clear';
            if (highestScore >= Number(process.env.SCREENING_CONFIRMED_THRESHOLD || 80)) {
                riskLevel = 'confirmed';
            } else if (highestScore > 0 && highestScore >= input.min_score) {
                riskLevel = 'potential';
            }

            const latencyMs = Date.now() - start;

            // 3. Immutability logs (Auditing)
            const screeningId = await db.insert(screeningResults).values({
                tenantId: input.tenant_id,
                queriedBy: input.user_id,
                queryName: maskName(input.name),
                queryDocument: input.document ? maskDocument(input.document) : null,
                queryType: input.entity_type || 'individual',
                hits: hits,
                hitCount: hits.length,
                highestScore,
                riskLevel,
                sourcesChecked: input.sources,
                latencyMs,
            }).returning({ id: screeningResults.id });

            return {
                query: {
                    name: input.name,
                    name_normalized: normalizeName(input.name),
                    entity_type: input.entity_type || 'individual'
                },
                risk_level: riskLevel,
                highest_score: highestScore,
                hit_count: hits.length,
                hits: hits,
                sources_checked: input.sources,
                latency_ms: latencyMs,
                screened_at: new Date().toISOString(),
                screening_id: screeningId[0]!.id,
            };

        } catch (e) {
            request.log.error(e);
            return reply.status(500).send({ error: 'Internal Server Error during Screening' });
        }
    });
};
