import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  onMenuToggle?: (isOpen: boolean) => void;
  className?: string;
}

export const Header = ({ title, onMenuToggle, className }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    onMenuToggle?.(newState);
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50',
        'bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'border-b border-border',
        'pt-[calc(env(safe-area-inset-top,0)+8px)] pb-2',
        'rounded-b-2xl',
        className
      )}
    >
      <div className="mx-auto max-w-[1200px] px-fluid-3 sm:px-fluid-4 grid grid-cols-3 items-center">
        {/* Botão do menu (mobile) */}
        <div className="justify-self-start">
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-full shadow bg-card hover:bg-accent"
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Logo/Título */}
        <div className="justify-self-center">
          <Link
            href="/"
            className="inline-block px-3 py-1 bg-card shadow rounded-full text-primary font-semibold text-fluid-sm"
          >
            {title}
          </Link>
        </div>

        {/* Ações do cabeçalho (tema, notificações, etc) */}
        <div className="justify-self-end">
          <div className="flex items-center gap-2">
            {/* Adicione aqui botões de ação como tema, notificações, etc */}
            <button
              className="p-2 rounded-full shadow bg-card hover:bg-accent"
              aria-label="Alternar tema"
            >
              {/* Ícone de tema será adicionado aqui */}
              <span className="sr-only">Alternar tema</span>
            </button>
          </div>
        </div>
      </div>

      {/* Menu móvel */}
      {isMenuOpen && (
        <div className="md:hidden mt-2 px-fluid-3 py-2 border-t border-border">
          <nav className="space-y-2">
            <Link href="/dashboard" className="block py-2 px-3 rounded-lg hover:bg-accent">
              Dashboard
            </Link>
            <Link href="/produtos" className="block py-2 px-3 rounded-lg hover:bg-accent">
              Produtos
            </Link>
            <Link href="/vendas" className="block py-2 px-3 rounded-lg hover:bg-accent">
              Vendas
            </Link>
            <Link href="/relatorios" className="block py-2 px-3 rounded-lg hover:bg-accent">
              Relatórios
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
