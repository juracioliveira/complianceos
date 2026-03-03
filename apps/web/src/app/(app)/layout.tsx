import type { Metadata } from 'next'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { AppHeader } from '@/components/layout/AppHeader'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { AuthProvider } from '@/lib/contexts/AuthContext'

export const metadata: Metadata = {
    title: { template: '%s | ComplianceOS', default: 'Dashboard | ComplianceOS' },
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <AuthGuard>
                <div className="flex h-screen bg-[#0A0C10] text-[#F0F2F5] font-ui overflow-hidden relative">
                    {/* Background Tech Effects */}
                    <div className="absolute inset-0 pointer-events-none opacity-20"
                        style={{
                            backgroundImage: `
                                linear-gradient(45deg, rgba(255,255,255,0.05) 1px, transparent 1px),
                                linear-gradient(-45deg, rgba(255,255,255,0.05) 1px, transparent 1px)
                            `,
                            backgroundSize: '60px 60px'
                        }}
                    />
                    <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-[radial-gradient(circle,rgba(0,229,255,0.07)0%,transparent0%)] rounded-full blur-[120px] pointer-events-none opacity-50" />

                    {/* Sidebar */}
                    <AppSidebar />

                    {/* Área principal */}
                    <div className="flex flex-col flex-1 overflow-hidden relative z-10">
                        <AppHeader />
                        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
                            {children}
                        </main>
                    </div>
                </div>

            </AuthGuard>
        </AuthProvider>
    )
}
