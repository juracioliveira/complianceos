import { pgTable, uuid, varchar, timestamp, integer, boolean, jsonb, text, pgEnum, smallint } from 'drizzle-orm/pg-core'

export const entityTypeEnum = pgEnum('entity_type', ['CLIENTE', 'FORNECEDOR', 'PARCEIRO', 'COLABORADOR'])
export const riskLevelEnum = pgEnum('risk_level', ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'UNKNOWN'])
export const kycStatusEnum = pgEnum('kyc_status', ['PENDING', 'APPROVED', 'REJECTED', 'IN_REVIEW'])
export const statusEnum = pgEnum('status', ['ACTIVE', 'INACTIVE', 'BLOCKED'])
export const docStatusEnum = pgEnum('doc_status', ['GENERATING', 'READY', 'FAILED', 'ARCHIVED'])

export const tenants = pgTable('tenants', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    plan: varchar('plan', { length: 30 }).notNull().default('FREE'),
    settings: jsonb('settings').notNull().default({}),
    status: varchar('status', { length: 20 }).notNull().default('ACTIVE'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
})

export const documents = pgTable('documents', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
    entityId: uuid('entity_id').references(() => entities.id),
    docType: varchar('doc_type', { length: 50 }).notNull(),
    title: varchar('title', { length: 300 }).notNull(),
    version: integer('version').notNull().default(1),
    s3Key: varchar('s3_key', { length: 500 }).notNull(),
    s3Bucket: varchar('s3_bucket', { length: 100 }).notNull(),
    fileSizeBytes: integer('file_size_bytes'),
    contentHash: varchar('content_hash', { length: 64 }).notNull(),
    status: docStatusEnum('status').notNull().default('GENERATING'),
    validUntil: timestamp('valid_until'),
    generatedBy: uuid('generated_by').notNull().references(() => users.id),
    generationParams: jsonb('generation_params').notNull().default({}),
    errorMessage: varchar('error_message'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
})

export const entities = pgTable('entities', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
    name: varchar('name', { length: 200 }).notNull(),
    cnpj: varchar('cnpj', { length: 14 }),
    cpf: varchar('cpf', { length: 11 }),
    entityType: varchar('entity_type', { length: 20 }).notNull(), // CLIENTE, FORNECEDOR, PARCEIRO, COLABORADOR
    sector: varchar('sector', { length: 100 }),
    corporateData: jsonb('corporate_data').notNull().default({}),
    riskScore: integer('risk_score'),
    riskLevel: riskLevelEnum('risk_level').notNull().default('UNKNOWN'),
    lastAssessedAt: timestamp('last_assessed_at'),
    status: statusEnum('status').notNull().default('ACTIVE'),
    blockedReason: varchar('blocked_reason'),
    kycStatus: varchar('kyc_status', { length: 20 }).notNull().default('PENDING'), // PENDING, IN_PROGRESS, APPROVED, REJECTED
    kycCompletedAt: timestamp('kyc_completed_at'),
    isPep: boolean('is_pep').notNull().default(false),
    pepDetails: jsonb('pep_details'),
    lastRiskUpdateBy: uuid('last_risk_update_by').references(() => users.id),
    lastRiskApprovalBy: uuid('last_risk_approval_by').references(() => users.id),
    createdBy: uuid('created_by').notNull().references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
})

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
    email: varchar('email', { length: 200 }).notNull(),
    name: varchar('name', { length: 200 }).notNull(),
    passwordHash: varchar('password_hash').notNull().default(''),
    role: varchar('role', { length: 30 }).notNull(), // Perfil principal (ex: ADMIN, AUDITOR, ANALYST)
    permissions: jsonb('permissions').notNull().default([]), // Permissões granulares adicionais
    status: varchar('status', { length: 20 }).notNull().default('ACTIVE'),
    mfaEnabled: boolean('mfa_enabled').notNull().default(false),
    mfaSecret: varchar('mfa_secret'),
    mfaBackupCodes: jsonb('mfa_backup_codes'),
    lastLoginAt: timestamp('last_login_at'),
    lastLoginIp: varchar('last_login_ip'),
    failedAttempts: integer('failed_attempts').notNull().default(0),
    lockedUntil: timestamp('locked_until'),
    invitedBy: uuid('invited_by').references((): any => users.id),
    inviteToken: varchar('invite_token'),
    inviteExpires: timestamp('invite_expires'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
})

