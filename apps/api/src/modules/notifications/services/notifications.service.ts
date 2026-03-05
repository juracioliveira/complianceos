import { NotificationsRepository } from '../repositories/notifications.repository.js'
import { WebhooksService } from './webhooks.service.js'
import { NotFoundError } from '@compliance-os/types'

export class NotificationsService {
    constructor(
        private notificationsRepository: NotificationsRepository,
        private webhooksService: WebhooksService
    ) { }

    async listNotifications(tenantId: string, userId: string, filters: { unreadOnly?: boolean; limit?: number }) {
        return this.notificationsRepository.list(tenantId, userId, filters)
    }

    async readNotification(id: string, userId: string, tenantId: string) {
        return this.notificationsRepository.markAsRead(id, userId, tenantId)
    }

    async readAllNotifications(userId: string, tenantId: string) {
        return this.notificationsRepository.markAllAsRead(userId, tenantId)
    }

    // Notificação genérica de evento (webhooks externos)
    async notifyEvent(tenantId: string, event: string, payload: any) {
        await this.webhooksService.notify(tenantId, event, payload)
    }

    // P1-B: Notificação interna quando alert_case critico é criado ou escalado
    async notifyAlertCase(params: {
        tenantId: string
        alertCaseId: string
        title: string
        severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
        source: string
        entityId?: string | undefined
        event: 'CREATED' | 'ESCALATED'
    }) {
        const { tenantId, alertCaseId, title, severity, source, entityId, event } = params

        // Só notifica CRITICAL e HIGH de sanções/PEP criados ou escalados
        if (severity === 'LOW' || (severity === 'MEDIUM' && event !== 'ESCALATED')) return

        const notifSeverity: 'INFO' | 'WARNING' | 'CRITICAL' =
            severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING'

        const typeMap: Record<string, string> = {
            SANCTIONS_MATCH: 'SANCTIONS_HIT',
            PEP_MATCH: 'SANCTIONS_HIT',
            HIGH_RISK_ENTITY: 'RISK_ESCALATED',
            CHECKLIST_OVERDUE: 'CHECKLIST_OVERDUE',
            MANUAL: 'SYSTEM_ALERT',
        }
        const notifType = typeMap[source] ?? 'SYSTEM_ALERT'

        const bodyMap = {
            CREATED: `Novo alerta criado e aguardando investigação: "${title}"`,
            ESCALATED: `Alerta escalado para revisão urgente: "${title}"`,
        }

        try {
            // Notificação interna (para todos do tenant — user_id null)
            await this.notificationsRepository.create({
                tenantId,
                type: notifType,
                severity: notifSeverity,
                title: event === 'CREATED' ? `🚨 Novo Alerta: ${title}` : `⬆️ Alerta Escalado: ${title}`,
                body: bodyMap[event],
                relatedEntityType: 'ALERT_CASE',
                relatedEntityId: alertCaseId,
                actionUrl: `/alerts/${alertCaseId}`,
                ...(entityId ? {} : {}),
            })

            // Webhook externo
            await this.webhooksService.notify(tenantId, `alert.${event.toLowerCase()}`, {
                alertCaseId,
                title,
                severity,
                source,
                entityId,
                event,
                actionUrl: `/alerts/${alertCaseId}`,
            })
        } catch (err) {
            console.error('[NotificationsService] Erro ao notificar alert case:', err)
            // Não propaga — notificação é não-crítica
        }
    }
}
