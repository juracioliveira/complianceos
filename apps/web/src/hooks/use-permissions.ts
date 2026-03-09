'use client'

import { useAuth } from '@/lib/contexts/AuthContext'
import { Action, Resource, UserRole, ROLE_LABELS } from '@/lib/rbac/permissions'
import { can as verifyCan } from '@/lib/rbac/guards'

export function usePermissions() {
    const { user, isLoading } = useAuth()
    const role = user?.role as UserRole | undefined

    /**
     * Verifica se o usuário atual tem permissão para uma ação
     */
    const can = (action: Action, resource: Resource): boolean => {
        if (isLoading || !role) return false
        return verifyCan(role, action, resource)
    }

    return {
        can,
        role,
        roleLabel: role ? ROLE_LABELS[role] : 'Desconhecido',
        isLoading,
        user
    }
}
