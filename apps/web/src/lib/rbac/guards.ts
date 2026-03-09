import { Action, Resource, UserRole, PERMISSIONS } from './permissions'

/**
 * Verifica se um role tem permissão para uma ação em um recurso
 */
export function can(role: UserRole | string | undefined, action: Action, resource: Resource): boolean {
    if (!role) return false

    const permissions = PERMISSIONS[role as UserRole]
    if (!permissions) return false

    return permissions[resource]?.includes(action) ?? false
}

/**
 * Erro customizado para acesso negado
 */
export class ForbiddenError extends Error {
    constructor(message = 'Acesso não autorizado') {
        super(message)
        this.name = 'ForbiddenError'
    }
}

/**
 * Server Component Guard: Lança erro se o usuário não tiver o role necessário
 */
export function requireRole(userRole: UserRole | string | undefined, allowedRoles: UserRole[]) {
    if (!userRole || !allowedRoles.includes(userRole as UserRole)) {
        throw new ForbiddenError(`Seu perfil (${userRole}) não tem permissão para acessar esta área.`)
    }
}

/**
 * Server Component Guard: Lança erro se o usuário não tiver a permissão necessária
 */
export function requirePermission(userRole: UserRole | string | undefined, action: Action, resource: Resource) {
    if (!can(userRole, action, resource)) {
        throw new ForbiddenError(`Seu perfil (${userRole}) não tem permissão para '${action}' em '${resource}'.`)
    }
}

/**
 * Mapa de Rotas -> Roles Permitidos para o Middleware
 */
export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
    '/dashboard': ['ADMIN', 'COMPLIANCE_OFFICER', 'ANALYST', 'AUDITOR', 'READONLY'],
    '/entities': ['ADMIN', 'COMPLIANCE_OFFICER', 'ANALYST', 'AUDITOR', 'READONLY'],
    '/checklists': ['ADMIN', 'COMPLIANCE_OFFICER', 'ANALYST', 'AUDITOR'],
    '/checklist-runs': ['ADMIN', 'COMPLIANCE_OFFICER', 'ANALYST', 'AUDITOR'],
    '/alert-cases': ['ADMIN', 'COMPLIANCE_OFFICER', 'ANALYST', 'AUDITOR'],
    '/documents': ['ADMIN', 'COMPLIANCE_OFFICER', 'AUDITOR'],
    '/audit': ['ADMIN', 'AUDITOR'],
    '/settings/users': ['ADMIN'],
    '/settings': ['ADMIN'],
}

/**
 * Verifica acesso de rota para o middleware
 */
export function hasRouteAccess(role: UserRole | string | undefined, path: string): boolean {
    if (!role) return false

    // Encontrar a regra mais específica (prefix match)
    const entry = Object.entries(ROUTE_PERMISSIONS)
        .sort((a, b) => b[0].length - a[0].length)
        .find(([route]) => path.startsWith(route))

    if (!entry) return true // Se não estiver mapeado, assume-se público ou padrão logado

    return entry[1].includes(role as UserRole)
}
