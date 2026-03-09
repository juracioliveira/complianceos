import { AuditRepository } from '../repositories/audit.repository.js'
import { DocumentsService } from '../../documents/services/documents.service.js'
import { ForbiddenError, ComplianceOSError } from '@compliance-os/types'
import { getDb } from '../../../infra/db/db.js'
import { checklistRuns } from '../../../infra/db/schema.js'
import { eq, and } from 'drizzle-orm'
import crypto from 'node:crypto'

export class AuditService {
    constructor(
        private auditRepository: AuditRepository,
        private documentsService: DocumentsService
    ) { }

    async listEvents(tenantId: string, filters: any, userRole: string) {
        if (!['AUDITOR', 'ADMIN'].includes(userRole)) {
            throw new ForbiddenError('Acesso negado ao audit trail')
        }

        return this.auditRepository.list(tenantId, filters)
    }

    private calculateHash(data: any): string {
        const sortedData = this.sortObjectKeys(data)
        return crypto.createHash('sha256').update(JSON.stringify(sortedData)).digest('hex')
    }

    private sortObjectKeys(obj: any): any {
        if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
            return obj
        }
        return Object.keys(obj)
            .sort()
            .reduce((acc: any, key) => {
                acc[key] = this.sortObjectKeys(obj[key])
                return acc
            }, {})
    }

    async logEvent(data: any) {
        // 1. Obter o último hash do tenant para encadeamento (Padrão Big Four)
        const lastEvent = await this.auditRepository.getLastEvent(data.tenantId)
        const prevHash = lastEvent?.payloadHash || '0'.repeat(64)

        // 2. Calcular o hash do payload atual (SHA-256)
        const payloadHash = this.calculateHash({
            prevHash,
            module: data.module,
            action: data.action,
            actorId: data.actorId,
            resourceId: data.resourceId,
            result: data.result,
            metadata: data.metadata || {}
        })

        return this.auditRepository.create({
            ...data,
            payloadHash,
            prevHash
        })
    }

    async verifyIntegrity(tenantId: string) {
        const events = await this.auditRepository.listAll(tenantId)
        let currentPrevHash = '0'.repeat(64)
        const violations = []

        for (const event of events) {
            const calculatedHash = this.calculateHash({
                prevHash: event.prevHash,
                module: event.module,
                action: event.action,
                actorId: event.actorId,
                resourceId: event.resourceId,
                result: event.result,
                metadata: event.metadata
            })

            if (event.prevHash !== currentPrevHash || event.payloadHash !== calculatedHash) {
                violations.push({
                    eventId: event.eventId,
                    expectedPrevHash: currentPrevHash,
                    actualPrevHash: event.prevHash,
                    expectedPayloadHash: calculatedHash,
                    actualPayloadHash: event.payloadHash
                })
            }
            currentPrevHash = event.payloadHash
        }

        return {
            valid: violations.length === 0,
            violations
        }
    }

    async generateComplianceCertificate(tenantId: string, entityId: string, userId: string) {
        // Verificar se existe pelo menos um checklist concluído com sucesso
        const completedRuns = await getDb()
            .select()
            .from(checklistRuns)
            .where(
                and(
                    eq(checklistRuns.entityId, entityId),
                    eq(checklistRuns.tenantId, tenantId),
                    eq(checklistRuns.status, 'COMPLETED')
                )
            )
            .limit(1)

        if (completedRuns.length === 0) {
            throw new ComplianceOSError(
                'A entidade não possui checklists concluídos para gerar certificação.',
                'AUDIT_INCOMPLETE_COMPLIANCE',
                400
            )
        }

        return this.documentsService.requestDocumentGeneration({
            tenantId,
            userId,
            userRole: 'SYSTEM',
            docType: 'COMPLIANCE_CERTIFICATE',
            entityId,
            params: {
                generatedAt: new Date().toISOString(),
                auditRef: crypto.randomBytes(8).toString('hex').toUpperCase(),
                runsCount: completedRuns.length
            }
        })
    }
}
