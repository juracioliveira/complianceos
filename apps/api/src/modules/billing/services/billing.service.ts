import { BillingRepository } from '../repositories/billing.repository.js'

export class BillingService {
    constructor(private billingRepository: BillingRepository) {}

    async createPixCharge(tenantId: string, amount: number) {
        // Mock de integração com Asaas/Stripe BR
        return {
            chargeId: `ch_${Math.random().toString(36).substring(7)}`,
            pixCode: '00020126580014br.gov.bcb.pix01366b446554-3453-4534-4534-453453453453520400005303986540510.005802BR5913COMPLIANCEOS6009SAO PAULO62070503***6304ABCD',
            qrCodeUrl: 'https://complianceos.com.br/qr-mock',
            amount,
            status: 'PENDING'
        }
    }

    async handleWebhook(payload: any) {
        // Lógica de confirmação de pagamento
        // No Asaas seria 'PAYMENT_RECEIVED' ou 'PAYMENT_CONFIRMED'
        if (payload.event === 'PAYMENT_CONFIRMED') {
            const tenantId = payload.payment.externalReference
            await this.billingRepository.updateSubscriptionStatus(tenantId, 'ACTIVE')
            return { status: 'OK' }
        }
        return { status: 'IGNORED' }
    }

    async getSubscription(tenantId: string) {
        return this.billingRepository.getTenantSubscription(tenantId)
    }
}
