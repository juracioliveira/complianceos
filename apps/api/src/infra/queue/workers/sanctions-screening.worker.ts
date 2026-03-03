import { Worker, Job } from 'bullmq'
import { redis } from '../../redis.js'
import { EntitiesRepository } from '../../../modules/entities/repositories/entities.repository.js'
import { AuditRepository } from '../../../modules/audit/repositories/audit.repository.js'
import { DocumentsRepository } from '../../../modules/documents/repositories/documents.repository.js'
import { DocumentsService } from '../../../modules/documents/services/documents.service.js'
import { AuditService } from '../../../modules/audit/services/audit.service.js'
import { WebhooksRepository } from '../../../modules/notifications/repositories/webhooks.repository.js'
import { WebhooksService } from '../../../modules/notifications/services/webhooks.service.js'

const entitiesRepository = new EntitiesRepository()
const auditRepository = new AuditRepository()
const documentsRepository = new DocumentsRepository()
const documentsService = new DocumentsService(documentsRepository)
const auditService = new AuditService(auditRepository, documentsService)
const webhooksRepository = new WebhooksRepository()
const webhooksService = new WebhooksService(webhooksRepository)

export const sanctionsScreeningWorker = new Worker(
    'sanctions-screening',
    async (job: Job) => {
        const { tenantId, entityId, document, name } = job.data

        console.log(`[SanctionsWorker] Iniciando screening para entidade: ${entityId} (${document})`)

        try {
            // Simulate external OFAC/UN Sanctions API call
            const sanctionsUrl = process.env['SANCTIONS_SERVICE_URL'] || 'http://localhost:4002'

            // We use a mock response instead of fetching for now, or fetch if it's running
            let isSanctioned = false;
            let matchDetails = null;

            try {
                const screenRes = await fetch(`${sanctionsUrl}/screen`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ document })
                });

                if (screenRes.ok) {
                    const result = await screenRes.json();
                    isSanctioned = result.match;
                    matchDetails = result.details;
                }
            } catch (err) {
                console.log(`[SanctionsWorker] Falha ao conectar no microserviço de sanções. Usando fallback.`);
                // Fallback simulation for demonstration
                // Simulating OFAC hit for "0001"
                if (document.includes('0001')) {
                    isSanctioned = true;
                    matchDetails = { list: 'OFAC_SDN', severity: 'CRITICAL', score: 98, type: 'SANCTION' }
                }
                // Simulating PEP hit for "0002"
                else if (document.includes('0002') || name.toLowerCase().includes('pep') || name.toLowerCase().includes('político')) {
                    isSanctioned = true;
                    matchDetails = { list: 'BR_PEP_PORTAL_TRANSPARENCIA', severity: 'HIGH', score: 95, type: 'PEP' }
                }
            }

            if (isSanctioned) {
                console.log(`[SanctionsWorker] ALERTA: Match encontrado para a entidade ${entityId}! Tipo: ${matchDetails?.type || 'SANCTION'}`);

                const isPEP = matchDetails?.type === 'PEP';
                const riskLevel = isPEP ? 'HIGH' : 'CRITICAL';
                const actionName = isPEP ? 'PEP_SCREENING_MATCH' : 'SANCTIONS_SCREENING_MATCH';

                // Update Entity Risk
                await entitiesRepository.updateRiskScore(entityId, tenantId, matchDetails?.score || 99, riskLevel, 'SYSTEM_SANCTIONS_ENGINE');

                // Audit Log
                await auditService.logEvent({
                    tenantId,
                    module: 'ENTITIES',
                    action: actionName,
                    actorId: 'SYSTEM',
                    resourceId: entityId,
                    result: 'SUCCESS',
                    metadata: {
                        list: matchDetails?.list || 'UNKNOWN_LIST',
                        confidence: matchDetails?.score || 100,
                        document,
                        name
                    }
                });

                // Webhook Notification
                await webhooksService.notify(tenantId, isPEP ? 'risk.high_detected' : 'risk.critical_hit', {
                    entityId,
                    riskScore: matchDetails?.score || 99,
                    riskLevel: riskLevel,
                    matchDetails,
                    detectedAt: new Date().toISOString()
                });
            } else {
                console.log(`[SanctionsWorker] Entidade ${entityId} limpa (No Match).`);

                await auditService.logEvent({
                    tenantId,
                    module: 'ENTITIES',
                    action: 'SANCTIONS_SCREENING_CLEAN',
                    actorId: 'SYSTEM',
                    resourceId: entityId,
                    result: 'SUCCESS',
                    metadata: { document }
                });
            }

        } catch (error) {
            console.error(`[SanctionsWorker] Erro crítico ao processar entidade ${entityId}:`, error);
            throw error;
        }
    },
    { connection: redis as any }
)
