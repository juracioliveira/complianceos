import { AlertCasesRepository, type AlertCaseFilters } from '../repositories/alert-cases.repository.js'
import { AuditService } from '../../audit/services/audit.service.js'
import { NotificationsService } from '../../notifications/services/notifications.service.js'
import { NotFoundError, ForbiddenError } from '@compliance-os/types'

const TERMINAL_STATUSES = new Set(['CLOSED_FALSE_POSITIVE', 'CLOSED_CONFIRMED'])
const VALID_TRANSITIONS: Record<string, string[]> = {
    'OPEN': ['UNDER_REVIEW', 'ESCALATED', 'CLOSED_FALSE_POSITIVE', 'CLOSED_CONFIRMED'],
    'UNDER_REVIEW': ['ESCALATED', 'CLOSED_FALSE_POSITIVE', 'CLOSED_CONFIRMED'],
    'ESCALATED': ['UNDER_REVIEW', 'CLOSED_FALSE_POSITIVE', 'CLOSED_CONFIRMED'],
    'CLOSED_FALSE_POSITIVE': [],
    'CLOSED_CONFIRMED': [],
}

export class AlertCasesService {
    constructor(
        private readonly repo: AlertCasesRepository,
        private readonly auditService: AuditService,
        private readonly notificationsService: NotificationsService,
    ) { }

    async listCases(tenantId: string, filters: AlertCaseFilters) {
        return this.repo.list(tenantId, filters)
    }

    async getCase(id: string, tenantId: string) {
        const record = await this.repo.findById(id, tenantId)
        if (!record) throw new NotFoundError(`Caso de alerta não encontrado: ${id}`)
        return record
    }

    async createCase(tenantId: string, userId: string, data: {
        entityId?: string | undefined
        source: string
        severity: string
        title: string
        description: string
        evidence?: Record<string, any> | undefined
    }) {
        const alertCase = await this.repo.create({
            tenantId,
            entityId: data.entityId,
            source: data.source,
            severity: data.severity,
            title: data.title,
            description: data.description,
            evidence: data.evidence ?? {},
            createdBy: userId,
        })

        await this.auditService.logEvent({
            tenantId,
            actorId: userId,
            module: 'ALERT_CASES',
            action: 'CREATE_ALERT_CASE',
            resourceType: 'ALERT_CASE',
            resourceId: alertCase.id,
            result: 'SUCCESS',
            metadata: { source: data.source, severity: data.severity, title: data.title },
        })

        // P1-B: Notificação interna para alertas CRITICAL e HIGH
        await this.notificationsService.notifyAlertCase({
            tenantId,
            alertCaseId: alertCase.id,
            title: data.title,
            severity: data.severity as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
            source: data.source,
            entityId: data.entityId,
            event: 'CREATED',
        })

        return alertCase
    }

    async updateCaseStatus(
        id: string,
        tenantId: string,
        userId: string,
        newStatus: string,
        resolutionNote?: string,
    ) {
        const existing = await this.repo.findById(id, tenantId)
        if (!existing) throw new NotFoundError(`Caso de alerta não encontrado: ${id}`)

        const allowed = VALID_TRANSITIONS[existing.status] ?? []
        if (!allowed.includes(newStatus)) {
            throw new ForbiddenError(
                `Transição inválida: ${existing.status} → ${newStatus}. Permitido: ${allowed.join(', ') || 'nenhum'}`
            )
        }

        const isClosing = TERMINAL_STATUSES.has(newStatus)
        if (isClosing && !resolutionNote?.trim()) {
            throw new ForbiddenError('Nota de resolução obrigatória ao fechar um caso.')
        }

        const updated = await this.repo.update(id, tenantId, {
            status: newStatus,
            ...(isClosing ? {
                resolvedBy: userId,
                resolvedAt: new Date(),
                resolutionNote: resolutionNote!,
            } : {}),
        })

        await this.auditService.logEvent({
            tenantId,
            actorId: userId,
            module: 'ALERT_CASES',
            action: 'UPDATE_ALERT_CASE_STATUS',
            resourceType: 'ALERT_CASE',
            resourceId: id,
            result: 'SUCCESS',
            metadata: { previousStatus: existing.status, newStatus, resolutionNote },
        })

        // P1-B: Notificação ao escalar
        if (newStatus === 'ESCALATED') {
            await this.notificationsService.notifyAlertCase({
                tenantId,
                alertCaseId: id,
                title: existing.title,
                severity: existing.severity as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
                source: existing.source,
                entityId: existing.entity_id ?? undefined,
                event: 'ESCALATED',
            })
        }

        return updated
    }

    async assignCase(id: string, tenantId: string, userId: string, assigneeId: string | null) {
        const existing = await this.repo.findById(id, tenantId)
        if (!existing) throw new NotFoundError(`Caso de alerta não encontrado: ${id}`)

        const updated = await this.repo.update(id, tenantId, { assignedTo: assigneeId })

        await this.auditService.logEvent({
            tenantId,
            actorId: userId,
            module: 'ALERT_CASES',
            action: 'ASSIGN_ALERT_CASE',
            resourceType: 'ALERT_CASE',
            resourceId: id,
            result: 'SUCCESS',
            metadata: { assignedTo: assigneeId },
        })

        return updated
    }

    async countOpen(tenantId: string) {
        return this.repo.countOpen(tenantId)
    }
}
