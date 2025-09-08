'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button, ChevronLeftIcon, MenuIcon, SearchIcon, HeartIcon } from '@/components/ui';

export interface AppBarProps {
  title?: string;
  showBack?: boolean;
  showMenu?: boolean;
  showSearch?: boolean;
  showFavorite?: boolean;
  searchPlaceholder?: string;
  onBack?: () => void;
  onMenu?: () => void;
  onSearch?: (query: string) => void;
  onFavorite?: () => void;
  onSearchFocus?: () => void;
  className?: string;
  variant?: 'default' | 'search' | 'transparent';
  sticky?: boolean;
}

const AppBar = React.forwardRef<HTMLDivElement, AppBarProps>(
  ({
    title,
    showBack = false,
    showMenu = false,
    showSearch = false,
    showFavorite = false,
    searchPlaceholder = 'Buscar...',
    onBack,
    onMenu,
    onSearch,
    onFavorite,
    onSearchFocus,
    className,
    variant = 'default',
    sticky = false,
    ...props
  }, ref) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isSearchMode, setIsSearchMode] = React.useState(false);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      onSearch?.(value);
    };

    const handleSearchFocus = () => {
      setIsSearchMode(true);
      onSearchFocus?.();
    };

    const handleSearchBlur = () => {
      if (!searchQuery) {
        setIsSearchMode(false);
      }
    };

    const baseClasses = cn(
      'flex items-center justify-between px-2 sm:px-4 bg-white border-b border-gray-200 transition-shadow duration-200',
      'h-12 sm:h-14 md:h-16', // 48-64dp conforme especificação
      sticky && 'sticky top-0 z-sticky',
      variant === 'transparent' && 'bg-transparent border-transparent',
      variant === 'search' && 'bg-gray-50'
    );

    return (
      <header
        ref={ref}
        className={cn(baseClasses, className)}
        {...props}
      >
        {/* Left Section */}
        <div className="flex items-center gap-1 sm:gap-2">
          {showBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-1 sm:p-2 h-8 w-8 sm:h-11 sm:w-11"
              aria-label="Voltar"
            >
              <ChevronLeftIcon size="sm" className="sm:w-5 sm:h-5" />
            </Button>
          )}
          
          {showMenu && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenu}
              className="p-1 sm:p-2 h-8 w-8 sm:h-11 sm:w-11"
              aria-label="Menu"
            >
              <MenuIcon size="sm" className="sm:w-5 sm:h-5" />
            </Button>
          )}
        </div>

        {/* Center Section */}
        <div className="flex-1 mx-2 sm:mx-4">
          {variant === 'search' || isSearchMode ? (
            <div className="relative">
              <SearchIcon 
                size="sm" 
                className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                placeholder={searchPlaceholder}
                className={cn(
                  'w-full h-8 sm:h-10 pl-8 sm:pl-10 pr-3 sm:pr-4 bg-gray-100 border border-gray-200 rounded-lg',
                  'text-xs sm:text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent',
                  'transition-all duration-200'
                )}
              />
            </div>
          ) : (
            title && (
              <h1 className="text-sm sm:text-lg font-semibold text-gray-900 text-center truncate">
                {title}
              </h1>
            )
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-2">
          {showSearch && variant !== 'search' && !isSearchMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchMode(true)}
              className="p-1 sm:p-2 h-8 w-8 sm:h-11 sm:w-11"
              aria-label="Buscar"
            >
              <SearchIcon size="sm" className="sm:w-5 sm:h-5" />
            </Button>
          )}
          
          {showFavorite && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onFavorite}
              className="p-1 sm:p-2 h-8 w-8 sm:h-11 sm:w-11"
              aria-label="Favoritar"
            >
              <HeartIcon size="sm" className="sm:w-5 sm:h-5" />
            </Button>
          )}
        </div>
      </header>
    );
  }
);

AppBar.displayName = 'AppBar';

export { AppBar };
