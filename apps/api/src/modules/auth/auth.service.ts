import { verify, hash as argonHash } from '@node-rs/argon2'
import { authenticator } from 'otplib'
import crypto from 'node:crypto'
import { cache } from '../../infra/redis.js'
import { AuthRepository } from './auth.repository.js'
import {
    UnauthorizedError,
    MfaRequiredError,
    BusinessRuleViolationError,
    NotFoundError,
    ComplianceOSError,
} from '@compliance-os/types'
import type { JwtPayload, ComplianceModule } from '@compliance-os/types'

interface LoginResult {
    accessToken: string
    refreshToken: string
    expiresIn: number
    user: {
        id: string
        name: string
        email: string
        role: string
        mfaEnabled: boolean
    }
    tenant: {
        id: string
        plan: string
        modules: string[]
    }
}

// ─── AES-256-GCM helpers ─────────────────────────────────────────────────────
const ALGO = 'aes-256-gcm'

function getEncryptionKey(): Buffer {
    const key = process.env['ENCRYPTION_KEY'] || process.env['MFA_ENCRYPTION_KEY']
    if (!key || key.length < 16) {
        throw new ComplianceOSError('CONFIG_ERROR', 'ENCRYPTION_KEY (ou MFA_ENCRYPTION_KEY) deve ter pelo menos 16 caracteres', 500)
    }
    // Use SHA-256 to derive a 32-byte key from the env var
    return crypto.createHash('sha256').update(key).digest()
}

