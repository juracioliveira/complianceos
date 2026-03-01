import { pgTable, text, timestamp, uuid, jsonb, boolean, integer, index, date, bigserial } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const sanctionsEntities = pgTable('sanctions_entities', {
    id: uuid('id').primaryKey().defaultRandom(),
    source: text('source').notNull(),
    sourceId: text('source_id').notNull(),
    entityType: text('entity_type').notNull(),
    namePrimary: text('name_primary').notNull(),
    namesAliases: text('names_aliases').array().default(sql`'{}'`),
    nameNormalized: text('name_normalized').notNull(),
    dob: date('dob'),
    dobRaw: text('dob_raw'),
    nationalities: text('nationalities').array().default(sql`'{}'`),
    idDocuments: jsonb('id_documents').default('[]'),
    addresses: jsonb('addresses').default('[]'),
    programs: text('programs').array().default(sql`'{}'`),
    sanctionsType: text('sanctions_type'),
    remarks: text('remarks'),
    listedAt: date('listed_at'),
    delistedAt: date('delisted_at'),
    isActive: boolean('is_active').notNull().default(true),
    lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }).notNull().defaultNow(),
    rawData: jsonb('raw_data'),
}, (table) => {
    return {
        uniqueSourceId: index('idx_sanctions_unique_source_id').on(table.source, table.sourceId), // Handled by UNIQUE constraint usually, but we define an index just in case or add constraint later
        ftsNameIdx: index('idx_sanctions_name_fts').on(table.namePrimary),
        trgmNameIdx: index('idx_sanctions_name_trgm').on(table.nameNormalized),
        sourceActiveIdx: index('idx_sanctions_source').on(table.source, table.isActive),
        activeEntityIdx: index('idx_sanctions_active').on(table.isActive, table.entityType),
        syncedIdx: index('idx_sanctions_synced').on(table.lastSyncedAt),
    };
});

export const screeningResults = pgTable('screening_results', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    queriedBy: uuid('queried_by').notNull(),
    queryName: text('query_name').notNull(),
    queryDocument: text('query_document'),
    queryType: text('query_type').notNull(),
    hits: jsonb('hits').notNull().default('[]'),
    hitCount: integer('hit_count').notNull().default(0),
    highestScore: integer('highest_score').notNull().default(0),
    riskLevel: text('risk_level').notNull(),
    screenedAt: timestamp('screened_at', { withTimezone: true }).notNull().defaultNow(),
    sourcesChecked: text('sources_checked').array().notNull(),
    latencyMs: integer('latency_ms'),
}, (table) => {
    return {
        tenantIdx: index('idx_screening_tenant').on(table.tenantId, table.screenedAt),
        riskIdx: index('idx_screening_risk').on(table.riskLevel, table.screenedAt),
    };
});

export const sanctionsSyncLog = pgTable('sanctions_sync_log', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    source: text('source').notNull(),
    status: text('status').notNull(),
    iniciadoEm: timestamp('iniciado_em', { withTimezone: true }).defaultNow(),
    concluidoEm: timestamp('concluido_em', { withTimezone: true }),
    entitiesBefore: integer('entities_before'),
    entitiesAfter: integer('entities_after'),
    entitiesAdded: integer('entities_added'),
    entitiesRemoved: integer('entities_removed'),
    etag: text('etag'),
    erroMsg: text('erro_msg'),
});
