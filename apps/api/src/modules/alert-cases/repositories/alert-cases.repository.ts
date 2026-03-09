import { getDb } from '../../../infra/db/db.js'
import { alertCases } from '../../../infra/db/schema.js'
import { eq, and, desc, inArray, sql } from 'drizzle-orm'

export type AlertCaseFilters = {
    status?: string | string[] | undefined
    severity?: string | string[] | undefined
    source?: string | undefined
    assignedTo?: string | undefined
    entityId?: string | undefined
    limit?: number | undefined
    offset?: number | undefined
}

export class AlertCasesRepository {

    async list(tenantId: string, filters: AlertCaseFilters = {}) {
        const { limit = 50, offset = 0 } = filters

        // Build conditions as SQL chunks for Drizzle to handle parameters safely
        const conditions = [sql`ac.tenant_id = ${tenantId}`]

        if (filters.status) {
            const statuses = Array.isArray(filters.status) ? filters.status : [filters.status]
            conditions.push(sql`ac.status = ANY(${statuses}::alert_case_status[])`)
        }

        if (filters.severity) {
            const severities = Array.isArray(filters.severity) ? filters.severity : [filters.severity]
            conditions.push(sql`ac.severity = ANY(${severities}::alert_severity[])`)
        }

        if (filters.source) {
            conditions.push(sql`ac.source = ${filters.source}::alert_source`)
        }

        if (filters.assignedTo) {
            conditions.push(sql`ac.assigned_to = ${filters.assignedTo}`)
        }

        if (filters.entityId) {
            conditions.push(sql`ac.entity_id = ${filters.entityId}`)
        }

        const where = and(...conditions)

        const [rows, countRow] = await Promise.all([
            getDb().execute(sql`
                SELECT
                    ac.id, ac.source, ac.severity, ac.status,
                    ac.title, ac.description, ac.evidence,
                    ac.resolved_at, ac.resolution_note,
                    ac.created_at, ac.updated_at,
                    e.id   AS entity_id,
                    e.name AS entity_name,
                    e.cnpj AS entity_cnpj,
                    e.risk_level AS entity_risk_level,
                    u_assign.name AS assigned_to_name,
                    u_assign.id   AS assigned_to_id,
                    u_create.name AS created_by_name
                FROM alert_cases ac
                LEFT JOIN entities e        ON e.id = ac.entity_id
                LEFT JOIN users u_assign    ON u_assign.id = ac.assigned_to
                LEFT JOIN users u_create    ON u_create.id = ac.created_by
                WHERE ${where}
                ORDER BY
                    CASE ac.severity WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END,
                    ac.created_at DESC
                LIMIT ${limit} OFFSET ${offset}
            `),
            getDb().execute(sql`
                SELECT COUNT(*) AS total FROM alert_cases ac WHERE ${where}
            `),
        ])

        return {
            data: rows.rows as any[],
            total: Number((countRow.rows[0] as any)?.total ?? 0),
        }
    }

    async findById(id: string, tenantId: string) {
        const result = await getDb().execute(sql`
            SELECT
                ac.*,
                e.id         AS entity_id,
                e.name       AS entity_name,
                e.cnpj       AS entity_cnpj,
                e.cpf        AS entity_cpf,
                e.risk_level AS entity_risk_level,
                e.risk_score AS entity_risk_score,
                e.kyc_status AS entity_kyc_status,
                u_assign.id   AS assigned_to_id,
                u_assign.name AS assigned_to_name,
                u_assign.email AS assigned_to_email,
                u_resolve.id   AS resolved_by_id,
                u_resolve.name AS resolved_by_name,
                u_create.id    AS created_by_id,
                u_create.name  AS created_by_name
            FROM alert_cases ac
            LEFT JOIN entities e          ON e.id = ac.entity_id
            LEFT JOIN users u_assign      ON u_assign.id = ac.assigned_to
            LEFT JOIN users u_resolve     ON u_resolve.id = ac.resolved_by
            LEFT JOIN users u_create      ON u_create.id = ac.created_by
            WHERE ac.id = ${id} AND ac.tenant_id = ${tenantId}
            LIMIT 1
        `)

        return result.rows[0] ?? null
    }

    async create(data: {
        tenantId: string
        entityId?: string | undefined
        source: string
        severity: string
        title: string
        description: string
        evidence: Record<string, any>
        createdBy?: string | undefined
    }) {
        const result = await getDb().execute(sql`
            INSERT INTO alert_cases
                (tenant_id, entity_id, source, severity, title, description, evidence, created_by)
            VALUES
                (${data.tenantId}, ${data.entityId ?? null}, ${data.source}::alert_source, ${data.severity}::alert_severity, ${data.title}, ${data.description}, ${JSON.stringify(data.evidence)}, ${data.createdBy})
            RETURNING *
        `)

        return result.rows[0]
    }

    async update(id: string, tenantId: string, patch: {
        status?: string
        severity?: string
        assignedTo?: string | null
        resolutionNote?: string
        resolvedBy?: string
        resolvedAt?: Date
    }) {
        const updates: any[] = [sql`updated_at = NOW()`]

        if (patch.status !== undefined) {
            updates.push(sql`status = ${patch.status}::alert_case_status`)
        }
        if (patch.severity !== undefined) {
            updates.push(sql`severity = ${patch.severity}::alert_severity`)
        }
        if ('assignedTo' in patch) {
            updates.push(sql`assigned_to = ${patch.assignedTo ?? null}`)
        }
        if (patch.resolutionNote !== undefined) {
            updates.push(sql`resolution_note = ${patch.resolutionNote}`)
        }
        if (patch.resolvedBy !== undefined) {
            updates.push(sql`resolved_by = ${patch.resolvedBy}`)
        }
        if (patch.resolvedAt !== undefined) {
            updates.push(sql`resolved_at = ${patch.resolvedAt}`)
        }

        const setClause = sql.join(updates, sql`, `)

        const result = await getDb().execute(sql`
            UPDATE alert_cases
            SET ${setClause}
            WHERE id = ${id} AND tenant_id = ${tenantId}
            RETURNING *
        `)

        return result.rows[0] ?? null
    }

    async countOpen(tenantId: string): Promise<{ open: number; critical: number }> {
        const result = await getDb().execute(sql`
            SELECT
                COUNT(*) FILTER (WHERE status IN ('OPEN', 'UNDER_REVIEW', 'ESCALATED')) AS open,
                COUNT(*) FILTER (WHERE status IN ('OPEN', 'UNDER_REVIEW', 'ESCALATED') AND severity = 'CRITICAL') AS critical
            FROM alert_cases
            WHERE tenant_id = ${tenantId}
        `)

        return {
            open: Number((result.rows[0] as any)?.open ?? 0),
            critical: Number((result.rows[0] as any)?.critical ?? 0),
        }
    }
}
