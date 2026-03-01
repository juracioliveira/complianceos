import { WebhooksRepository } from '../repositories/webhooks.repository.js'
import crypto from 'node:crypto'

export class WebhooksService {
    constructor(private webhooksRepository: WebhooksRepository) { }

    async registerWebhook(tenantId: string, data: { url: string; description?: string; events?: string[] }) {
        const secret = crypto.randomBytes(32).toString('hex')
        return this.webhooksRepository.create({
            tenantId,
            url: data.url,
            secret,
            description: data.description,
            events: data.events || ['*'],
            status: 'ACTIVE'
        })
    }

    async notify(tenantId: string, event: string, payload: any) {
        const webhooks = await this.webhooksRepository.findActiveByTenant(tenantId)

        const notifications = webhooks
            .filter(w => {
                const events = w.events as string[]
                return events.includes('*') || events.includes(event)
            })
            .map(async (w) => {
                const body = JSON.stringify({
                    id: crypto.randomUUID(),
                    event,
                    timestamp: new Date().toISOString(),
                    tenantId,
                    data: payload
                })

                const signature = crypto
                    .createHmac('sha256', w.secret)
                    .update(body)
                    .digest('hex')

                try {
                    const response = await fetch(w.url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-ComplianceOS-Signature': signature,
                            'X-ComplianceOS-Event': event
                        },
                        body
                    })

                    if (!response.ok) {
                        console.error(`Webhook delivery failed: ${w.url}, status: ${response.status}`)
                    }
                } catch (error) {
                    console.error(`Error delivering webhook to ${w.url}:`, error)
                }
            })

        await Promise.allSettled(notifications)
    }

    async listWebhooks(tenantId: string) {
        return this.webhooksRepository.findActiveByTenant(tenantId)
    }

    async deleteWebhook(id: string, tenantId: string) {
        return this.webhooksRepository.delete(id, tenantId)
    }
}
