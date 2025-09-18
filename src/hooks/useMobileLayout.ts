'use client';

import { useEffect, useState } from 'react';

/** 
 * Hook personalizado para detectar se a tela está em modo mobile com base em um breakpoint
 * @param breakpoint - Largura em pixels para considerar como breakpoint (padrão: 768px)
 * @returns boolean - true se a largura da tela for menor que o breakpoint
 */
export function useMobileLayout(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Função para verificar se a largura da tela é menor que o breakpoint
    const checkIfMobile = () => {
      const isMobileView = window.innerWidth < breakpoint;
      setIsMobile(isMobileView);
    };

    // Verificar no carregamento inicial
    checkIfMobile();

    // Adicionar listener para redimensionamento da janela
    window.addEventListener('resize', checkIfMobile);

    // Limpar listener ao desmontar o componente
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, [breakpoint]);

  return isMobile;
}
