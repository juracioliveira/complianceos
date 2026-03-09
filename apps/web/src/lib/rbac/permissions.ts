export type UserRole = 'ADMIN' | 'COMPLIANCE_OFFICER' | 'ANALYST' | 'AUDITOR' | 'READONLY'

export type Action =
    | 'view'
    | 'create'
    | 'edit'
    | 'complete'
    | 'delete'
    | 'close'
    | 'escalate'
    | 'export'
    | 'download'
    | 'force_recalculate'
    | 'manage_users'
    | 'manage_settings'
    | 'view_audit'

export type Resource =
    | 'dashboard'
    | 'entities'
    | 'checklist_templates'
    | 'checklist_runs'
    | 'risk_assessments'
    | 'documents'
    | 'alert_cases'
    | 'audit_trail'
    | 'users'
    | 'webhooks'
    | 'settings'

export const ROLE_LABELS: Record<UserRole, string> = {
    ADMIN: 'Administrador (CCO)',
    COMPLIANCE_OFFICER: 'Compliance Officer (MLRO)',
    ANALYST: 'Analista de Compliance',
    AUDITOR: 'Auditor Interno/Externo',
    READONLY: 'Visualização (Stakeholder)',
}

export const PERMISSIONS: Record<UserRole, Partial<Record<Resource, Action[]>>> = {
    ADMIN: {
        dashboard: ['view'],
        entities: ['view', 'create', 'edit', 'delete'],
        checklist_templates: ['view', 'create', 'edit'],
        checklist_runs: ['view', 'create', 'edit', 'complete'],
        risk_assessments: ['view', 'force_recalculate'],
        documents: ['view', 'create', 'download', 'delete'],
        alert_cases: ['view', 'create', 'edit', 'escalate', 'close', 'export'],
        audit_trail: ['view', 'export'],
        users: ['view', 'create', 'edit'],
        webhooks: ['view', 'create', 'edit', 'delete'],
        settings: ['view', 'edit'],
    },
    COMPLIANCE_OFFICER: {
        dashboard: ['view'],
        entities: ['view', 'create', 'edit'],
        checklist_templates: ['view'],
        checklist_runs: ['view', 'create', 'edit', 'complete'],
        risk_assessments: ['view', 'force_recalculate'],
        documents: ['view', 'create', 'download'],
        alert_cases: ['view', 'create', 'edit', 'escalate', 'close', 'export'],
        audit_trail: ['view', 'export'],
    },
    ANALYST: {
        dashboard: ['view'],
        entities: ['view', 'create'],
        checklist_templates: ['view'],
        checklist_runs: ['view', 'create', 'edit'],
        risk_assessments: ['view'],
        documents: ['view'],
        alert_cases: ['view', 'create', 'edit'],
    },
    AUDITOR: {
        dashboard: ['view'],
        entities: ['view'],
        checklist_templates: ['view'],
        checklist_runs: ['view'],
        risk_assessments: ['view'],
        documents: ['view', 'download'],
        alert_cases: ['view'],
        audit_trail: ['view', 'export'],
    },
    READONLY: {
        dashboard: ['view'],
        entities: ['view'],
    },
}
