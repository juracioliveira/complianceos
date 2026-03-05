import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from '../auth.service'
import { UnauthorizedError, BusinessRuleViolationError, MfaRequiredError } from '@compliance-os/types'
import { verify } from '@node-rs/argon2'
import { cache } from '../../../infra/redis'
import { AuthRepository } from '../auth.repository'

vi.mock('../auth.repository')
vi.mock('@node-rs/argon2', () => ({
    verify: vi.fn()
}))
vi.mock('otplib', () => ({
    authenticator: {
        check: vi.fn()
    }
}))

// Re-vamp the cache mock to be sure it's working
vi.mock('../../../infra/redis', () => ({
    cache: {
        get: vi.fn(),
        set: vi.fn(),
        del: vi.fn(),
        delPattern: vi.fn(),
        keys: {
            refreshToken: (th: string) => `refresh_token:${th}`
        }
    }
}))

describe('AuthService', () => {
    let service: AuthService
    let mockRepo: any
    let signTokenMock: any
    let signRefreshTokenMock: any

    beforeEach(() => {
        vi.clearAllMocks()

        mockRepo = {
            findUserByEmail: vi.fn(),
            findUserById: vi.fn(),
            incrementFailedAttempts: vi.fn().mockResolvedValue(undefined),
            resetFailedAttempts: vi.fn().mockResolvedValue(undefined)
        }

        signTokenMock = vi.fn().mockReturnValue('mock-access-token')
        signRefreshTokenMock = vi.fn().mockReturnValue('mock-refresh-token')

        service = new AuthService(
            mockRepo as unknown as AuthRepository,
            signTokenMock,
            signRefreshTokenMock
        )
    })

    describe('login', () => {
        it('should throw UnauthorizedError on non-existing user', async () => {
            mockRepo.findUserByEmail.mockResolvedValueOnce(null)

            await expect(service.login('test@test.com', 'pwd', undefined, '127.0.0.1')).rejects.toThrow(UnauthorizedError)
        })

        it('should throw BusinessRule on locked account', async () => {
            mockRepo.findUserByEmail.mockResolvedValueOnce({
                lockedUntil: new Date(Date.now() + 100000)
            })

            await expect(service.login('test@test.com', 'pwd', undefined, '127.0.0.1')).rejects.toThrow(BusinessRuleViolationError)
        })

        it('should throw MFA error if MFA enabled but no code', async () => {
            mockRepo.findUserByEmail.mockResolvedValueOnce({
                id: 'u1',
                passwordHash: 'hash',
                mfaEnabled: true
            })
            vi.mocked(verify).mockResolvedValueOnce(true)

            await expect(service.login('test@test.com', 'pwd', undefined, '127.0.0.1')).rejects.toThrow(MfaRequiredError)
        })

        it('should generate tokens and set blocklist when successful', async () => {
            mockRepo.findUserByEmail.mockResolvedValueOnce({
                id: 'u1',
                role: 'ADMIN',
                passwordHash: 'hash',
                mfaEnabled: false,
                tenantId: 't1',
                tenantPlan: 'FREE',
                tenantModules: []
            })
            vi.mocked(verify).mockResolvedValueOnce(true)
            vi.mocked(cache.set).mockResolvedValue('OK' as any)

            const result = await service.login('test@test.com', 'pwd', undefined, '127.0.0.1')

            expect(result.accessToken).toBe('mock-access-token')
            expect(cache.set).toHaveBeenCalled()
        })
    })

    describe('refresh', () => {
        it('should rotate token if valid', async () => {
            mockRepo.findUserById.mockResolvedValueOnce({
                id: 'u1',
                status: 'ACTIVE',
                tenantId: 't1',
                tenantPlan: 'FREE',
                tenantModules: []
            })

            vi.mocked(cache.get).mockResolvedValueOnce({ userId: 'u1' })
            vi.mocked(cache.del).mockResolvedValue(1 as any)
            vi.mocked(cache.set).mockResolvedValue('OK' as any)

            const result = await service.refresh('old-token-raw', 'u1')

            expect(cache.del).toHaveBeenCalled()
            expect(cache.set).toHaveBeenCalled()
            expect(result.accessToken).toBe('mock-access-token')
        })

        it('should reject rotate if cache empty (blocklist effect)', async () => {
            mockRepo.findUserById.mockResolvedValueOnce({
                id: 'u1',
                status: 'ACTIVE'
            })

            vi.mocked(cache.get).mockResolvedValueOnce(null)

            await expect(service.refresh('intercepted-token', 'u1')).rejects.toThrow(UnauthorizedError)
        })
    })
})
