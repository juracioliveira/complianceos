import { Queue } from 'bullmq'
import { redis } from './redis.js'

export const QUEUE_NAMES = {
    DOCUMENT_GENERATION: process.env['QUEUE_DOCUMENT_GENERATION'] ?? 'document-generation',
    RISK_SCORING: process.env['QUEUE_RISK_SCORING'] ?? 'risk-scoring',
    NOTIFICATIONS: process.env['QUEUE_NOTIFICATIONS'] ?? 'notifications',
    KYB: process.env['QUEUE_KYB'] ?? 'kyb-validation',
} as const

// Unified Queue proxy/instance for simpler imports
export const queue = {
    add: async (name: keyof typeof QUEUE_NAMES, data: any) => {
        const q = new Queue(QUEUE_NAMES[name], { connection: redis as any })
        return q.add(name, data)
    }
}

export const documentGenerationQueue = new Queue(QUEUE_NAMES.DOCUMENT_GENERATION, { connection: redis as any })
export const riskScoringQueue = new Queue(QUEUE_NAMES.RISK_SCORING, { connection: redis as any })
