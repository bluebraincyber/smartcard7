'use client'

import { BottomNavigation } from '@/components/navigation/BottomNavigation';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
      <BottomNavigation />
      
      {/* Adiciona um espaçamento extra no final para dispositivos móveis */}
      <div className="h-16 md:h-0" />
    </div>
  )
}
