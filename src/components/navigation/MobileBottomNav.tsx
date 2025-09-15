'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Store, PlusCircle, BarChart3, User } from 'lucide-react'

const navItems = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard 
  },
  { 
    name: 'Lojas', 
    href: '/dashboard/store', 
    icon: Store 
  },
  {
    name: 'Criar',
    href: '/dashboard/store/new',
    icon: PlusCircle,
    primary: true
  },
  { 
    name: 'Analytics', 
    href: '/dashboard/analytics', 
    icon: BarChart3 
  },
  { 
    name: 'Perfil', 
    href: '/dashboard/profile', 
    icon: User 
  },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
                         (item.href !== '/dashboard' && pathname?.startsWith(item.href))
          
          if (item.primary) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full ${
                  isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <div className="-mt-8 mb-2 p-3 bg-blue-600 text-white rounded-full shadow-lg">
                  <item.icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full ${
                isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
