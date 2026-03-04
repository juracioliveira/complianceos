import type { Metadata } from 'next'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { AppHeader } from '@/components/layout/AppHeader'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { AuthProvider } from '@/lib/contexts/AuthContext'
import { MobileWall } from '@/components/layout/MobileWall'

export const metadata: Metadata = {
    title: { template: '%s | ComplianceOS', default: 'Dashboard | ComplianceOS' },
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <AuthGuard>
                {/* Block mobile access — show desktop-required screen on <1024px */}
                <MobileWall>
                    <div
                        className="flex h-screen overflow-hidden relative"
                        style={{ background: '#FFFFFF', color: '#0F172A', fontFamily: "'IBM Plex Sans', sans-serif" }}
                    >
                        {/* Grid background — mirrors hero section in landing */}
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                backgroundImage:
                                    'linear-gradient(45deg, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(-45deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
                                backgroundSize: '60px 60px',
                            }}
                        />
                        {/* Cyan radial glow — top-right as on landing */}
                        <div
                            className="absolute pointer-events-none"
                            style={{
                                top: '-40%', right: '-15%',
                                width: '60vw', height: '60vw',
                                background: 'radial-gradient(circle, rgba(0,163,191,0.05) 0%, transparent 60%)',
                                borderRadius: '50%',
                                filter: 'blur(80px)',
                            }}
                        />

                        {/* Sidebar */}
                        <AppSidebar />

                        {/* Main area */}
                        <div className="flex flex-col flex-1 overflow-hidden relative z-10">
                            <AppHeader />
                            <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
                                {children}
                            </main>
                        </div>
                    </div>
                </MobileWall>
            </AuthGuard>
        </AuthProvider>
    )
}
