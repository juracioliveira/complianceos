import type { Metadata } from 'next'
import { Inter, DM_Serif_Display, IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const dmSerif = DM_Serif_Display({ weight: '400', subsets: ['latin'], variable: '--font-dm-serif' })
const ibmPlex = IBM_Plex_Sans({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-ibm-plex' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

export const metadata: Metadata = {
    title: 'ComplianceOS — Compliance & Governança',
    description: 'Plataforma SaaS de Compliance e Governança — PLD/FT, LGPD e Anticorrupção',
    robots: 'noindex, nofollow', // aplicação interna
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html
            lang="pt-BR"
            className={`${inter.variable} ${dmSerif.variable} ${ibmPlex.variable} ${jetbrainsMono.variable}`}
            suppressHydrationWarning
        >
            <body className="bg-background text-foreground animate-fade-in">{children}</body>
        </html>
    )
}

