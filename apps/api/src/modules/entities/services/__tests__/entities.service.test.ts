import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EntitiesService } from '../entities.service'
import { EntitiesRepository } from '../../repositories/entities.repository'
import { ComplianceOSError } from '../../../../shared/errors'

describe('EntitiesService', () => {
    let service: EntitiesService
    let mockRepo: any

    beforeEach(() => {
        mockRepo = {
            findByTaxId: vi.fn(),
            create: vi.fn(),
            findById: vi.fn(),
            listByTenant: vi.fn(),
            approveRisk: vi.fn(),
            update: vi.fn(),
        }
        service = new EntitiesService(mockRepo as any)
    })

    describe('createEntity', () => {
        it('should throw ComplianceOSError if entity already exists with same CNPJ/CPF', async () => {
            mockRepo.findByTaxId.mockResolvedValueOnce({ id: '123' })

            await expect(service.createEntity('t1', 'u1', { name: 'Test', entityType: 'PJ', cnpj: '111' }))
                .rejects.toThrow(ComplianceOSError)
        })

        it('should create entity if it does not exist', async () => {
            mockRepo.findByTaxId.mockResolvedValueOnce(null)
            const newEntity = { id: 'new-id' }
            mockRepo.create.mockResolvedValueOnce(newEntity)

            const result = await service.createEntity('tenant', 'user-1', {
                name: 'Test Entity',
                entityType: 'COMPANY',
                cnpj: '00000000000000'
            })

            expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({
                tenantId: 'tenant',
                name: 'Test Entity',
                status: 'ACTIVE'
            }))
            expect(result).toBe(newEntity)
        })
    })

    describe('approveRisk', () => {
        it('should throw ComplianceOSError (SoD Violation) if approver is the same as the last modifier', async () => {
            mockRepo.findById.mockResolvedValueOnce({
                id: 'e1',
                lastRiskUpdateBy: 'user-id-same'
            })

            await expect(service.approveRisk('e1', 't1', 'user-id-same')).rejects.toThrow('Violação de Segregação de Funções')
        })

        it('should approve risk successfully if different user', async () => {
            mockRepo.findById.mockResolvedValueOnce({
                id: 'e1',
                lastRiskUpdateBy: 'user-id-other'
            })
            mockRepo.approveRisk.mockResolvedValueOnce(true)

            await service.approveRisk('e1', 't1', 'user-id-same')
            expect(mockRepo.approveRisk).toHaveBeenCalledWith('e1', 't1', 'user-id-same')
        })
    })

    describe('syncKybData', () => {
        it('should throw if internal API key is not mapped (simulated by missing env, though mocked globally we can force it)', async () => {
            mockRepo.findById.mockResolvedValueOnce({
                id: 'e1',
                cnpj: '123'
            })

            // Setup mock env internal key deletion
            const originalKey = process.env.INTERNAL_API_KEY
            delete process.env.INTERNAL_API_KEY

            await expect(service.syncKybData('e1', 't1')).rejects.toThrow('A chave interna de API não está configurada')

            process.env.INTERNAL_API_KEY = originalKey // restore
        })
    })

    describe('startAutomatedDueDiligence', () => {
        it('should sync kyb and then add to queue', async () => {
            const entity = { id: 'e1', cnpj: '123', name: 'Test' }
            mockRepo.findById.mockResolvedValue(entity)

            // Mock fetch for syncKybData
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ razao_social: 'Test Corp' })
            })
            global.fetch = mockFetch as any

            mockRepo.update.mockResolvedValueOnce({ ...entity, name: 'Test Corp' })

            const result = await service.startAutomatedDueDiligence('e1', 't1', 'u1')

            expect(result.success).toBe(true)
            expect(result.queued).toBe(true)
        })
    })
})