function encryptSecret(plaintext: string): string {
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv(ALGO, getEncryptionKey(), iv)
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
    const authTag = cipher.getAuthTag()
    // Format: iv(hex):authTag(hex):ciphertext(hex)
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

function decryptSecret(ciphertext: string): string {
    const parts = ciphertext.split(':')
    if (parts.length !== 3) return ciphertext // backward compat (plain text fallback)
    const [ivHex, authTagHex, encryptedHex] = parts
    const iv = Buffer.from(ivHex!, 'hex')
    const authTag = Buffer.from(authTagHex!, 'hex')
    const encrypted = Buffer.from(encryptedHex!, 'hex')
    const decipher = crypto.createDecipheriv(ALGO, getEncryptionKey(), iv)
    decipher.setAuthTag(authTag)
    return decipher.update(encrypted).toString('utf8') + decipher.final('utf8')
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class AuthService {
    constructor(
        private readonly authRepo: AuthRepository,
        private readonly signToken: (payload: JwtPayload) => string,
        private readonly signRefreshToken: (payload: { sub: string }) => string,
    ) { }

    async login(email: string, password: string, mfaCode: string | undefined, clientIp: string): Promise<LoginResult> {
        const user = await this.authRepo.findUserByEmail(email)

        if (!user) {
            await this.constantTimeDelay()
            throw new UnauthorizedError('Credenciais inválidas')
        }

        if (user.lockedUntil && user.lockedUntil > new Date()) {
            const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000)
            throw new BusinessRuleViolationError(`Conta bloqueada por ${minutesLeft} minuto(s) devido a múltiplas tentativas falhas`)
        }

        const passwordValid = await verify(user.passwordHash, password)

        if (!passwordValid) {
            await this.authRepo.incrementFailedAttempts(user.id)
            throw new UnauthorizedError('Credenciais inválidas')
        }

        if (user.mfaEnabled) {
            if (!mfaCode) throw new MfaRequiredError()

            const secret = decryptSecret(user.mfaSecret ?? '')
            const isValidTotp = authenticator.check(mfaCode, secret)

            if (!isValidTotp) {
                await this.authRepo.incrementFailedAttempts(user.id)
                throw new UnauthorizedError('Código MFA inválido')
            }
        }

        await this.authRepo.resetFailedAttempts(user.id, clientIp)
        return this._issueTokens(user)
    }

    async refresh(oldRefreshTokenRaw: string, userId: string): Promise<LoginResult> {
        const user = await this.authRepo.findUserById(userId)

        if (!user) throw new UnauthorizedError('Usuário não encontrado')
        if (user.status === 'INACTIVE') throw new UnauthorizedError('Usuário inativo')
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw new BusinessRuleViolationError('Conta bloqueada temporariamente')
        }

        const redisKey = `refresh_token:${userId}:${oldRefreshTokenRaw.slice(-16)}`
        const isValid = await cache.get(redisKey)
        if (!isValid) throw new UnauthorizedError('Refresh token revogado, expirado ou inválido')

        await cache.del(redisKey)
        return this._issueTokens(user)
    }

    async logout(userId: string): Promise<void> {
        await cache.delPattern(`refresh_token:${userId}:*`)
    }

    async getMe(userId: string) {
        return this.authRepo.findUserById(userId)
    }

    // ─── MFA ──────────────────────────────────────────────────────────────────

    async setupMfa(userId: string): Promise<{ secret: string; otpauthUrl: string; qrCodeUrl: string }> {
        const user = await this.authRepo.findUserById(userId)
        if (!user) throw new NotFoundError('Usuário')

        const secret = authenticator.generateSecret()
        const encryptedSecret = encryptSecret(secret)

        // Save encrypted secret temporarily (not enabled yet — user must confirm first)
        await this.authRepo.updateUser(userId, { mfaSecret: encryptedSecret })

        const otpauthUrl = authenticator.keyuri(user.email, 'ComplianceOS', secret)
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`

        return { secret, otpauthUrl, qrCodeUrl }
    }

    async confirmMfa(userId: string, code: string): Promise<{ backupCodes: string[] }> {
        const user = await this.authRepo.findUserByEmail('') // needs findUserById with mfaSecret
        const fullUser = await this.authRepo.findUserById(userId) as any
        if (!fullUser?.mfaSecret) {
            throw new ComplianceOSError('MFA_NOT_SETUP', 'Configure o MFA antes de confirmar', 400)
        }

        // We need the raw mfaSecret — findUserById doesn't return it, so we fetch it directly
        const userWithSecret = await this.authRepo.findUserByEmail(fullUser.email)
        if (!userWithSecret?.mfaSecret) throw new ComplianceOSError('MFA_NOT_SETUP', 'Configure o MFA antes de confirmar', 400)

        const secret = decryptSecret(userWithSecret.mfaSecret)
        if (!authenticator.check(code, secret)) {
            throw new UnauthorizedError('Código TOTP inválido. Verifique o horário do seu dispositivo.')
        }

        const backupCodes = Array.from({ length: 8 }, () => crypto.randomBytes(4).toString('hex').toUpperCase())

        await this.authRepo.updateUser(userId, {
            mfaEnabled: true,
            mfaBackupCodes: backupCodes,
        })

        return { backupCodes }
    }

    async disableMfa(userId: string, password: string): Promise<void> {
        const userById = await this.authRepo.findUserById(userId) as any
        const userWithHash = await this.authRepo.findUserByEmail(userById?.email ?? '')
        if (!userWithHash) throw new NotFoundError('Usuário')

        const passwordValid = await verify(userWithHash.passwordHash, password)
        if (!passwordValid) throw new UnauthorizedError('Senha incorreta')

        await this.authRepo.updateUser(userId, {
            mfaEnabled: false,
            mfaSecret: null,
            mfaBackupCodes: null,
        })
    }

    // ─── Password Reset ────────────────────────────────────────────────────────

    async forgotPassword(email: string): Promise<void> {
        const user = await this.authRepo.findUserByEmail(email)
        // Always succeed — don't leak whether email exists
        if (!user) return

        const token = crypto.randomBytes(32).toString('hex')
        await cache.set(`password_reset:${token}`, { userId: user.id }, 3600) // 1h TTL

        // TODO: send email with token
        // For now, log it (development only)
        if (process.env['NODE_ENV'] !== 'production') {
            console.log(`[DEV] Password reset token for ${email}: ${token}`)
        }
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        const data = await cache.get<{ userId: string }>(`password_reset:${token}`)
        if (!data) throw new UnauthorizedError('Token de recuperação inválido ou expirado')

        const passwordHash = await argonHash(newPassword)
        await this.authRepo.updateUser(data.userId, { passwordHash })
        await cache.del(`password_reset:${token}`)
        // Revoke all sessions
        await cache.delPattern(`refresh_token:${data.userId}:*`)
    }

    // ─── Accept Invite ─────────────────────────────────────────────────────────

    async acceptInvite(token: string, name: string, password: string): Promise<LoginResult> {
        const user = await this.authRepo.findByInviteToken(token)
        if (!user) throw new UnauthorizedError('Convite inválido ou expirado')

        const passwordHash = await argonHash(password)

        await this.authRepo.updateUser(user!.id, {
            passwordHash,
            status: 'ACTIVE',
            inviteToken: null,
            inviteExpires: null,
            ...(name ? {} : {}),
        })

        return this._issueTokens({ ...user!, status: 'ACTIVE' as any })
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private async _issueTokens(user: any): Promise<LoginResult> {
        const payload: JwtPayload = {
            sub: user.id,
            tenantId: user.tenantId,
            role: user.role,
            plan: user.tenantPlan as JwtPayload['plan'],
            modules: user.tenantModules as ComplianceModule[],
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + Number(process.env['JWT_ACCESS_TOKEN_EXPIRY'] ?? 900),
        }

        const accessToken = this.signToken(payload)
        const refreshToken = this.signRefreshToken({ sub: user.id })

        const tokenTtl = Number(process.env['JWT_REFRESH_TOKEN_EXPIRY'] ?? 604_800)
        await cache.set(
            `refresh_token:${user.id}:${refreshToken.slice(-16)}`,
            { userId: user.id, tenantId: user.tenantId },
            tokenTtl,
        )

        return {
            accessToken,
            refreshToken,
            expiresIn: Number(process.env['JWT_ACCESS_TOKEN_EXPIRY'] ?? 900),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                mfaEnabled: user.mfaEnabled,
            },
            tenant: {
                id: user.tenantId,
                plan: user.tenantPlan,
                modules: user.tenantModules,
            },
        }
    }

    private async constantTimeDelay(): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 100))
    }
}
