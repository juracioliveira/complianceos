import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// Hierarquia de Erros — conforme DEV-03 §9.1
// ─────────────────────────────────────────────────────────────────────────────

export class ComplianceOSError extends Error {
    constructor(
        public readonly code: string,
        message: string,
        public readonly statusCode: number,
        public readonly details?: unknown,
    ) {
        super(message)
        this.name = this.constructor.name
        // Preserva o stack trace no V8
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export class ValidationError extends ComplianceOSError {
    constructor(message: string, details?: z.ZodError) {
        super('VALIDATION_ERROR', message, 400, details?.flatten())
    }
}

export class UnauthorizedError extends ComplianceOSError {
    constructor(message = 'Não autorizado') {
        super('UNAUTHORIZED', message, 401)
    }
}

export class MfaRequiredError extends ComplianceOSError {
    constructor() {
        super('MFA_REQUIRED', 'Configure e forneça o código MFA para continuar', 401)
    }
}

export class ForbiddenError extends ComplianceOSError {
    constructor(message = 'Acesso negado') {
        super('FORBIDDEN', message, 403)
    }
}

export class ModuleNotEnabledError extends ComplianceOSError {
    constructor(moduleName: string) {
        super('MODULE_NOT_ENABLED', `Módulo ${moduleName} não está habilitado neste plano`, 403)
    }
}

export class NotFoundError extends ComplianceOSError {
    constructor(resource: string) {
        super('NOT_FOUND', `${resource} não encontrado`, 404)
    }
}

export class ConflictError extends ComplianceOSError {
    constructor(message: string) {
        super('CONFLICT', message, 409)
    }
}

export class BusinessRuleViolationError extends ComplianceOSError {
    constructor(message: string) {
        super('BUSINESS_RULE_VIOLATION', message, 422)
    }
}

export class RateLimitError extends ComplianceOSError {
    constructor(retryAfterSeconds?: number) {
        super('RATE_LIMIT_EXCEEDED', 'Limite de requisições atingido', 429, { retryAfterSeconds })
    }
}

export class InternalError extends ComplianceOSError {
    constructor(message = 'Erro interno do servidor') {
        super('INTERNAL_ERROR', message, 500)
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Formato RFC 7807 — Problem Details
// ─────────────────────────────────────────────────────────────────────────────

export interface ProblemDetails {
    type: string
    title: string
    status: number
    detail: string
    instance: string
    requestId: string
    timestamp: string
    errors?: Array<{ field: string; code: string; message: string }>
}

export function toProblemDetails(
    error: ComplianceOSError,
    instance: string,
    requestId: string,
): ProblemDetails {
    const problem: ProblemDetails = {
        type: `https://complianceos.com.br/errors/${error.code}`,
        title: errorTitle(error.code),
        status: error.statusCode,
        detail: error.message,
        instance,
        requestId,
        timestamp: new Date().toISOString(),
    }

    const fieldErrors = (error.details as any)?.fieldErrors
    if (Array.isArray(fieldErrors)) {
        problem.errors = fieldErrors
    }

    return problem
}

function errorTitle(code: string): string {
    const titles: Record<string, string> = {
        VALIDATION_ERROR: 'Erro de validação',
        UNAUTHORIZED: 'Não autorizado',
        MFA_REQUIRED: 'MFA obrigatório',
        FORBIDDEN: 'Acesso negado',
        MODULE_NOT_ENABLED: 'Módulo não habilitado',
        NOT_FOUND: 'Recurso não encontrado',
        CONFLICT: 'Conflito de dados',
        BUSINESS_RULE_VIOLATION: 'Violação de regra de negócio',
        RATE_LIMIT_EXCEEDED: 'Limite de requisições excedido',
        INTERNAL_ERROR: 'Erro interno',
    }
    return titles[code] ?? 'Erro desconhecido'
}
