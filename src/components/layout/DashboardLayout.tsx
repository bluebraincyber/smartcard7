'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Page, Stack } from '@/components/layout';
import { Topbar } from '@/components/layout/Topbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { useMobileLayout } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayout({ 
  children, 
  className = '' 
}: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isMobileLayout = useMobileLayout();

  // Loading state
  if (status === 'loading') {
    return (
      <Page className="flex items-center justify-center min-h-screen bg-background">
        <Stack className="items-center gap-4 text-center">
          <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Carregando...</p>
        </Stack>
      </Page>
    );
  }

  // No session
  if (!session) {
    return (
      <Page className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-sm p-6 text-center bg-card rounded-xl border border-border shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Sessão expirada
          </h2>
          <p className="text-muted-foreground mb-6">
            Por favor, faça login novamente para continuar.
          </p>
          <a
            href="/auth/login"
            className={cn(
              'inline-flex justify-center w-full px-4 py-2',
              'text-sm font-medium text-primary-foreground',
              'bg-primary rounded-md hover:opacity-90',
              'transition-opacity duration-200',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
            )}
          >
            Ir para o login
          </a>
        </div>
      </Page>
    );
  }

  // Don't show layout on auth pages
  if (pathname?.startsWith('/auth')) {
    return <>{children}</>;
  }

  // Determine if we should show the bottom navigation
  const shouldShowBottomNav = isMobileLayout && 
    !pathname?.startsWith('/auth');

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      {!isMobileLayout && <Sidebar />}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <Topbar />
        
        {/* Mobile Sidebar (drawer) */}
        {isMobileLayout && <MobileSidebar />}
        
        {/* Page Content */}
        <main 
          className={cn(
            'flex-1 w-full',
            'px-4 py-4 sm:px-6 sm:py-6 lg:px-8',
            'overflow-auto',
            { 'pb-24': shouldShowBottomNav },
            className
          )}
        >
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
        
        {/* Bottom Navigation (Mobile) */}
        {shouldShowBottomNav && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
            <BottomNavigation />
          </div>
        )}
      </div>
    </div>
  );
}
