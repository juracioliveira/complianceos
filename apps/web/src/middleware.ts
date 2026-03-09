import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { hasRouteAccess } from '@/lib/rbac/guards'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value
    // Assumindo que o role é passado via cookie para otimização do middleware
    // Se não, o middleware redirecionará apenas por autenticação
    const userRole = request.cookies.get('user_role')?.value
    const isAuthRoute = request.nextUrl.pathname.startsWith('/login')

    const publicRoutes = [
        '/',
        '/login',
        '/cobertura',
        '/docs',
        '/documentacao',
        '/lgpd',
        '/seguranca',
        '/privacidade',
        '/termos',
        '/cookies',
        '/contato'
    ]

    const pathname = request.nextUrl.pathname
    const normalizedPathname = pathname.length > 1 && pathname.endsWith('/')
        ? pathname.slice(0, -1)
        : pathname

    const isPublicRoute = publicRoutes.includes(normalizedPathname)

    // 1. Verificação de Autenticação
    if (!token && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (token && isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // 2. Verificação de RBAC (Se o role estiver disponível no cookie)
    if (token && userRole && !isPublicRoute) {
        if (!hasRouteAccess(userRole, normalizedPathname)) {
            return NextResponse.redirect(new URL('/forbidden', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
