import { getDb } from '../../infra/db/db.js'
import { users, tenants } from '../../infra/db/schema.js'
import { eq, and, sql, ne } from 'drizzle-orm'
import type { User } from '@compliance-os/types'

export class AuthRepository {
    async findUserByEmail(email: string) {
        // Usando direct SQL driver or Drizzle
        // Para manter compatibilidade com o join complexo atual e retorno de User estendido:
        const result = await getDb().execute(sql`
            SELECT 
                u.*, 
                t.plan AS tenant_plan, 
                t.settings->>'modules' AS tenant_modules
            FROM users u
            JOIN tenants t ON t.id = u.tenant_id
            WHERE u.email = ${email.toLowerCase()}
                AND u.status != 'INACTIVE'
                AND t.status = 'ACTIVE'
            LIMIT 1
        `)

        const row = result.rows[0] as any
        if (!row) return null

        return {
            id: row.id,
            tenantId: row.tenant_id,
            email: row.email,
            name: row.name,
            passwordHash: row.password_hash,
            role: row.role as User['role'],
            status: row.status as User['status'],
            mfaEnabled: row.mfa_enabled,
            mfaSecret: row.mfa_secret,
            mfaBackupCodes: row.mfa_backup_codes,
            failedAttempts: row.failed_attempts,
            lockedUntil: row.locked_until ? new Date(row.locked_until) : null,
            lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : null,
            lastLoginIp: row.last_login_ip,
            inviteToken: row.invite_token,
            inviteExpires: row.invite_expires ? new Date(row.invite_expires) : null,
            invitedBy: row.invited_by,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
            tenantPlan: row.tenant_plan,
            tenantModules: JSON.parse(row.tenant_modules ?? '[]') as string[],
        }
    }

    async findUserById(id: string) {
        const result = await getDb().execute(sql`
            SELECT 
                u.*, 
                t.name AS tenant_name,
                t.plan AS tenant_plan, 
                t.settings->>'modules' AS tenant_modules
            FROM users u
            JOIN tenants t ON t.id = u.tenant_id
            WHERE u.id = ${id}
            LIMIT 1
        `)

        const row = result.rows[0] as any
        if (!row) return null

        return {
            id: row.id,
            tenantId: row.tenant_id,
            email: row.email,
            name: row.name,
            role: row.role as User['role'],
            status: row.status as User['status'],
            mfaEnabled: row.mfa_enabled,
            lockedUntil: row.locked_until ? new Date(row.locked_until) : null,
            tenantName: row.tenant_name,
            tenantPlan: row.tenant_plan,
            tenantModules: JSON.parse(row.tenant_modules ?? '[]') as string[],
        }
    }

    async incrementFailedAttempts(userId: string) {
        const result = await getDb().execute(sql`
            UPDATE users
            SET failed_attempts = failed_attempts + 1,
                locked_until = CASE
                    WHEN failed_attempts + 1 >= 5 THEN NOW() + INTERVAL '15 minutes'
                    ELSE locked_until
                END
            WHERE id = ${userId}
            RETURNING failed_attempts
        `)
        return (result.rows[0] as any)?.failed_attempts ?? 0
    }

    async resetFailedAttempts(userId: string, ip: string) {
        await getDb().execute(sql`
            UPDATE users
            SET failed_attempts = 0,
                locked_until = NULL,
                last_login_at = NOW(),
                last_login_ip = ${ip}
            WHERE id = ${userId}
        `)
    }
}
