import { DocumentsRepository } from '../repositories/documents.repository.js'
import { queue } from '../../../infra/queue.js'
import { ComplianceOSError, ForbiddenError, NotFoundError } from '@compliance-os/types'
import crypto from 'node:crypto'

export class DocumentsService {
    constructor(private documentsRepository: DocumentsRepository) { }

    async requestDocumentGeneration(data: {
        tenantId: string
        userId: string
        userRole: string
        docType: string
        entityId?: string | null
        params: Record<string, any>
    }) {
        if (!['COMPLIANCE_OFFICER', 'ADMIN'].includes(data.userRole)) {
            throw new ForbiddenError('Sem permissão para gerar documentos')
        }

        const docId = crypto.randomUUID()
        const jobId = `job_${crypto.randomUUID().replace(/-/g, '')}`

        const document = await this.documentsRepository.create({
            id: docId,
            tenantId: data.tenantId,
            entityId: data.entityId || null,
            docType: data.docType,
            title: `${data.docType} — ${new Date().toLocaleDateString('pt-BR')}`,
            s3Key: `documents/${data.tenantId}/${docId}.pdf`,
            s3Bucket: process.env['DOCUMENTS_S3_BUCKET'] || 'compliance-documents',
            contentHash: '',
            status: 'GENERATING',
            generatedBy: data.userId,
            generationParams: { ...data.params, jobId }
        })

        // Enfileirar job de geração
        await queue.add('DOCUMENT_GENERATION', {
            jobId,
            documentId: docId,
            tenantId: data.tenantId,
            docType: data.docType,
            generatedBy: data.userId,
            params: data.params
        })

        return {
            jobId,
            docType: data.docType,
            status: 'GENERATING',
            estimatedSeconds: 30
        }
    }

    async getJobStatus(jobId: string, tenantId: string) {
        const doc = await this.documentsRepository.findByJobId(jobId, tenantId)
        if (!doc) throw new NotFoundError('Job de documento')

        return {
            jobId,
            status: doc.status,
            documentId: doc.status === 'READY' ? doc.id : null,
            downloadUrl: doc.status === 'READY' ? `/v1/documents/${doc.id}/download` : null
        }
    }

    async getDownloadLink(id: string, tenantId: string) {
        const doc = await this.documentsRepository.findById(id, tenantId)
        if (!doc) throw new NotFoundError('Documento')

        if (doc.status !== 'READY') {
            throw new ComplianceOSError('DOCUMENT_NOT_READY', `Documento ainda não está pronto (status: ${doc.status})`, 422)
        }

        // Em produção: gerar presigned URL do S3
        const presignedUrl = `https://s3.amazonaws.com/${doc.s3Bucket}/${doc.s3Key}?presigned=dev`
        const expiresAt = new Date(Date.now() + 900_000)

        return {
            documentId: doc.id,
            title: doc.title,
            docType: doc.docType,
            contentHash: doc.contentHash,
            fileSizeBytes: doc.fileSizeBytes,
            presignedUrl,
            presignedUrlExpiresAt: expiresAt.toISOString(),
            generatedAt: doc.createdAt
        }
    }

    async listDocuments(tenantId: string, filters: { docType?: string; limit?: number }) {
        return this.documentsRepository.list(tenantId, filters)
    }

    /**
     * Aplica assinatura digital ICP-Brasil e Carimbo de Tempo (Padrão Big Four)
     * No mundo real, utilizaria um HSM ou serviço de assinatura (ex: Bry, Certisign).
     */
    async signDocument(documentId: string, tenantId: string, userId: string) {
        const doc = await this.documentsRepository.findById(documentId, tenantId)
        if (!doc) throw new NotFoundError('Documento')

        // 1. Simular assinatura digital (PKCS#7 / PAdES)
        const signature = crypto.createHash('sha256')
            .update(doc.contentHash + userId + process.env['SIGNING_SECRET'])
            .digest('hex')

        // 2. Simular Carimbo de Tempo (TSA - Timestamp Authority)
        const timestamp = new Date().toISOString()
        const tsaToken = crypto.randomBytes(32).toString('base64')

        // 3. Atualizar metadados do documento
        await this.documentsRepository.updateMetadata(documentId, tenantId, {
            isSigned: true,
            signedBy: userId,
            signedAt: timestamp,
            signature,
            tsaToken
        })

        return {
            documentId,
            status: 'SIGNED',
            signedAt: timestamp,
            signatureSummary: signature.substring(0, 16) + '...'
        }
    }
}
