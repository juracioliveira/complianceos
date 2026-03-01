import { riskScoringWorker } from './risk-scoring.worker.js'
import { documentGenerationWorker } from './document-generation.worker.js'

export function initWorkers() {
    console.log('🚀 [Workers] Inicializando workers do BullMQ...')

    // As instâncias já foram criadas na importação, 
    // mas exportamos uma função para garantir que o arquivo seja carregado.
    return {
        riskScoringWorker,
        documentGenerationWorker
    }
}
