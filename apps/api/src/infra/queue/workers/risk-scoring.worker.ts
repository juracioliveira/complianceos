import { Worker, Job } from 'bullmq'
import { redis } from '../../redis.js'
import { ScoringEngine } from '@compliance-os/scoring-engine'
import { EntitiesRepository } from '../../../modules/entities/repositories/entities.repository.js'
import { WebhooksRepository } from '../../../modules/notifications/repositories/webhooks.repository.js'
import { WebhooksService } from '../../../modules/notifications/services/webhooks.service.js'
import { createWorkerLogger } from '../../logger.js'

const entitiesRepository = new EntitiesRepository()
const webhooksRepository = new WebhooksRepository()
const webhooksService = new WebhooksService(webhooksRepository)

export const riskScoringWorker = new Worker(
    'risk-scoring',
    async (job: Job) => {
        const { entityId, tenantId, factors } = job.data
        const log = createWorkerLogger('risk-scoring', { jobId: job.id, tenantId, entityId })

        log.info('Processando cálculo de risco')

        try {
            const { score, level } = ScoringEngine.calculate(factors)

            await entitiesRepository.updateRiskScore(entityId, tenantId, score, level, 'system:risk-scoring-worker')

            log.info({ score, level }, 'Score de risco atualizado com sucesso')

            // Notificar via Webhook se o risco for HIGH ou CRITICAL
            if (['HIGH', 'CRITICAL'].includes(level)) {
                log.info({ level }, 'Risco elevado detectado, disparando notificação')
                await webhooksService.notify(tenantId, 'risk.high_detected', {
                    entityId,
                    riskScore: score,
                    riskLevel: level,
                    detectedAt: new Date().toISOString()
                })
            }
        } catch (error) {
            log.error({ err: error }, 'Erro fatal ao processar score de risco')
            throw error
        }
    },
    { connection: redis as any }
)
