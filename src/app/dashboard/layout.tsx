'use client'

import { useSession } from 'next-auth/react'
import { Topbar } from '@/components/layout/Topbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileSidebar } from '@/components/layout/MobileSidebar'
import { SidebarProvider } from '@/components/providers/sidebar-provider'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-border border-t-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-6 max-w-sm w-full bg-card rounded-lg shadow-md border border-border">
          <h2 className="text-lg font-medium text-foreground mb-2">Sessão expirada</h2>
          <p className="text-muted-foreground mb-4">Por favor, faça login novamente para continuar.</p>
          <a
            href="/auth/login"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
          >
            Ir para o login
          </a>
        </div>
      </div>
    )
  }

  // Don't show layout on auth pages
  if (pathname.startsWith('/auth')) {
    return <>{children}</>
  }

  console.log('Dashboard Layout - Pathname:', pathname)

  return (
    <div className="min-h-screen bg-background relative" suppressHydrationWarning>
      <Topbar />
      <div className="flex pt-2">
        <Sidebar />
        <MobileSidebar />
        
        {/* Main content - BottomNavigation é gerenciado pelo layout principal */}
        <main 
          className="flex-1 max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8"
          data-scroll-root
        >
          {children}
        </main>
      </div>
    </div>
  )
}