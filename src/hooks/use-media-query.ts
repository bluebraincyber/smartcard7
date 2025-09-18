import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Apenas no cliente
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    
    // Atualiza o estado quando a media query mudar
    const updateMatches = () => setMatches(media.matches);
    
    // Configura o listener
    try {
      // Tenta usar o método moderno primeiro
      if (media.addEventListener) {
        media.addEventListener('change', updateMatches);
        updateMatches();
        return () => media.removeEventListener('change', updateMatches);
      }
      
      // Fallback para navegadores antigos
      if (media.addListener) {
        media.addListener(updateMatches);
        updateMatches();
        return () => media.removeListener(updateMatches);
      }
      
      // Se não conseguir adicionar listener, retorna função vazia
      return () => {};
    } catch {
      // Em caso de erro, retorna função vazia
      return () => {};
    }
  }, [query]);

  return matches;
}

// Hook para breakpoints comuns
export function useBreakpoints() {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(max-width: 768px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isLargeScreen = useMediaQuery('(min-width: 1280px)');

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
  };
}

/**
 * Hook para verificar se o layout deve ser móvel
 * @returns {boolean} Retorna true se a tela for considerada móvel (largura <= 768px)
 */
export function useMobileLayout(): boolean {
  return useMediaQuery('(max-width: 768px)');
}
