'use client'

import { useCallback } from 'react'

export function useApi() {
    const fetchWithAuth = useCallback(async (path: string, options: RequestInit = {}) => {
        const token = sessionStorage.getItem('access_token')

        let apiUrl = process.env.NEXT_PUBLIC_API_URL
        if (!apiUrl && typeof window !== 'undefined') {
            if (window.location.hostname !== 'localhost') {
                const baseDomain = window.location.hostname.split('.').slice(-3).join('.')
                apiUrl = `https://api.${baseDomain}`
            } else {
                apiUrl = 'http://localhost:3000'
            }
        }

        const res = await fetch(`${apiUrl}${path}`, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })

        if (res.status === 401) {
            sessionStorage.removeItem('access_token')
            window.location.href = '/login'
            throw new Error('Unauthorized')
        }

        if (!res.ok) {
            const error = await res.json().catch(() => ({ message: 'An unknown error occurred' }))
            throw new Error(error.message || 'API request failed')
        }

        return res.json()
    }, [])

    return { fetchWithAuth }
}
