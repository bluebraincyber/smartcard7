"use client";

import { createContext, useContext, useEffect, useState } from "react";

type SidebarContextType = { 
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  open: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Carregar preferência salva APENAS após montar
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-open');
      if (saved) {
        setIsOpen(JSON.parse(saved));
      } else {
        // Padrão: fechado em mobile, aberto em desktop
        const isDesktop = window.innerWidth >= 768;
        setIsOpen(isDesktop);
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Salvar preferência APENAS após montar
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-open', JSON.stringify(isOpen));
      
      // Bloquear scroll no mobile quando o menu estiver aberto
      if (isOpen && window.innerWidth < 768) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }, [isOpen, mounted]);

  const toggle = () => setIsOpen(prev => !prev);
  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close, open }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
