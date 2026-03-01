import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// Enums de Domínio
// ─────────────────────────────────────────────────────────────────────────────

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN'
export type RiskLevelNoUnknown = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export enum ComplianceModule {
    PLD_FT = 'PLD_FT',
    LGPD = 'LGPD',
    ANTICORRUPCAO = 'ANTICORRUPCAO',
}

export type TenantPlan = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'CANCELLED'

export type UserRole = 'ADMIN' | 'COMPLIANCE_OFFICER' | 'ANALYST' | 'AUDITOR' | 'READONLY'
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

export type EntityType = 'CLIENTE' | 'FORNECEDOR' | 'PARCEIRO' | 'COLABORADOR'
export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED'
export type KycStatus = 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED'

export type ChecklistModule = 'PLD_FT' | 'LGPD' | 'ANTICORRUPCAO'
export type ChecklistStatus = 'DRAFT' | 'ACTIVE' | 'DEPRECATED'
export type AnswerType = 'BOOLEAN' | 'SCALE' | 'TEXT' | 'MULTIPLE_CHOICE'

export type ChecklistRunStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export type DocumentType =
    | 'POLITICA_PLD'
    | 'POLITICA_PRIVACIDADE'
    | 'RAT'
    | 'DPIA'
    | 'PROGRAMA_INTEGRIDADE'
    | 'CODIGO_CONDUTA'
    | 'RELATORIO_AUDITORIA'
    | 'RELATORIO_RISCO'
    | 'RELATORIO_RAS'
    | 'TERMO_CONSENTIMENTO'
export type DocumentStatus = 'GENERATING' | 'READY' | 'FAILED' | 'ARCHIVED'

export type AuditModule =
    | 'PLD_FT'
    | 'LGPD'
    | 'ANTICORRUPCAO'
    | 'DOCS'
    | 'ENTITIES'
    | 'USERS'
    | 'AUTH'
    | 'ADMIN'
    | 'SYSTEM'
export type AuditActorType = 'USER' | 'SYSTEM' | 'API'
export type AuditResult = 'SUCCESS' | 'FAILURE' | 'PARTIAL'

export type RiskTriggeredBy = 'CHECKLIST_RUN' | 'SANCTIONS_UPDATE' | 'MANUAL' | 'SCHEDULED'

export type NotificationType =
    | 'RISK_ESCALATED'
    | 'CHECKLIST_OVERDUE'
    | 'CHECKLIST_DUE_SOON'
    | 'DOCUMENT_READY'
    | 'DOCUMENT_EXPIRING'
    | 'KYC_REQUIRED'
    | 'SANCTIONS_HIT'
    | 'SYSTEM_ALERT'
export type NotificationSeverity = 'INFO' | 'WARNING' | 'CRITICAL'

// ─────────────────────────────────────────────────────────────────────────────
// Interfaces de Domínio
// ─────────────────────────────────────────────────────────────────────────────

export interface Tenant {
    id: string
    name: string
    cnpj: string
    plan: TenantPlan
    status: TenantStatus
    settings: TenantSettings
    billingEmail: string | null
    trialEndsAt: Date | null
    createdAt: Date
    updatedAt: Date
}

export interface TenantSettings {
    modules: ChecklistModule[]
    maxUsers: number
    ssoEnabled: boolean
    notificationEmail: string | null
    riskThresholds: {
        high: number
        critical: number
    }
}

export interface User {
    id: string
    tenantId: string
    email: string
    name: string
    role: UserRole
    status: UserStatus
    mfaEnabled: boolean
    mfaSecret: string | null
    mfaBackupCodes: string[] | null
    lastLoginAt: Date | null
    lastLoginIp: string | null
    failedAttempts: number
    lockedUntil: Date | null
    invitedBy: string | null
    inviteToken: string | null
    inviteExpires: Date | null
    createdAt: Date
    updatedAt: Date
}

export interface Entity {
    id: string
    tenantId: string
    name: string
    cnpj: string | null
    cpf: string | null
    entityType: EntityType
    sector: string | null
    corporateData: CorporateData
    riskScore: number | null
    riskLevel: RiskLevel
    lastAssessedAt: Date | null
    status: EntityStatus
    blockedReason: string | null
    kycStatus: KycStatus
    kycCompletedAt: Date | null
    isPep: boolean
    pepDetails: PepDetails | null
    createdBy: string
    createdAt: Date
    updatedAt: Date
}

export interface CorporateData {
    socios?: Array<{ nome: string; cpf: string; participacao: number }>
    beneficiarioFinal?: { nome: string; cpf: string }
    capitalSocial?: number
    dataAbertura?: string
}

export interface PepDetails {
    cargo: string
    orgao: string
    dataNomeacao: string
}

export interface ChecklistItem {
    id: string
    order: number
    question: string
    weight: number
    category: string
    regulationRef: string
    answerType: AnswerType
    options: string[] | null
    evidenceRequired: boolean
    helpText: string | null
}

export interface Checklist {
    id: string
    tenantId: string | null
    module: ChecklistModule
    regulationCode: string
    title: string
    description: string | null
    version: string
    status: ChecklistStatus
    items: ChecklistItem[]
    periodicityDays: number | null
    appliesTo: EntityType[]
    createdBy: string | null
    createdAt: Date
    updatedAt: Date
}

