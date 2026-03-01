import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
    title: 'ComplianceOS — Compliance & Governança',
    description: 'Plataforma SaaS de Compliance e Governança — PLD/FT, LGPD e Anticorrupção',
    robots: 'noindex, nofollow', // aplicação interna
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
            <body>{children}</body>
        </html>
    )
}
