'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Store,
  BarChart3,
  LogOut,
  Menu,
  X,
  User,
  ChevronLeft,
  ChevronRight,
  Settings,
  DollarSign,
  ShoppingCart
} from 'lucide-react'
import MobileBottomNav from '@/components/navigation/MobileBottomNav'

// Navigation item component for desktop sidebar
function NavItem({
  href,
  icon: Icon,
  label,
  active,
  collapsed
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  collapsed: boolean
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center px-2 py-2.5 text-sm font-medium rounded-md transition-colors ${active
          ? 'bg-blue-50 text-blue-600'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      title={collapsed ? label : undefined}
    >
      <Icon
        className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
          }`}
      />
      {!collapsed && <span className="ml-3">{label}</span>}
    </Link>
  )
}

// Navigation item component for mobile sidebar
function MobileNavItem({
  href,
  icon: Icon,
  label,
  active
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center px-3 py-3 text-base font-medium rounded-md ${active
          ? 'bg-blue-50 text-blue-600'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
    >
      <Icon
        className={`mr-4 h-6 w-6 ${active ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
          }`}
      />
      {label}
    </Link>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (sidebarOpen && !target.closest('#sidebar') && isMobile) {
        setSidebarOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [sidebarOpen, isMobile])

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
          <Link
            href="/auth/login"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Ir para o login
          </Link>
        </div>
      </div>
    )
  }

  // Get store ID from session or default to empty string
  const storeId = session?.user?.storeId || '';

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Minha Loja', href: `/dashboard/store/${storeId}`, icon: Store },
    { name: 'Produtos', href: `/dashboard/store/${storeId}`, icon: ShoppingCart },
    { name: 'Financeiro', href: '/dashboard/finance/ledger', icon: DollarSign },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Configurações', href: '/dashboard/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div
        id="sidebar"
        className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out fixed h-full z-30 hidden md:flex`}
      >
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between px-4'} mb-8`}>
            <Link
              href="/dashboard"
              className={`flex items-center ${sidebarCollapsed ? 'justify-center w-full' : ''}`}
            >
              <span className={`font-bold text-blue-600 ${sidebarCollapsed ? 'text-2xl' : 'text-xl'}`}>
                {sidebarCollapsed ? 'SC' : 'SmartCard'}
              </span>
            </Link>

            {!sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
          </div>

          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <NavItem
                key={item.name}
                href={item.href}
                icon={item.icon}
                label={item.name}
                active={pathname === item.href}
                collapsed={sidebarCollapsed}
              />
            ))}
          </nav>
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
              <User className="h-5 w-5" />
            </div>

            {!sidebarCollapsed && (
              <div className="ml-3 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {session.user?.name || 'Usuário'}
                </p>
                <button
                  onClick={() => signOut({ callbackUrl: '/auth/login' })}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Sair
                </button>
              </div>
            )}
          </div>

          {sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="mt-4 w-full flex justify-center text-gray-400 hover:text-gray-500"
              title="Expandir menu"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden sticky top-0 z-40 flex h-16 bg-white shadow">
        <button
          onClick={() => setSidebarOpen(true)}
          className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
        >
          <span className="sr-only">Abrir menu</span>
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex-1 flex justify-center px-4">
          <Link href="/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-blue-600">SmartCard</span>
          </Link>
        </div>
        <div className="flex items-center pr-4">
          <Link
            href="/dashboard/profile"
            className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"
          >
            <User className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:hidden transition-transform duration-300 ease-in-out bg-white w-64`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              SmartCard
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <MobileNavItem
                key={item.name}
                href={item.href}
                icon={item.icon}
                label={item.name}
                active={pathname === item.href}
              />
            ))}

            <div className="pt-4 mt-4 border-t border-gray-200">
              <MobileNavItem
                href="/dashboard/profile"
                icon={User}
                label="Meu Perfil"
                active={pathname?.startsWith('/dashboard/profile')}
              />
              <button
                onClick={() => signOut({ callbackUrl: '/auth/login' })}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
              >
                <LogOut className="mr-3 h-5 w-5 text-red-400" />
                Sair
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className={`${!isMobile ? (sidebarCollapsed ? 'md:ml-16' : 'md:ml-64') : ''} pb-16 md:pb-0`}>
        <main>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}
