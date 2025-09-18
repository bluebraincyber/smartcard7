'use client'

import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { usePathname } from 'next/navigation';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Extract storeId from pathname if it's a store-specific page
  const storeMatch = pathname.match(/\/dashboard\/store\/([^/]+)/)
  const storeId = storeMatch ? storeMatch[1] : undefined
  
  // Show BottomNavigation in ALL pages - no exceptions
  const showBottomNav = true
  
  console.log('Root Layout - Pathname:', pathname, 'ShowBottomNav:', showBottomNav, 'StoreId:', storeId)
  
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
      <BottomNavigation storeId={storeId} />
    </div>
  )
}
