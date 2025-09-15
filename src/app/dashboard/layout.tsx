'use client'

import { useSession } from 'next-auth/react'
import { Topbar } from '@/components/layout/Topbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileSidebar } from '@/components/layout/MobileSidebar'
import { SidebarProvider } from '@/components/providers/sidebar-provider'
import { usePathname } from 'next/navigation'
import TopbarHUD from '@/components/topbar/TopbarHUD'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 max-w-sm w-full bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Sessão expirada</h2>
          <p className="text-gray-600 mb-4">Por favor, faça login novamente para continuar.</p>
          <a
            href="/auth/login"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50">
        <TopbarHUD />
        <Topbar />
        <div className="flex pt-2">
          <Sidebar />
          <MobileSidebar />
          
          {/* Main content */}
          <main 
            className="flex-1 max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8"
            data-scroll-root
          >
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
