'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  Store, 
  Package, 
  BarChart3, 
  Settings,
  ShoppingBag,
  Users,
  MessageSquare
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
  
  // Define navigation items based on context
  const getNavItems = (): BottomNavItem[] => {
    if (storeId) {
      // Store-specific navigation
      return [
        {
          href: `/dashboard/store/${storeId}`,
          icon: Home,
          label: 'Início',
          activePattern: new RegExp(`^/dashboard/store/${storeId}$`)
        },
        {
          href: `/dashboard/store/${storeId}/products`,
          icon: Package,
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
    } else {
      // General dashboard navigation
      return [
        {
          href: '/dashboard',
          icon: Home,
          label: 'Dashboard',
          activePattern: new RegExp('^/dashboard$')
        },
        {
          href: '/dashboard/stores',
          icon: Store,
          label: 'Lojas',
          activePattern: new RegExp('/dashboard/stores')
        },
        {
          href: '/dashboard/analytics',
          icon: BarChart3,
          label: 'Analytics',
          activePattern: new RegExp('/dashboard/analytics')
        },
        {
          href: '/dashboard/messages',
          icon: MessageSquare,
          label: 'Mensagens',
          activePattern: new RegExp('/dashboard/messages')
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

  return (
    <>
      {/* Bottom Navigation - Mobile Only */}
      <nav className="nav-mobile">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                touch-target flex flex-col items-center justify-center gap-1
                text-xs font-medium transition-colors duration-200
                ${active 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <Icon className={`h-5 w-5 ${active ? 'text-primary' : ''}`} />
              <span className="leading-none">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Spacer para não sobrepor conteúdo */}
      <div className="h-20 md:h-0" />
    </>
  )
}

// Hook para usar em layouts
export function useBottomNavigation() {
  const pathname = usePathname()
  
  const shouldShowBottomNav = () => {
    // Não mostrar em páginas de autenticação
    if (pathname.startsWith('/auth') || pathname.startsWith('/login')) {
      return false
    }
    
    // Não mostrar em páginas públicas da loja
    if (pathname.startsWith('/store/') && !pathname.startsWith('/dashboard/store/')) {
      return false
    }
    
    // Não mostrar em páginas de onboarding
    if (pathname.includes('/onboarding')) {
      return false
    }
    
    return pathname.startsWith('/dashboard')
  }
  
  return { shouldShowBottomNav: shouldShowBottomNav() }
}
