import { db, pool } from '../../../infra/db/db.js'
import { alertCases } from '../../../infra/db/schema.js'
import { eq, and, desc, inArray } from 'drizzle-orm'

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

        // Raw SQL para flexibilidade de filtros dinâmicos
        const conditions: string[] = ['ac.tenant_id = $1']
        const params: any[] = [tenantId]
        let paramIdx = 2

        if (filters.status) {
            const statuses = Array.isArray(filters.status) ? filters.status : [filters.status]
            conditions.push(`ac.status = ANY($${paramIdx}::alert_case_status[])`)
            params.push(statuses)
            paramIdx++
        }

        if (filters.severity) {
            const severities = Array.isArray(filters.severity) ? filters.severity : [filters.severity]
            conditions.push(`ac.severity = ANY($${paramIdx}::alert_severity[])`)
            params.push(severities)
            paramIdx++
        }

        if (filters.source) {
            conditions.push(`ac.source = $${paramIdx}::alert_source`)
            params.push(filters.source)
            paramIdx++
        }

        if (filters.assignedTo) {
            conditions.push(`ac.assigned_to = $${paramIdx}`)
            params.push(filters.assignedTo)
            paramIdx++
        }

        if (filters.entityId) {
            conditions.push(`ac.entity_id = $${paramIdx}`)
            params.push(filters.entityId)
            paramIdx++
        }

        const where = conditions.join(' AND ')

        const [rows, countRow] = await Promise.all([
            pool.query<any>(`
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
                LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
            `, [...params, limit, offset]),
            pool.query<{ total: string }>(`
                SELECT COUNT(*) AS total FROM alert_cases ac WHERE ${where}
            `, params),
        ])

        return {
            data: rows.rows,
            total: Number(countRow.rows[0]?.total ?? 0),
        }
    }

    async findById(id: string, tenantId: string) {
        const result = await pool.query<any>(`
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
            WHERE ac.id = $1 AND ac.tenant_id = $2
            LIMIT 1
        `, [id, tenantId])

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
        const result = await pool.query<any>(`
            INSERT INTO alert_cases
                (tenant_id, entity_id, source, severity, title, description, evidence, created_by)
            VALUES
                ($1, $2, $3::alert_source, $4::alert_severity, $5, $6, $7, $8)
            RETURNING *
        `, [
            data.tenantId,
            data.entityId ?? null,
            data.source,
            data.severity,
            data.title,
            data.description,
            JSON.stringify(data.evidence),
            data.createdBy,
        ])

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
        const setClauses: string[] = ['updated_at = NOW()']
        const params: any[] = [id, tenantId]
        let i = 3

        if (patch.status !== undefined) {
            setClauses.push(`status = $${i}::alert_case_status`); params.push(patch.status); i++
        }
        if (patch.severity !== undefined) {
            setClauses.push(`severity = $${i}::alert_severity`); params.push(patch.severity); i++
        }
        if ('assignedTo' in patch) {
            setClauses.push(`assigned_to = $${i}`); params.push(patch.assignedTo ?? null); i++
        }
        if (patch.resolutionNote !== undefined) {
            setClauses.push(`resolution_note = $${i}`); params.push(patch.resolutionNote); i++
        }
        if (patch.resolvedBy !== undefined) {
            setClauses.push(`resolved_by = $${i}`); params.push(patch.resolvedBy); i++
        }
        if (patch.resolvedAt !== undefined) {
            setClauses.push(`resolved_at = $${i}`); params.push(patch.resolvedAt); i++
        }

        const result = await pool.query<any>(`
            UPDATE alert_cases
            SET ${setClauses.join(', ')}
            WHERE id = $1 AND tenant_id = $2
            RETURNING *
        `, params)

        return result.rows[0] ?? null
    }

    async countOpen(tenantId: string): Promise<{ open: number; critical: number }> {
        const result = await pool.query<any>(`
            SELECT
                COUNT(*) FILTER (WHERE status IN ('OPEN', 'UNDER_REVIEW', 'ESCALATED')) AS open,
                COUNT(*) FILTER (WHERE status IN ('OPEN', 'UNDER_REVIEW', 'ESCALATED') AND severity = 'CRITICAL') AS critical
            FROM alert_cases
            WHERE tenant_id = $1
        `, [tenantId])

        return {
            open: Number(result.rows[0]?.open ?? 0),
            critical: Number(result.rows[0]?.critical ?? 0),
        }
    }
}
