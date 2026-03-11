import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { tenantMiddleware } from '../../middlewares/tenant.middleware.js'
import type { JwtPayload } from '@compliance-os/types'
import { cache } from '../../infra/redis.js'

export const dashboardRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /v1/dashboard/summary
  fastify.get('/summary', {
    preHandler: [authMiddleware, tenantMiddleware],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const cacheKey = cache.keys.tenantDashboard(request.tenantId)

      // Cache reduzido para 60s para melhor frescor de dados
      const cached = await cache.get<object>(cacheKey)
      if (cached) return reply.send({ data: cached })

      const db = request.db

      // KPIs paralelos + trend data (mês anterior para comparar)
      const [entityStats, checklistStats, documentStats, alertStats, recentAudit, criticalList, caseStats, trendStats] = await Promise.all([
        db.query<{ risk_level: string; total: string }>(`
          SELECT risk_level, COUNT(*) AS total
          FROM entities
          WHERE status = 'ACTIVE' AND tenant_id = $1
          GROUP BY risk_level
        `, [request.tenantId]).catch(() => ({ rows: [] })),
        db.query<{ overdue: string; due_soon: string; in_progress: string; completed_this_month: string }>(`
          SELECT
            0 AS overdue,
            0 AS due_soon,
            (SELECT COUNT(*) FROM checklist_runs WHERE status = 'IN_PROGRESS' AND tenant_id = $1) AS in_progress,
            (SELECT COUNT(*) FROM checklist_runs WHERE status = 'COMPLETED' AND completed_at >= date_trunc('month', NOW()) AND tenant_id = $1) AS completed_this_month
        `, [request.tenantId]).catch(() => ({ rows: [{ overdue: '0', due_soon: '0', in_progress: '0', completed_this_month: '0' }] })),
        db.query<{ generated_this_month: string; expiring_soon: string }>(`
          SELECT
            COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW())) AS generated_this_month,
            COUNT(*) FILTER (WHERE valid_until BETWEEN NOW() AND NOW() + INTERVAL '60 days') AS expiring_soon
          FROM documents
          WHERE status = 'READY' AND tenant_id = $1
        `, [request.tenantId]).catch(() => ({ rows: [{ generated_this_month: '0', expiring_soon: '0' }] })),
        db.query<{ critical: string; warning: string; unread: string }>(`
          SELECT
            COUNT(*) FILTER (WHERE severity = 'CRITICAL' AND read_at IS NULL) AS critical,
            COUNT(*) FILTER (WHERE severity = 'WARNING' AND read_at IS NULL) AS warning,
            COUNT(*) FILTER (WHERE read_at IS NULL) AS unread
          FROM notifications
          WHERE (user_id = $1 OR user_id IS NULL)
        `, [(request.user as JwtPayload).sub]),
        db.query<{ entity: string; action: string; user: string; time: string; risk: string }>(`
          SELECT 
            e.name as entity,
            al.action as action,
            u.name as user,
            'há pouco' as time,
            e.risk_level as risk
          FROM audit_events al
          JOIN entities e ON e.id = al.resource_id
          JOIN users u ON u.id = al.actor_id
          WHERE al.tenant_id = $1
          ORDER BY al.occurred_at DESC
          LIMIT 5
        `, [request.tenantId]).catch(() => ({ rows: [] })),
        db.query<{ name: string; cnpj: string; type: string; risk: string; score: number; lastCheck: string }>(`
          SELECT 
            name, cnpj, entity_type as type, risk_level as risk, risk_score as score, updated_at as "lastCheck"
          FROM entities
          WHERE risk_level = 'CRITICAL' AND status = 'ACTIVE' AND tenant_id = $1
          LIMIT 5
        `, [request.tenantId]).catch(() => ({ rows: [] })),
        db.query<{ open_cases: string; critical_cases: string }>(`
          SELECT
            COUNT(*) FILTER (WHERE status IN ('OPEN', 'UNDER_REVIEW', 'ESCALATED')) AS open_cases,
            COUNT(*) FILTER (WHERE status IN ('OPEN', 'UNDER_REVIEW', 'ESCALATED') AND severity = 'CRITICAL') AS critical_cases
          FROM alert_cases
          WHERE tenant_id = current_setting('app.tenant_id')::UUID
        `).catch(() => ({ rows: [{ open_cases: '0', critical_cases: '0' }] })),
        // P2: Trend data — compara mes atual com mes anterior
        db.query<{
          entities_this_month: string; entities_last_month: string
          checklists_this_month: string; checklists_last_month: string
          cases_this_week: string; cases_last_week: string
        }>(`
          SELECT
            COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW())) AS entities_this_month,
            COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW() - INTERVAL '1 month')
                              AND created_at < date_trunc('month', NOW())) AS entities_last_month
          FROM entities
        `).then(async (entTrend) => {
          const [clTrend, caseTrend] = await Promise.all([
            db.query<{ checklists_this_month: string; checklists_last_month: string }>(`
              SELECT
                COUNT(*) FILTER (WHERE completed_at >= date_trunc('month', NOW())) AS checklists_this_month,
                COUNT(*) FILTER (WHERE completed_at >= date_trunc('month', NOW() - INTERVAL '1 month')
                                  AND completed_at < date_trunc('month', NOW())) AS checklists_last_month
              FROM checklist_runs WHERE status = 'COMPLETED'
            `),
            db.query<{ cases_this_week: string; cases_last_week: string }>(`
              SELECT
                COUNT(*) FILTER (WHERE created_at >= date_trunc('week', NOW())) AS cases_this_week,
                COUNT(*) FILTER (WHERE created_at >= date_trunc('week', NOW() - INTERVAL '1 week')
                                  AND created_at < date_trunc('week', NOW())) AS cases_last_week
              FROM alert_cases
              WHERE tenant_id = current_setting('app.tenant_id')::UUID
            `).catch(() => ({ rows: [{ cases_this_week: '0', cases_last_week: '0' }] })),
          ])
          return {
            rows: [{
              ...entTrend.rows[0],
              ...clTrend.rows[0],
              ...caseTrend.rows[0],
            }]
          }
        }).catch(() => ({
          rows: [{
            entities_this_month: '0', entities_last_month: '0',
            checklists_this_month: '0', checklists_last_month: '0',
            cases_this_week: '0', cases_last_week: '0',
          }]
        })),
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
      const trend_ = trendStats?.rows[0] ?? {
        entities_this_month: '0', entities_last_month: '0',
        checklists_this_month: '0', checklists_last_month: '0',
        cases_this_week: '0', cases_last_week: '0',
      }

      // Calcular deltas de trend
      const trendDelta = (curr: string, prev: string) => {
        const c = Number(curr), p = Number(prev)
        const delta = c - p
        const dir = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
        const pct = p === 0 ? null : Math.round(Math.abs(delta / p) * 100)
        return { delta, dir, pct }
      }

      const summary = {
        entities: {
          total: totalEntities,
          byRisk,
          active: totalEntities,
          blocked: byRisk['UNKNOWN'] ?? 0,
          trend: trendDelta(String(totalEntities), trend_.entities_last_month ?? '0'),
        },
        checklists: {
          overdue: Number(cs.overdue),
          dueSoon: Number(cs.due_soon),
          completedThisMonth: Number(cs.completed_this_month),
          inProgress: Number(cs.in_progress),
          trend: trendDelta(trend_.checklists_this_month ?? '0', trend_.checklists_last_month ?? '0'),
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
          trend: trendDelta(trend_.cases_this_week ?? '0', trend_.cases_last_week ?? '0'),
        },
        recentActivities: recentAudit.rows,
        criticalEntities: criticalList.rows,
        lastUpdated: new Date().toISOString(),
      }

      // Cache por 60s
      await cache.set(cacheKey, summary, 60)

      return reply.send({ data: summary })
    },
  })

  // GET /v1/dashboard/stream — P2: SSE para push de updates em tempo real
  fastify.get('/stream', {
    preHandler: [authMiddleware, tenantMiddleware],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const tenantId = request.tenantId

      reply.raw.setHeader('Content-Type', 'text/event-stream')
      reply.raw.setHeader('Cache-Control', 'no-cache')
      reply.raw.setHeader('Connection', 'keep-alive')
      reply.raw.setHeader('X-Accel-Buffering', 'no')
      reply.raw.flushHeaders()

      const send = (event: string, data: object) => {
        reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
      }

      // Envia o estado inicial imediatamente
      const initialCached = await cache.get<object>(cache.keys.tenantDashboard(tenantId))
      if (initialCached) {
        send('summary', initialCached)
      }
      send('connected', { tenantId, timestamp: new Date().toISOString() })

      // Polling interno a cada 30s para detectar mudanças e notificar o cliente
      let lastHash = JSON.stringify(initialCached ?? {})
      const interval = setInterval(async () => {
        try {
          const fresh = await cache.get<object>(cache.keys.tenantDashboard(tenantId))
          const freshHash = JSON.stringify(fresh ?? {})
          if (freshHash !== lastHash) {
            lastHash = freshHash
            send('summary', fresh ?? {})
          } else {
            // Heartbeat para manter conexão viva
            send('heartbeat', { timestamp: new Date().toISOString() })
          }
        } catch { /* ignora erros de Redis na stream */ }
      }, 30_000)

      // Limpa ao desconectar
      request.raw.on('close', () => clearInterval(interval))
      request.raw.on('end', () => clearInterval(interval))

      // Mantém o handler aberto (sem chamar reply.send)
      return new Promise<void>(() => { })
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
