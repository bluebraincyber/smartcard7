'use client';

import { usePathname, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Topbar } from '@/components/layout/Topbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { useMobileLayout } from '@/hooks/use-responsive';
import { ResponsiveMainLayout } from '@/components/ui/ResponsiveLayout';

export function DashboardLayoutWrapper({ 
  children,
  className = '' 
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const params = useParams();
  const isMobileLayout = useMobileLayout();
  const storeId = params?.id as string | undefined;

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-border border-t-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // No session
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-6 max-w-sm w-full bg-card rounded-lg shadow-md border border-border">
          <h2 className="text-lg font-medium text-foreground mb-2">Sessão expirada</h2>
          <p className="text-muted-foreground mb-4">Por favor, faça login novamente para continuar.</p>
          <a
            href="/auth/login"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
          >
            Ir para o login
          </a>
        </div>
      </div>
    );
  }

  // Don't show layout on auth pages
  if (pathname?.startsWith('/auth')) {
    return <>{children}</>;
  }

  // Determine if we should show the bottom navigation
  const shouldShowBottomNav = isMobileLayout && 
    !pathname?.startsWith('/auth') &&
    !pathname?.startsWith('/settings');

  return (
    <ResponsiveMainLayout
      header={
        <div className="sticky top-0 z-40">
          <Topbar />
        </div>
      }
      sidebar={
        <>
          {/* Desktop Sidebar */}
          {!isMobileLayout && <Sidebar />}
          {/* Mobile Sidebar (drawer) */}
          {isMobileLayout && <MobileSidebar />}
        </>
      }
      bottomNav={
        shouldShowBottomNav ? (
          <div className="fixed bottom-0 left-0 right-0 z-50">
            <BottomNavigation storeId={storeId} />
          </div>
        ) : null
      }
      className={className}
    >
      <div className="flex-1 w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </ResponsiveMainLayout>
  );
}
