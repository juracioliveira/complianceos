import { ChecklistsRepository } from '../repositories/checklists.repository.js'
import { ChecklistEngine } from '@compliance-os/checklist-engine'
import { queue } from '../../../infra/queue.js'
import { ComplianceOSError } from '../../../shared/errors.js'

export class ChecklistsService {
    constructor(private checklistsRepository: ChecklistsRepository) { }

    async completeChecklist(runId: string, tenantId: string) {
        const run = await this.checklistsRepository.findRunById(runId, tenantId)
        if (!run) throw new ComplianceOSError('RUN_NOT_FOUND', 'Execução de checklist não encontrada.')

        const template = await this.checklistsRepository.findTemplateById(run.checklistId, tenantId)
        if (!template) throw new ComplianceOSError('TEMPLATE_NOT_FOUND', 'Template de checklist não encontrado.')

        // Validação via Engine
        const { valid, missing } = ChecklistEngine.validate(template.items as any, run.responses as any)
        if (!valid) {
            throw new ComplianceOSError('VALIDATION_FAILED', `Items obrigatórios pendentes: ${missing.join(', ')}`)
        }

        // Extração de fatores para o Scoring Engine
        const factors = ChecklistEngine.extractScoringFactors(template.items as any, run.responses as any)

        // Atualizar status no banco
        await this.checklistsRepository.updateRunStatus(runId, tenantId, 'COMPLETED')

        // Disparar Worker de Risco
        await queue.add('RISK_SCORING', {
            entityId: run.entityId,
            tenantId,
            factors
        })

        return { success: true, message: 'Checklist concluído e cálculo de risco disparado.' }
    }
}
