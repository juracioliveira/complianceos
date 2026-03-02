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
                if (isMounted) setIsLoading(false)
                return
            }

            try {
                let apiUrl = process.env.NEXT_PUBLIC_API_URL
                if (!apiUrl && typeof window !== 'undefined') {
                    if (window.location.hostname !== 'localhost') {
                        const baseDomain = window.location.hostname.split('.').slice(-3).join('.')
                        apiUrl = `https://api.${baseDomain}`
                    } else {
                        apiUrl = 'http://localhost:3000'
                    }
                }

                const res = await fetch(`${apiUrl}/v1/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (res.ok) {
                    const { data } = await res.json()
                    if (isMounted) setUser(data)
                } else {
                    sessionStorage.removeItem('access_token')
                    document.cookie = 'access_token=; path=/; max-age=0'
                }
            } catch (err) {
                console.error('Failed to load user', err)
            } finally {
                if (isMounted) setIsLoading(false)
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
        setUser(null)
        router.push('/login')
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, logout }}>
            {children}
        </AuthContext.Provider>
    )
}
