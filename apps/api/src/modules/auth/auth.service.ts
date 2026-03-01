import { verify } from '@node-rs/argon2'
import { authenticator } from 'otplib'
import { cache } from '../../infra/redis.js'
import { AuthRepository } from './auth.repository.js'
import {
    UnauthorizedError,
    MfaRequiredError,
    BusinessRuleViolationError,
} from '@compliance-os/types'
import type { JwtPayload, ComplianceModule } from '@compliance-os/types'

const authRepo = new AuthRepository()

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

export class AuthService {
    constructor(
        private readonly signToken: (payload: JwtPayload) => string,
        private readonly signRefreshToken: (payload: { sub: string }) => string,
    ) { }

    async login(
        email: string,
        password: string,
        mfaCode: string | undefined,
        clientIp: string,
    ): Promise<LoginResult> {
        const user = await authRepo.findUserByEmail(email)

        if (!user) {
            await this.constantTimeDelay()
            throw new UnauthorizedError('Credenciais inválidas')
        }

        if (user.lockedUntil && user.lockedUntil > new Date()) {
            const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000)
            throw new BusinessRuleViolationError(
                `Conta bloqueada por ${minutesLeft} minuto(s) devido a múltiplas tentativas falhas`,
            )
        }

        const passwordValid = await verify(user.passwordHash, password)

        if (!passwordValid) {
            await authRepo.incrementFailedAttempts(user.id)
            throw new UnauthorizedError('Credenciais inválidas')
        }

        if (user.mfaEnabled) {
            if (!mfaCode) throw new MfaRequiredError()

            const secret = this.decryptMfaSecret(user.mfaSecret ?? '')
            const isValidTotp = authenticator.check(mfaCode, secret)

            if (!isValidTotp) {
                await authRepo.incrementFailedAttempts(user.id)
                throw new UnauthorizedError('Código MFA inválido')
            }
        }

        await authRepo.resetFailedAttempts(user.id, clientIp)

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

    async logout(userId: string): Promise<void> {
        await cache.delPattern(`refresh_token:${userId}:*`)
    }

    private decryptMfaSecret(encryptedSecret: string): string {
        return encryptedSecret
    }

    private async constantTimeDelay(): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 100))
    }
}
