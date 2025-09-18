'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  Home, 
  Store, 
  Settings,
  ShoppingBag,
  Boxes
} from 'lucide-react'

interface BottomNavItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  activePattern: RegExp
}

// Itens fixos de navegação que aparecem em todas as páginas
const NAV_ITEMS: BottomNavItem[] = [
  {
    href: '/dashboard',
    icon: Home,
    label: 'Início',
    activePattern: /^\/dashboard(\/)?$/
  },
  {
    href: '/dashboard/store',
    icon: Store,
    label: 'Minhas Lojas',
    activePattern: /^\/dashboard\/store(\/)?$/
  },
  {
    href: '/dashboard/orders',
    icon: ShoppingBag,
    label: 'Pedidos',
    activePattern: /^\/dashboard\/orders(\/)?$/
  },
  {
    href: '/dashboard/products',
    icon: Boxes,
    label: 'Produtos',
    activePattern: /^\/dashboard\/products(\/)?$/
  },
  {
    href: '/dashboard/settings',
    icon: Settings,
    label: 'Configurações',
    activePattern: /^\/dashboard\/settings(\/)?$/
  }
]

export function BottomNavigation() {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  
  // Prevenir problemas de hidratação
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Não renderizar até que o componente esteja montado no cliente
  if (!isMounted) {
    return <div className="h-16 md:h-0" />
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 shadow-lg md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.activePattern.test(pathname || '')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon 
                className={`h-5 w-5 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`} 
              />
              <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// Hook para usar em layouts
export function useBottomNavigation() {
  // Sempre retorna true para garantir que o menu seja exibido em todas as páginas
  return { shouldShowBottomNav: true }
}