export interface ChecklistAnswer {
    itemId: string
    answer: boolean | number | string
    note: string | null
    evidenceKey: string | null
    answeredAt: string
}

export interface ChecklistRun {
    id: string
    tenantId: string
    checklistId: string
    entityId: string
    executedBy: string
    answers: ChecklistAnswer[]
    score: number | null
    riskLevel: RiskLevelNoUnknown | null
    status: ChecklistRunStatus
    startedAt: Date
    completedAt: Date | null
    summaryNotes: string | null
    evidenceKeys: string[]
    durationSecs: number | null
    createdAt: Date
    updatedAt: Date
}

export interface RiskFactors {
    pldFt?: { score: number; weight: number; checklistRunId?: string }
    lgpd?: { score: number; weight: number; checklistRunId?: string }
    anticorrupcao?: { score: number; weight: number; checklistRunId?: string }
    sanctions?: { clear: boolean; screenedAt: string }
    pep?: { isPep: boolean }
}

export interface RiskAssessment {
    id: string
    tenantId: string
    entityId: string
    score: number
    riskLevel: RiskLevelNoUnknown
    factors: RiskFactors
    previousLevel: RiskLevel | null
    levelChanged: boolean
    calculatedAt: Date
    expiresAt: Date
    triggeredBy: RiskTriggeredBy
    triggeredById: string | null
    createdAt: Date
}

export interface Document {
    id: string
    tenantId: string
    entityId: string | null
    docType: DocumentType
    title: string
    version: number
    s3Key: string
    s3Bucket: string
    fileSizeBytes: number | null
    contentHash: string
    status: DocumentStatus
    validUntil: Date | null
    generatedBy: string
    generationParams: Record<string, unknown>
    errorMessage: string | null
    createdAt: Date
    updatedAt: Date
}

export interface AuditEvent {
    eventId: string
    tenantId: string
    actorId: string
    actorType: AuditActorType
    actorIp: string | null
    actorUserAgent: string | null
    occurredAt: Date
    module: AuditModule
    action: string
    resourceType: string | null
    resourceId: string | null
    result: AuditResult
    errorCode: string | null
    payloadHash: string
    prevHash: string | null
    metadata: Record<string, unknown>
}

export interface Notification {
    id: string
    tenantId: string
    userId: string | null
    type: NotificationType
    severity: NotificationSeverity
    title: string
    body: string
    relatedEntityType: string | null
    relatedEntityId: string | null
    actionUrl: string | null
    readAt: Date | null
    dismissedAt: Date | null
    dueAt: Date | null
    emailSentAt: Date | null
    createdAt: Date
}

// ─────────────────────────────────────────────────────────────────────────────
// JWT Payload
// ─────────────────────────────────────────────────────────────────────────────

export interface JwtPayload {
    sub: string          // userId
    tenantId: string
    role: UserRole
    plan: TenantPlan
    modules: ChecklistModule[]
    iat: number
    exp: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Tipos de API
// ─────────────────────────────────────────────────────────────────────────────

export interface PaginationMeta {
    total: number
    limit: number
    hasMore: boolean
    nextCursor: string | null
    prevCursor?: string | null
}

export interface ApiResponse<TData> {
    data: TData
    meta?: Record<string, unknown>
}

export interface PaginatedResponse<TData> {
    data: TData[]
    meta: PaginationMeta
}

// ─────────────────────────────────────────────────────────────────────────────
// Constantes de Domínio
// ─────────────────────────────────────────────────────────────────────────────

export const MAX_RISK_SCORE = 100
export const MIN_RISK_SCORE = 0
export const AUDIT_RETENTION_YEARS = 5
export const PLD_SCREENING_TIMEOUT_MS = 5000
export const INVITE_EXPIRY_HOURS = 48
export const DOCUMENT_PRESIGNED_URL_EXPIRY_SECONDS = 900

// Pesos padrão do scoring composto
export const DEFAULT_RISK_WEIGHTS = {
    pldFt: 0.4,
    lgpd: 0.3,
    anticorrupcao: 0.3,
} as const

// Thresholds padrão de risco (sobrescritos por tenant.settings.riskThresholds)
export const DEFAULT_RISK_THRESHOLDS = {
    high: 60,
    critical: 30,
} as const

// Mapeamento de score para nível de risco
export function scoreToRiskLevel(
    score: number,
    thresholds = DEFAULT_RISK_THRESHOLDS,
): RiskLevelNoUnknown {
    if (score <= thresholds.critical) return 'CRITICAL'
    if (score <= thresholds.high) return 'HIGH'
    if (score <= 80) return 'MEDIUM'
    return 'LOW'
}

// ─────────────────────────────────────────────────────────────────────────────
// Zod Schemas utilitários
// ─────────────────────────────────────────────────────────────────────────────

export const uuidSchema = z.string().uuid()
export const cnpjSchema = z.string().length(14).regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos numéricos')
export const cpfSchema = z.string().length(11).regex(/^\d{11}$/, 'CPF deve ter 11 dígitos numéricos')
export const paginationSchema = z.object({
    cursor: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    sort: z.string().optional(),
})
