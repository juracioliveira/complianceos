'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useDebounce } from 'use-debounce'
import { useApi } from '@/hooks/useApi'

interface UseChecklistAutoSaveProps {
    checklistId: string
    data: any
    onSave?: (id: string, data: any) => Promise<void>
    enabled?: boolean
}

export function useChecklistAutoSave({
    checklistId,
    data,
    onSave,
    enabled = true
}: UseChecklistAutoSaveProps) {
    const { fetchWithAuth } = useApi()
    const [debouncedData] = useDebounce(data, 1500)
    const lastSavedData = useRef<string | null>(null)

    const saveData = useCallback(async () => {
        if (!enabled || !checklistId) return

        const currentDataString = JSON.stringify(debouncedData)
        if (currentDataString === lastSavedData.current) return

        try {
            console.log(`[AutoSave] Persistindo progresso do checklist ${checklistId}...`)

            if (onSave) {
                await onSave(checklistId, debouncedData)
            } else {
                // Call real endpoint if onSave is not overridden
                await fetchWithAuth(`/v1/checklist-runs/${checklistId}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ answers: debouncedData }) // Send answers
                })
            }
            lastSavedData.current = currentDataString
        } catch (error) {
            console.error('[AutoSave] Erro ao salvar progresso:', error)
        }
    }, [checklistId, debouncedData, onSave, enabled, fetchWithAuth])

    useEffect(() => {
        saveData()
    }, [saveData])

    return {
        isSaving: JSON.stringify(data) !== lastSavedData.current && enabled
    }
}
