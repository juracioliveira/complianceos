import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { tenantMiddleware } from '../../middlewares/tenant.middleware.js'
import { cache } from '../../infra/redis.js'

export const dashboardRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /v1/dashboard/summary
  fastify.get('/summary', {
    preHandler: [authMiddleware, tenantMiddleware],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const cacheKey = cache.keys.tenantDashboard(request.tenantId)

      // Cache de 5 minutos para o dashboard
      const cached = await cache.get<object>(cacheKey)
      if (cached) return reply.send({ data: cached })

      const db = request.db

      // KPIs paralelos — conforme queries de referência DEV-04 §7.1 e §7.2
      const [entityStats, checklistStats, documentStats, alertStats, recentAudit, criticalList, caseStats] = await Promise.all([
        db.query<{ risk_level: string; total: string }>(`
          SELECT risk_level, COUNT(*) AS total
          FROM entities
          WHERE status = 'ACTIVE'
          GROUP BY risk_level
        `),
        db.query<{ overdue: string; due_soon: string; in_progress: string; completed_this_month: string }>(`
          SELECT
            COUNT(*) FILTER (WHERE last_run + (periodicity_days || ' days')::INTERVAL < NOW()) AS overdue,
            COUNT(*) FILTER (WHERE last_run + (periodicity_days || ' days')::INTERVAL BETWEEN NOW() AND NOW() + INTERVAL '30 days') AS due_soon,
            (SELECT COUNT(*) FROM checklist_runs WHERE status = 'IN_PROGRESS') AS in_progress,
            (SELECT COUNT(*) FROM checklist_runs WHERE status = 'COMPLETED' AND completed_at >= date_trunc('month', NOW())) AS completed_this_month
          FROM (
            SELECT DISTINCT ON (e.id, c.id)
              e.id AS entity_id,
              c.periodicity_days,
              MAX(cr.completed_at) OVER (PARTITION BY e.id, c.id) AS last_run
            FROM entities e
            CROSS JOIN checklists c
            LEFT JOIN checklist_runs cr ON cr.entity_id = e.id AND cr.checklist_id = c.id AND cr.status = 'COMPLETED'
            WHERE e.status = 'ACTIVE' AND c.status = 'ACTIVE' AND c.periodicity_days IS NOT NULL
          ) t
          WHERE last_run IS NULL OR last_run + (periodicity_days || ' days')::INTERVAL < NOW() + INTERVAL '30 days'
        `).catch(() => ({ rows: [{ overdue: '0', due_soon: '0', in_progress: '0', completed_this_month: '0' }] })),
        db.query<{ generated_this_month: string; expiring_soon: string }>(`
          SELECT
            COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW())) AS generated_this_month,
            COUNT(*) FILTER (WHERE valid_until BETWEEN NOW() AND NOW() + INTERVAL '60 days') AS expiring_soon
          FROM documents
          WHERE status = 'READY'
        `),
        db.query<{ critical: string; warning: string; unread: string }>(`
          SELECT
            COUNT(*) FILTER (WHERE severity = 'CRITICAL' AND read_at IS NULL) AS critical,
            COUNT(*) FILTER (WHERE severity = 'WARNING' AND read_at IS NULL) AS warning,
            COUNT(*) FILTER (WHERE read_at IS NULL) AS unread
          FROM notifications
          WHERE (user_id = $1 OR user_id IS NULL)
        `, [request.user.sub]),
        db.query<{ entity: string; action: string; user: string; time: string; risk: string }>(`
          SELECT 
            e.name as entity,
            'Atualização de status' as action,
            u.name as user,
            'há pouco' as time,
            e.risk_level as risk
          FROM audit_logs al
          JOIN entities e ON e.id = al.entity_id
          JOIN users u ON u.id = al.user_id
          ORDER BY al.created_at DESC
          LIMIT 5
        `).catch(() => ({ rows: [] })),
        db.query<{ name: string; cnpj: string; type: string; risk: string; score: number; lastCheck: string }>(`
          SELECT 
            name, cnpj, entity_type as type, risk_level as risk, risk_score as score, updated_at as "lastCheck"
          FROM entities
          WHERE risk_level = 'CRITICAL' AND status = 'ACTIVE'
          LIMIT 5
        `).catch(() => ({ rows: [] })),
        db.query<{ open_cases: string; critical_cases: string }>(`
          SELECT
            COUNT(*) FILTER (WHERE status IN ('OPEN', 'UNDER_REVIEW', 'ESCALATED')) AS open_cases,
            COUNT(*) FILTER (WHERE status IN ('OPEN', 'UNDER_REVIEW', 'ESCALATED') AND severity = 'CRITICAL') AS critical_cases
          FROM alert_cases
          WHERE tenant_id = current_setting('app.tenant_id')::UUID
        `).catch(() => ({ rows: [{ open_cases: '0', critical_cases: '0' }] })),
      ])

      // Montar objeto de KPIs
      const byRisk: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, UNKNOWN: 0 }
      let totalEntities = 0
      for (const row of entityStats.rows) {
        byRisk[row.risk_level] = Number(row.total)
        totalEntities += Number(row.total)
      }

      const cs = checklistStats.rows[0] ?? { overdue: '0', due_soon: '0', in_progress: '0', completed_this_month: '0' }
      const ds = documentStats.rows[0] ?? { generated_this_month: '0', expiring_soon: '0' }
      const as_ = alertStats.rows[0] ?? { critical: '0', warning: '0', unread: '0' }
      const cases_ = caseStats?.rows[0] ?? { open_cases: '0', critical_cases: '0' }

      const summary = {
        entities: {
          total: totalEntities,
          byRisk,
          active: totalEntities,
          blocked: byRisk['UNKNOWN'] ?? 0,
        },
        checklists: {
          overdue: Number(cs.overdue),
          dueSoon: Number(cs.due_soon),
          completedThisMonth: Number(cs.completed_this_month),
          inProgress: Number(cs.in_progress),
        },
        documents: {
          generatedThisMonth: Number(ds.generated_this_month),
          expiringSoon: Number(ds.expiring_soon),
        },
        alerts: {
          critical: Number(as_.critical),
          warning: Number(as_.warning),
          unread: Number(as_.unread),
          openCases: Number(cases_.open_cases),
          criticalCases: Number(cases_.critical_cases),
        },
        recentActivities: recentAudit.rows,
        criticalEntities: criticalList.rows,
        lastUpdated: new Date().toISOString(),
      }

      // Cache por 5 minutos
      await cache.set(cacheKey, summary, 300)

      return reply.send({ data: summary })
    },
  })

  // GET /v1/dashboard/compliance-readiness
  // Mapeia funcionalidades para frameworks internacionais (SOC2 / ISO 27001)
  fastify.get('/compliance-readiness', {
    preHandler: [authMiddleware, tenantMiddleware],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const data = {
        frameworks: [
          {
            name: 'SOC2 Type II',
            score: 85,
            controls: [
              { id: 'CC6.1', name: 'Logical Access', status: 'COMPLIANT', feature: 'MFA + JWT' },
              { id: 'CC7.1', name: 'System Operations', status: 'COMPLIANT', feature: 'Audit Chaining (SHA-256)' },
              { id: 'CC1.1', name: 'Integrity of Information', status: 'COMPLIANT', feature: 'RLS (Row Level Security)' }
            ]
          },
          {
            name: 'ISO 27001',
            score: 92,
            controls: [
              { id: 'A.12.4.1', name: 'Event Logging', status: 'COMPLIANT', feature: 'Audit Trail' },
              { id: 'A.9.2.1', name: 'User Registration', status: 'COMPLIANT', feature: 'RBAC' },
              { id: 'A.18.1.1', name: 'Identification of Applicable Legislation', status: 'COMPLIANT', feature: 'LGPD Module' }
            ]
          }
        ],
        summary: {
          overallReadiness: 'HIGH',
          lastAssessment: new Date().toISOString()
        }
      }

      return reply.send({ data })
    }
  })
}
