export interface ChecklistItem {
    id: string
    type: 'select' | 'boolean' | 'text'
    required: boolean
    weight: number
    options?: { label: string; score: number }[]
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
            if (item.type === 'select' && item.options) {
                const option = item.options.find(opt => opt.label === resp.value)
                score = option?.score ?? 0
            } else if (item.type === 'boolean') {
                score = resp.value === true ? 5 : 0 // Exemplo: true = risco alto
            }

            return {
                id: item.id,
                label: `Item ${item.id}`,
                weight: item.weight,
                score
            }
        }).filter(Boolean)
    }
}
