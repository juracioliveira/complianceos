import { db } from '../../../infra/db/db.js'
import { documents, users as usersTable } from '../../../infra/db/schema.js'
import { eq, and, desc, sql } from 'drizzle-orm'

export class DocumentsRepository {
    async create(data: any) {
        const [doc] = await db.insert(documents).values(data).returning()
        return doc
    }

    async findById(id: string, tenantId: string) {
        const [doc] = await db
            .select()
            .from(documents)
            .where(
                and(
                    eq(documents.id, id),
                    eq(documents.tenantId, tenantId)
                )
            )
            .limit(1)
        return doc
    }

    async findByJobId(jobId: string, tenantId: string) {
        const [doc] = await db
            .select()
            .from(documents)
            .where(
                and(
                    sql`${documents.generationParams}->>'jobId' = ${jobId}`,
                    eq(documents.tenantId, tenantId)
                )
            )
            .limit(1)
        return doc
    }

    async list(tenantId: string, filters: { docType?: string; limit?: number } = {}) {
        let query = db
            .select({
                id: documents.id,
                docType: documents.docType,
                title: documents.title,
                status: documents.status,
                contentHash: documents.contentHash,
                fileSizeBytes: documents.fileSizeBytes,
                validUntil: documents.validUntil,
                createdAt: documents.createdAt,
                generatedByName: usersTable.name
            })
            .from(documents)
            .leftJoin(usersTable, eq(documents.generatedBy, usersTable.id))
            .where(eq(documents.tenantId, tenantId))

        if (filters.docType) {
            // Need to handle dynamic where more carefully with Drizzle
            return db
                .select({
                    id: documents.id,
                    docType: documents.docType,
                    title: documents.title,
                    status: documents.status,
                    contentHash: documents.contentHash,
                    fileSizeBytes: documents.fileSizeBytes,
                    validUntil: documents.validUntil,
                    createdAt: documents.createdAt,
                    generatedByName: usersTable.name
                })
                .from(documents)
                .leftJoin(usersTable, eq(documents.generatedBy, usersTable.id))
                .where(
                    and(
                        eq(documents.tenantId, tenantId),
                        eq(documents.docType, filters.docType)
                    )
                )
                .orderBy(desc(documents.createdAt))
                .limit(filters.limit || 50)
        }

        return db
            .select({
                id: documents.id,
                docType: documents.docType,
                title: documents.title,
                status: documents.status,
                contentHash: documents.contentHash,
                fileSizeBytes: documents.fileSizeBytes,
                validUntil: documents.validUntil,
                createdAt: documents.createdAt,
                generatedByName: usersTable.name
            })
            .from(documents)
            .leftJoin(usersTable, eq(documents.generatedBy, usersTable.id))
            .where(eq(documents.tenantId, tenantId))
            .orderBy(desc(documents.createdAt))
            .limit(filters.limit || 50)
    }

    async updateStatus(id: string, tenantId: string, status: 'READY' | 'FAILED', data: any = {}) {
        await db
            .update(documents)
            .set({
                status,
                ...data,
                updatedAt: new Date()
            })
            .where(
                and(
                    eq(documents.id, id),
                    eq(documents.tenantId, tenantId)
                )
            )
    }

    async updateMetadata(id: string, tenantId: string, metadata: any) {
        await db
            .update(documents)
            .set({
                generationParams: sql`${documents.generationParams} || ${metadata}::jsonb`,
                updatedAt: new Date()
            })
            .where(
                and(
                    eq(documents.id, id),
                    eq(documents.tenantId, tenantId)
                )
            )
    }
}
