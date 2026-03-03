import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value
    const isAuthRoute = request.nextUrl.pathname.startsWith('/login')

    // Configurações de rotas públicas
    const publicRoutes = ['/', '/login']
    const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname)

    if (!token && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (token && isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