export const checklists = pgTable('checklists', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').references(() => tenants.id), // null = system template
    module: varchar('module', { length: 20 }).notNull(), // PLD_FT, LGPD, ANTICORRUPCAO
    regulationCode: varchar('regulation_code', { length: 50 }).notNull().default(''),
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description'),
    version: varchar('version', { length: 10 }).notNull().default('1.0'),
    status: varchar('status', { length: 20 }).notNull().default('ACTIVE'), // DRAFT, ACTIVE, DEPRECATED
    items: jsonb('items').notNull().default([]),
    periodicityDays: smallint('periodicity_days'),
    appliesTo: jsonb('applies_to').notNull().default([]),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
})

export const checklistRuns = pgTable('checklist_runs', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
    checklistId: uuid('checklist_id').notNull().references(() => checklists.id),
    entityId: uuid('entity_id').notNull().references(() => entities.id),
    executedBy: uuid('executed_by').notNull().references(() => users.id),
    answers: jsonb('answers').notNull().default([]),
    score: smallint('score'),
    riskLevel: varchar('risk_level', { length: 20 }), // LOW, MEDIUM, HIGH, CRITICAL
    status: varchar('status', { length: 20 }).notNull().default('IN_PROGRESS'), // IN_PROGRESS, COMPLETED, CANCELLED
    startedAt: timestamp('started_at').defaultNow(),
    completedAt: timestamp('completed_at'),
    summaryNotes: text('summary_notes'),
    evidenceKeys: jsonb('evidence_keys').notNull().default([]),
    durationSecs: integer('duration_secs'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
})

export const webhooks = pgTable('webhooks', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
    url: varchar('url', { length: 500 }).notNull(),
    secret: varchar('secret', { length: 255 }).notNull(),
    description: varchar('description', { length: 200 }),
    status: varchar('status', { length: 20 }).notNull().default('ACTIVE'),
    events: jsonb('events').notNull().default(['*']),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
})

export const notifications = pgTable('notifications', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
    userId: uuid('user_id').references(() => users.id),
    type: varchar('type', { length: 50 }).notNull(),
    severity: varchar('severity', { length: 10 }).notNull(),
    title: varchar('title', { length: 200 }).notNull(),
    body: varchar('body').notNull(),
    relatedEntityType: varchar('related_entity_type', { length: 50 }),
    relatedEntityId: uuid('related_entity_id'),
    actionUrl: varchar('action_url', { length: 500 }),
    readAt: timestamp('read_at'),
    dismissedAt: timestamp('dismissed_at'),
    dueAt: timestamp('due_at'),
    emailSentAt: timestamp('email_sent_at'),
    createdAt: timestamp('created_at').defaultNow()
})

export const auditEvents = pgTable('audit_events', {
    eventId: uuid('event_id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    actorId: uuid('actor_id').notNull(),
    actorType: varchar('actor_type', { length: 20 }).notNull().default('USER'),
    actorIp: varchar('actor_ip'), // INET is simplified to varchar in Drizzle if not using custom type
    actorUserAgent: varchar('actor_user_agent'),
    occurredAt: timestamp('occurred_at').notNull().defaultNow(),
    module: varchar('module', { length: 30 }).notNull(),
    action: varchar('action', { length: 100 }).notNull(),
    resourceType: varchar('resource_type', { length: 50 }),
    resourceId: uuid('resource_id'),
    result: varchar('result', { length: 10 }).notNull(),
    errorCode: varchar('error_code', { length: 50 }),
    payloadHash: varchar('payload_hash', { length: 64 }).notNull(),
    prevHash: varchar('prev_hash', { length: 64 }),
    metadata: jsonb('metadata').notNull().default({})
})

// ─── Alert Cases (P0 — Case Management) ──────────────────────────────────────

export const alertSourceEnum = pgEnum('alert_source', [
    'SANCTIONS_MATCH', 'PEP_MATCH', 'CHECKLIST_OVERDUE', 'HIGH_RISK_ENTITY', 'MANUAL'
])

export const alertSeverityEnum = pgEnum('alert_severity', [
    'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
])

export const alertCaseStatusEnum = pgEnum('alert_case_status', [
    'OPEN', 'UNDER_REVIEW', 'ESCALATED', 'CLOSED_FALSE_POSITIVE', 'CLOSED_CONFIRMED'
])

export const alertCases = pgTable('alert_cases', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
    entityId: uuid('entity_id').references(() => entities.id),

    source: alertSourceEnum('source').notNull(),
    severity: alertSeverityEnum('severity').notNull().default('MEDIUM'),
    status: alertCaseStatusEnum('status').notNull().default('OPEN'),

    title: varchar('title', { length: 300 }).notNull(),
    description: text('description').notNull().default(''),
    evidence: jsonb('evidence').notNull().default({}),

    assignedTo: uuid('assigned_to').references(() => users.id),
    resolvedBy: uuid('resolved_by').references(() => users.id),
    resolvedAt: timestamp('resolved_at'),
    resolutionNote: text('resolution_note'),

    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
})
