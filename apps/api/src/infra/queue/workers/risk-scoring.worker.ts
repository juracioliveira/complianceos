import { Worker, Job } from 'bullmq'
import { redis } from '../../redis.js'
import { ScoringEngine } from '@compliance-os/scoring-engine'
import { EntitiesRepository } from '../../../modules/entities/repositories/entities.repository.js'
import { WebhooksRepository } from '../../../modules/notifications/repositories/webhooks.repository.js'
import { WebhooksService } from '../../../modules/notifications/services/webhooks.service.js'

const entitiesRepository = new EntitiesRepository()
const webhooksRepository = new WebhooksRepository()
const webhooksService = new WebhooksService(webhooksRepository)

export const riskScoringWorker = new Worker(
    'risk-scoring',
    async (job: Job) => {
        const { entityId, tenantId, factors } = job.data

        console.log(`[RiskScoringWorker] Processando risco para entidade: ${entityId}`)

        const { score, level } = ScoringEngine.calculate(factors)

        await entitiesRepository.updateRiskScore(entityId, tenantId, score, level)

        console.log(`[RiskScoringWorker] Score atualizado: ${score} (${level})`)

        // Notificar via Webhook se o risco for HIGH ou CRITICAL
        if (['HIGH', 'CRITICAL'].includes(level)) {
            await webhooksService.notify(tenantId, 'risk.high_detected', {
                entityId,
                riskScore: score,
                riskLevel: level,
                detectedAt: new Date().toISOString()
            })
        }
    },
    { connection: redis as any }
)
