import { useState, useEffect } from 'react';
import { useMediaQuery } from './use-media-query';

/**
 * Hook para gerenciar o estado de layout responsivo
 */
export function useResponsive() {
  const [isClient, setIsClient] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Evita hidratação desnecessária no servidor
  useEffect(() => {
    setIsClient(true);
  }, []);

  return {
    isMobile: isClient && isMobile,
    isTablet: isClient && isTablet,
    isDesktop: isClient && isDesktop,
  };
}

/**
 * Hook para verificar se o layout deve ser móvel
 */
export function useMobileLayout() {
  const { isMobile } = useResponsive();
  return isMobile;
}

/**
 * Hook para verificar se o layout deve ser de tablet
 */
export function useTabletLayout() {
  const { isTablet } = useResponsive();
  return isTablet;
}

/**
 * Hook para verificar se o layout deve ser desktop
 */
export function useDesktopLayout() {
  const { isDesktop } = useResponsive();
  return isDesktop;
}
