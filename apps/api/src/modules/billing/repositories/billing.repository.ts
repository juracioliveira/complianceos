import { db } from '../../../infra/db/db.js'
import { tenants } from '../../../infra/db/schema.js'
import { eq } from 'drizzle-orm'

export class BillingRepository {
    async getTenantSubscription(tenantId: string) {
        // No esquema atual, tenants não tem campos de billing.
        // Simulando retorno. No futuro adicionar colunas no schema.ts
        return {
            id: tenantId,
            status: 'ACTIVE',
            plan: 'ENTERPRISE',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
    }

    async updateSubscriptionStatus(tenantId: string, status: string) {
        return true
    }
}
