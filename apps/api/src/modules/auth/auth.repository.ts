import { getDb } from '../../infra/db/db.js'
import { users, tenants } from '../../infra/db/schema.js'
import { eq, and, sql } from 'drizzle-orm'
import type { User } from '@compliance-os/types'

export class AuthRepository {
    async findUserByEmail(email: string) {
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

        return this._mapRow(row)
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
            ...this._mapRow(row),
            tenantName: row.tenant_name,
        }
    }

    async findByInviteToken(token: string) {
        const result = await getDb().execute(sql`
            SELECT u.*, t.plan AS tenant_plan, t.settings->>'modules' AS tenant_modules
            FROM users u
            JOIN tenants t ON t.id = u.tenant_id
            WHERE u.invite_token = ${token}
              AND u.invite_expires > NOW()
              AND u.status = 'INACTIVE'
            LIMIT 1
        `)
        const row = result.rows[0] as any
        if (!row) return null
        return this._mapRow(row)
    }

    async updateUser(userId: string, data: {
        mfaEnabled?: boolean
        mfaSecret?: string | null
        mfaBackupCodes?: string[] | null
        passwordHash?: string
        inviteToken?: string | null
        inviteExpires?: Date | null
        status?: string
    }) {
        const sets: string[] = []
        const params: unknown[] = []
        let idx = 1

        if (data.mfaEnabled !== undefined) { sets.push(`mfa_enabled = $${idx++}`); params.push(data.mfaEnabled) }
        if (data.mfaSecret !== undefined) { sets.push(`mfa_secret = $${idx++}`); params.push(data.mfaSecret) }
        if (data.mfaBackupCodes !== undefined) { sets.push(`mfa_backup_codes = $${idx++}`); params.push(JSON.stringify(data.mfaBackupCodes)) }
        if (data.passwordHash !== undefined) { sets.push(`password_hash = $${idx++}`); params.push(data.passwordHash) }
        if (data.inviteToken !== undefined) { sets.push(`invite_token = $${idx++}`); params.push(data.inviteToken) }
        if (data.inviteExpires !== undefined) { sets.push(`invite_expires = $${idx++}`); params.push(data.inviteExpires) }
        if (data.status !== undefined) { sets.push(`status = $${idx++}`); params.push(data.status) }

        if (sets.length === 0) return

        sets.push(`updated_at = NOW()`)
        params.push(userId)

        await getDb().execute(
            sql.raw(`UPDATE users SET ${sets.join(', ')} WHERE id = $${idx}`)
        )
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

    private _mapRow(row: any) {
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
            tenantModules: (() => {
                try { return JSON.parse(row.tenant_modules ?? '[]') as string[] }
                catch { return [] }
            })(),
        }
    }
}
