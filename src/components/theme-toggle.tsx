'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative">
      {/* Botão principal - toggle simples */}
      <button
        onClick={toggleTheme}
        className="
          p-2 rounded-full 
          bg-card backdrop-blur-sm shadow-md 
          text-foreground 
          hover:bg-muted 
          transition-all duration-200
          border border-border
          hover:scale-105 active:scale-95
        "
        aria-label={`Alternar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
        title={`Tema atual: ${theme === 'light' ? 'Claro' : 'Escuro'}`}
      >
        {theme === 'light' ? (
          <Moon className="h-5 w-5 transition-transform duration-200 hover:rotate-12" />
        ) : (
          <Sun className="h-5 w-5 transition-transform duration-200 hover:rotate-12" />
        )}
      </button>

      {/* Indicador visual do tema ativo */}
      <div className={`
        absolute -bottom-1 -right-1 
        w-3 h-3 rounded-full border-2 border-background
        transition-colors duration-200
        ${theme === 'light' 
          ? 'bg-amber-400' 
          : 'bg-blue-500'
        }
      `} />
    </div>
  );
}