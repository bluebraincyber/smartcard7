'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider 
      refetchInterval={0} // Desabilitar refetch automático
      refetchOnWindowFocus={false} // Não refetch ao focar a janela
    >
      {children}
    </SessionProvider>
  )
}
