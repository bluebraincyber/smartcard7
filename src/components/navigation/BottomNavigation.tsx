'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { 
  Home, 
  Store, 
  BarChart3, 
  Settings,
  ShoppingBag,
  Users,
  Banknote,
  Boxes
} from 'lucide-react'

interface BottomNavItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  activePattern?: RegExp
}

interface BottomNavigationProps {
  storeId?: string
}

export function BottomNavigation({ storeId }: BottomNavigationProps) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  
  // Debug
  console.log('BottomNavigation - Pathname:', pathname, 'StoreId:', storeId, 'Mounted:', isMounted)
  
  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Define navigation items based on context
  const getNavItems = (): BottomNavItem[] => {
    if (storeId) {
      // Store-specific navigation - 5 itens
      return [
        {
          href: `/dashboard/store/${storeId}`,
          icon: Home,
          label: 'Início',
          activePattern: new RegExp(`^/dashboard/store/${storeId}$`)
        },
        {
          href: `/dashboard/store/${storeId}/products`,
          icon: Boxes,
          label: 'Produtos',
          activePattern: new RegExp(`/dashboard/store/${storeId}/products`)
        },
        {
          href: `/dashboard/store/${storeId}/orders`,
          icon: ShoppingBag,
          label: 'Pedidos',
          activePattern: new RegExp(`/dashboard/store/${storeId}/orders`)
        },
        {
          href: `/dashboard/store/${storeId}/customers`,
          icon: Users,
          label: 'Clientes',
          activePattern: new RegExp(`/dashboard/store/${storeId}/customers`)
        },
        {
          href: `/dashboard/store/${storeId}/settings`,
          icon: Settings,
          label: 'Config',
          activePattern: new RegExp(`/dashboard/store/${storeId}/settings`)
        }
      ]
    } else if (pathname.startsWith('/dashboard')) {
      // Dashboard navigation - 5 itens
      return [
        {
          href: '/dashboard',
          icon: BarChart3,
          label: 'Dashboard',
          activePattern: new RegExp('^/dashboard$')
        },
        {
          href: '/dashboard/store',
          icon: Store,
          label: 'Minha Loja',
          activePattern: new RegExp('/dashboard/store')
        },
        {
          href: '/dashboard/products',
          icon: Boxes,
          label: 'Produtos',
          activePattern: new RegExp('/dashboard/products')
        },
        {
          href: '/dashboard/finance',
          icon: Banknote,
          label: 'Financeiro',
          activePattern: new RegExp('/dashboard/finance')
        },
        {
          href: '/dashboard/analytics',
          icon: BarChart3,
          label: 'Analytics',
          activePattern: new RegExp('/dashboard/analytics')
        }
      ]
    } else {
      // Universal app navigation - para outras áreas do app além do dashboard
      return [
        {
          href: '/dashboard',
          icon: Home,
          label: 'Início',
          activePattern: new RegExp('^/dashboard$')
        },
        {
          href: '/dashboard/store',
          icon: Store,
          label: 'Lojas',
          activePattern: new RegExp('/dashboard/store')
        },
        {
          href: '/dashboard/products',
          icon: Boxes,
          label: 'Produtos',
          activePattern: new RegExp('/dashboard/products')
        },
        {
          href: '/dashboard/analytics',
          icon: BarChart3,
          label: 'Analytics',
          activePattern: new RegExp('/dashboard/analytics')
        },
        {
          href: '/dashboard/settings',
          icon: Settings,
          label: 'Config',
          activePattern: new RegExp('/dashboard/settings')
        }
      ]
    }
  }

  const navItems = getNavItems()

  const isActive = (item: BottomNavItem): boolean => {
    if (item.activePattern) {
      return item.activePattern.test(pathname)
    }
    return pathname === item.href
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted) {
    return <div className="h-16 md:h-0" />
  }

  return (
    <>
      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border flex items-center justify-around py-2 px-1 shadow-lg md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-1 p-2
                text-xs font-medium transition-colors duration-200 min-w-0 flex-1
                ${active 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <Icon className={`h-5 w-5 ${active ? 'text-primary' : ''}`} />
              <span className="leading-none text-center truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Spacer para não sobrepor conteúdo */}
      <div className="h-16 md:h-0" />
    </>
  )
}

// Hook para usar em layouts
export function useBottomNavigation() {
  const pathname = usePathname()
  
  const shouldShowBottomNav = () => {
    // Debug
    console.log('useBottomNavigation - Checking pathname:', pathname)
    
    // Não mostrar em páginas de autenticação
    if (pathname.startsWith('/auth') || pathname.startsWith('/login')) {
      console.log('Hiding because auth page')
      return false
    }
    
    // Não mostrar em páginas públicas da loja
    if (pathname.startsWith('/store/') && !pathname.startsWith('/dashboard/store/')) {
      console.log('Hiding because public store page')
      return false
    }
    
    // Não mostrar em páginas de onboarding
    if (pathname.includes('/onboarding')) {
      console.log('Hiding because onboarding')
      return false
    }
    
    // Agora mostra em toda a app, não apenas no dashboard
    const show = !pathname.startsWith('/auth') && !pathname.includes('/onboarding') && pathname !== '/'
    console.log('Should show bottom nav:', show)
    return show
  }
  
  return { shouldShowBottomNav: shouldShowBottomNav() }
}
