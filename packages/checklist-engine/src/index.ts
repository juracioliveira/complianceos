export interface ChecklistItem {
    id: string
    question: string
    category: string
    regulationRef?: string
    helpText?: string
    answerType: 'BOOLEAN' | 'SCALE' | 'MULTIPLE_CHOICE' | 'TEXT'
    required: boolean
    weight: number
    options?: string[] | { label: string; score: number }[]
    evidenceRequired?: boolean
}

export interface ChecklistResponse {
    itemId: string
    value: any
}

export class ChecklistEngine {
    /**
     * Valida se todas as respostas obrigatórias foram preenchidas.
     */
    static validate(items: ChecklistItem[], responses: ChecklistResponse[]): { valid: boolean; missing: string[] } {
        const missing = items
            .filter(item => item.required && !responses.find(r => r.itemId === item.id))
            .map(item => item.id)

        return {
            valid: missing.length === 0,
            missing
        }
    }

    /**
     * Extrai os scores das respostas para serem processados pelo ScoringEngine.
     */
    static extractScoringFactors(items: ChecklistItem[], responses: ChecklistResponse[]) {
        return responses.map(resp => {
            const item = items.find(i => i.id === resp.itemId)
            if (!item) return null

            let score = 0
            if (item.answerType === 'MULTIPLE_CHOICE' && Array.isArray(item.options)) {
                // Se for array de strings (sem score explícito), calcular baseado na posição ou deixar 0
                const optionIndex = item.options.indexOf(resp.value)
                score = optionIndex >= 0 ? (optionIndex / (item.options.length - 1)) * 10 : 0
            } else if (item.answerType === 'BOOLEAN') {
                score = resp.value === true ? 10 : 0
            } else if (item.answerType === 'SCALE') {
                score = Number(resp.value) || 0
            }

            return {
                id: item.id,
                label: item.question,
                weight: item.weight,
                score
            }
        }).filter(Boolean)
    }
}
