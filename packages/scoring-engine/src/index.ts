export interface ScoringFactor {
    id: string
    label: string
    weight: number
    score: number
}

export class ScoringEngine {
    /**
     * Calcula o score ponderado (0-100)
     * Score = (Soma(score * peso) / Soma(pesos)) * 20 (para escala 100)
     */
    static calculate(factors: ScoringFactor[]): { score: number; level: string } {
        if (factors.length === 0) return { score: 0, level: 'UNKNOWN' }

        const totalWeight = factors.reduce((acc, f) => acc + f.weight, 0)
        const weightedSum = factors.reduce((acc, f) => acc + (f.score * f.weight), 0)

        const rawScore = (weightedSum / totalWeight)
        const percentScore = Math.min(100, Math.round(rawScore * 20))

        return {
            score: percentScore,
            level: this.getLevel(percentScore)
        }
    }

    private static getLevel(score: number): string {
        if (score >= 80) return 'CRITICAL'
        if (score >= 60) return 'HIGH'
        if (score >= 40) return 'MEDIUM'
        if (score > 0) return 'LOW'
        return 'UNKNOWN'
    }
}
