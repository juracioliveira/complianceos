'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

export interface AuthUser {
    id: string
    name: string
    email: string
    role: string
    tenantName: string
    tenantId: string
    tenantPlan: string
}

interface AuthContextData {
    user: AuthUser | null
    isLoading: boolean
    logout: () => void
}

const AuthContext = createContext<AuthContextData>({
    user: null,
    isLoading: true,
    logout: () => { },
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        let isMounted = true

        async function loadUser() {
            const token = sessionStorage.getItem('access_token')
            if (!token) {
                setIsLoading(false)
                return
            }

            try {
                let apiUrl = process.env.NEXT_PUBLIC_API_URL
                if (!apiUrl && typeof window !== 'undefined') {
                    if (window.location.hostname !== 'localhost') {
                        if (window.location.hostname.includes('easypanel.host')) {
                            apiUrl = `https://${window.location.hostname.replace('-web-', '-api-')}`
                        } else {
                            const parts = window.location.hostname.split('.')
                            const baseDomain = parts.length > 2 ? parts.slice(-3).join('.') : window.location.hostname
                            apiUrl = `https://api.${baseDomain}`
                        }
                    } else {
                        apiUrl = 'http://localhost:4000'
                    }
                }

                console.log('[Auth] Carregando usuário de:', apiUrl)

                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

                const res = await fetch(`${apiUrl}/v1/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    signal: controller.signal
                })

                clearTimeout(timeoutId)

                if (res.ok) {
                    const { data } = await res.json()
                    setUser(data)
                    // Salvar role no cookie para o middleware
                    if (data.role) {
                        document.cookie = `user_role=${data.role}; path=/; max-age=86400`
                    }
                } else {
                    console.warn('[Auth] Sessão inválida ou expirada')
                    sessionStorage.removeItem('access_token')
                    document.cookie = 'access_token=; path=/; max-age=0'
                    document.cookie = 'user_role=; path=/; max-age=0'
                }
            } catch (err: any) {
                if (err.name === 'AbortError') {
                    console.error('[Auth] Timeout ao conectar com a API')
                } else {
                    console.error('[Auth] Erro ao carregar usuário:', err)
                }
            } finally {
                setIsLoading(false)
            }
        }

        loadUser()

        return () => {
            isMounted = false
        }
    }, [])

    const logout = () => {
        sessionStorage.removeItem('access_token')
        document.cookie = 'access_token=; path=/; max-age=0'
        document.cookie = 'user_role=; path=/; max-age=0'
        setUser(null)
        router.push('/login')
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, logout }}>
            {children}
        </AuthContext.Provider>
    )
}
