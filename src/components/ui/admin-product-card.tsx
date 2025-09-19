'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { ImageThumb } from '@/components/ui/image-thumb';
import { EditIcon, PauseIcon, PlayIcon, CopyIcon, TrashIcon, MoreIcon } from '@/components/ui/icon';

export interface AdminProductCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  isActive: boolean;
  isPaused: boolean;
  onToggleActive: (id: string, active: boolean) => void;
  onTogglePause: (id: string, paused: boolean) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

const AdminProductCard = React.forwardRef<HTMLDivElement, AdminProductCardProps>(
  ({
    id,
    name,
    description,
    price,
    originalPrice,
    image,
    isActive,
    isPaused,
    onToggleActive,
    onTogglePause,
    onEdit,
    onDuplicate,
    onDelete,
    className,
    ...props
  }, ref) => {
    const [isActionsOpen, setIsActionsOpen] = useState(false);
    const actionsMenuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (!isActionsOpen) return;

      const handleClickOutside = (event: MouseEvent) => {
        if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
          setIsActionsOpen(false);
        }
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsActionsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [isActionsOpen]);

    const formatPrice = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };

    const handleSwitchChange = (checked: boolean) => {
      onToggleActive(id, checked);
    };

    const handlePauseToggle = () => {
      onTogglePause(id, !isPaused);
    };

    return (
      <div
        ref={ref}
        className={cn(
          'group relative bg-card rounded-2xl border border-border overflow-hidden transition-all duration-200',
          'shadow-sm hover:shadow-lg hover:-translate-y-0.5',
          'dark:bg-gray-900 dark:border-gray-800',
          !isActive && 'opacity-60',
          className
        )}
        {...props}
      >
        {/* HEADER DE MÍDIA — imagem GRANDE */}
        <div className="relative w-full bg-muted/25 dark:bg-gray-800/40 rounded-t-2xl overflow-hidden">
          <div className="relative w-full aspect-square">
            <ImageThumb
              src={image ?? ''}
              alt={name}
              rounded="none"
              fluid
              className="bg-muted dark:bg-gray-800"
            />

            {/* Switch no canto superior esquerdo */}
            <div className="absolute top-3 left-3 z-10">
              <div className="[&>button]:outline [&>button]:outline-2 [&>button]:outline-white/20 [&>button]:drop-shadow-md">
                <Switch
                  checked={isActive}
                  onCheckedChange={handleSwitchChange}
                />
              </div>
            </div>

            {/* Menu de ações */}
            <div className="absolute top-3 right-3 z-20">
              <button
                onClick={() => setIsActionsOpen(!isActionsOpen)}
                className={cn(
                  'inline-flex items-center justify-center w-9 h-9 rounded-full transition-colors border',
                  'bg-card/90 text-muted-foreground border-border/70 hover:bg-card hover:text-foreground',
                  'dark:bg-gray-900/90 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-900'
                )}
                aria-label="Mais ações do produto"
              >
                <MoreIcon size="sm" />
              </button>

              {isActionsOpen && (
                <div
                  ref={actionsMenuRef}
                  className={cn(
                    'absolute right-0 mt-2 z-20 rounded-lg shadow-lg border py-1 min-w-[160px]',
                    'bg-white border-gray-200',
                    'dark:bg-gray-900 dark:border-gray-700'
                  )}
                >
                  <button
                    onClick={() => {
                      onDuplicate(id);
                      setIsActionsOpen(false);
                    }}
                    className={cn(
                      'flex items-center gap-3 w-full px-4 py-2 text-sm',
                      'text-gray-700 hover:bg-gray-50',
                      'dark:text-gray-300 dark:hover:bg-gray-800'
                    )}
                  >
                    <CopyIcon size="sm" />
                    Duplicar
                  </button>

                  <div className="border-t border-gray-100 dark:border-gray-700 my-1" />

                  <button
                    onClick={() => {
                      onDelete(id);
                      setIsActionsOpen(false);
                    }}
                    className={cn(
                      'flex items-center gap-3 w-full px-4 py-2 text-sm',
                      'text-red-600 hover:bg-red-50',
                      'dark:text-red-400 dark:hover:bg-red-900/20'
                    )}
                  >
                    <TrashIcon size="sm" />
                    Excluir
                  </button>
                </div>
              )}
            </div>

            {/* Overlay de produto Indisponível */}
            {isPaused && (
              <div className="absolute inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
                <div className="bg-card/95 dark:bg-gray-900/95 rounded-xl p-2 shadow-sm">
                  <PauseIcon size="lg" className="text-yellow-500 dark:text-yellow-400" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo do card */}
        <div className="p-3 bg-card dark:bg-gray-900">
          {/* Nome e descrição */}
          <div className="mb-2">
            <h3 className="font-semibold text-foreground dark:text-gray-100 text-base leading-tight mb-1 line-clamp-1">
              {name}
            </h3>
            {description && (
              <p className="text-muted-foreground dark:text-gray-400 text-xs line-clamp-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Preço */}
          <div className="mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatPrice(price)}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-xs text-muted-foreground dark:text-gray-500 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Status badges */}
          <div className="flex items-center gap-1.5 mb-3">
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                isActive
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              )}
            >
              {isActive ? 'Ativo' : 'Inativo'}
            </span>
            
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                isPaused
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              )}
            >
              {isPaused ? 'Indisponível' : 'Disponível'}
            </span>
          </div>

          {/* Barra de ações */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(id)}
              className={cn(
                'inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors',
                'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600',
                'dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400'
              )}
              title="Editar produto"
            >
              <EditIcon size="sm" />
            </button>

            <button
              onClick={handlePauseToggle}
              className={cn(
                'inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors',
                isPaused
                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50'
                  : 'bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-yellow-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-yellow-900/30 dark:hover:text-yellow-400'
              )}
              title={isPaused ? 'Retomar produto' : 'Pausar produto'}
            >
              {isPaused ? <PlayIcon size="sm" /> : <PauseIcon size="sm" />}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

AdminProductCard.displayName = 'AdminProductCard';

export { AdminProductCard };
