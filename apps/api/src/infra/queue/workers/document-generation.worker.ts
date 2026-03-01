import { Worker, Job } from 'bullmq'
import { redis } from '../../redis.js'
import { DocumentsRepository } from '../../../modules/documents/repositories/documents.repository.js'
import { WebhooksRepository } from '../../../modules/notifications/repositories/webhooks.repository.js'
import { WebhooksService } from '../../../modules/notifications/services/webhooks.service.js'

const documentsRepository = new DocumentsRepository()
const webhooksRepository = new WebhooksRepository()
const webhooksService = new WebhooksService(webhooksRepository)

export const documentGenerationWorker = new Worker(
    'document-generation',
    async (job: Job) => {
        const { documentId, tenantId, docType, params } = job.data

        console.log(`[DocumentGenerationWorker] Gerando ${docType} para ${documentId}`)

        // Simulação de geração de PDF (WIP: Integrar com Puppeteer ou similar)
        await new Promise(resolve => setTimeout(resolve, 5000))

        const updateData = {
            status: 'READY' as const,
            fileSizeBytes: 1024 * 500, // 500KB mock
            contentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', // SHA256 mock
            updatedAt: new Date()
        }

        await documentsRepository.updateStatus(documentId, tenantId, 'READY', updateData)

        console.log(`[DocumentGenerationWorker] Documento ${documentId} pronto. Disparando webhook...`)

        // Disparar Webhook
        await webhooksService.notify(tenantId, 'document.ready', {
            id: documentId,
            docType,
            status: 'READY',
            downloadUrl: `/v1/documents/${documentId}/download`
        })
    },
    { connection: redis as any }
)
