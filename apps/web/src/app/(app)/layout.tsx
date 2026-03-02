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
                <div className="flex h-screen bg-background overflow-hidden">
                    {/* Sidebar */}
                    <AppSidebar />

                    {/* Área principal */}
                    <div className="flex flex-col flex-1 overflow-hidden">
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
