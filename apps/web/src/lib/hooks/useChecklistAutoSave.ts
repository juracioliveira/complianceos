'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useDebounce } from 'use-debounce'

interface UseChecklistAutoSaveProps {
    checklistId: string
    data: any
    onSave: (id: string, data: any) => Promise<void>
    enabled?: boolean
}

export function useChecklistAutoSave({
    checklistId,
    data,
    onSave,
    enabled = true
}: UseChecklistAutoSaveProps) {
    const [debouncedData] = useDebounce(data, 1500)
    const lastSavedData = useRef<string | null>(null)

    const saveData = useCallback(async () => {
        if (!enabled || !checklistId) return

        const currentDataString = JSON.stringify(debouncedData)
        if (currentDataString === lastSavedData.current) return

        try {
            console.log(`[AutoSave] Persistindo progresso do checklist ${checklistId}...`)
            await onSave(checklistId, debouncedData)
            lastSavedData.current = currentDataString
        } catch (error) {
            console.error('[AutoSave] Erro ao salvar progresso:', error)
            // Opcional: Implementar retry logic ou toast de erro silencioso
        }
    }, [checklistId, debouncedData, onSave, enabled])

    useEffect(() => {
        saveData()
    }, [saveData])

    return {
        isSaving: JSON.stringify(data) !== lastSavedData.current && enabled
    }
}
