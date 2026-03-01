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

    // Método para disparar notificações internas e externas (Webhooks)
    async notifyEvent(tenantId: string, event: string, payload: any) {
        // 1. Disparar Webhooks
        await this.webhooksService.notify(tenantId, event, payload)

        // 2. Criar notificação interna se necessário (opcional baseado no tipo de evento)
        // WIP: Adicionar lógica para injetar via NotificationsRepository
    }
}
