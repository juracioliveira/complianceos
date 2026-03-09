'use client'

import React from 'react'
import { Action, Resource } from '@/lib/rbac/permissions'
import { usePermissions } from '@/hooks/use-permissions'

interface ProtectedActionProps {
    action: Action
    resource: Resource
    children: React.ReactNode
    fallback?: React.ReactNode
    mode?: 'hide' | 'disable'
}

/**
 * Componente Wrapper para proteger ações da UI (botões, links, etc).
 * Esconde ou desabilita o conteúdo conforme a permissão do usuário.
 */
export function ProtectedAction({
    action,
    resource,
    children,
    fallback = null,
    mode = 'hide'
}: ProtectedActionProps) {
    const { can, isLoading } = usePermissions()

    if (isLoading) return null

    const hasPermission = can(action, resource)

    if (!hasPermission) {
        if (mode === 'hide') return fallback

        // Modo disable: clona o elemento filho e adiciona as props de desabilitação
        if (React.isValidElement(children)) {
            return React.cloneElement(children as React.ReactElement<any>, {
                disabled: true,
                'aria-disabled': true,
                className: `${children.props.className || ''} opacity-50 cursor-not-allowed pointer-events-none`.trim(),
                title: 'Você não tem permissão para realizar esta ação'
            })
        }
    }

    return <>{children}</>
}
