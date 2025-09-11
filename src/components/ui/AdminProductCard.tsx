'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/Switch';
import { ImageThumb } from '@/components/ui/ImageThumb';
import { EditIcon, PauseIcon, PlayIcon, CopyIcon, TrashIcon, MoreIcon } from '@/components/ui/Icon';

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
          'group relative bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-gray-100 hover:-translate-y-1',
          !isActive && 'opacity-60',
          className
        )}
        {...props}
      >
        {/* HEADER DE MÍDIA — imagem GRANDE */}
        <div className="relative w-full bg-gray-50 rounded-t-2xl overflow-hidden">
          <div className="relative w-full aspect-square sm:aspect-[4/3]">
            <ImageThumb
              src={image ?? ''}
              alt={name}
              rounded="none"
              fluid
              className="bg-gray-100"
            />

            {/* Switch no canto superior esquerdo */}
            <div className="absolute top-3 left-3 z-10">
              <Switch
                checked={isActive}
                onCheckedChange={handleSwitchChange}
                size="md"
              />
            </div>

            {/* Overlay de produto Indisponível */}
            {isPaused && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                  <PauseIcon size="lg" className="text-yellow-600" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo do card */}
        <div className="p-4">
          {/* Nome e descrição */}
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1 line-clamp-1">
              {name}
            </h3>
            {description && (
              <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Preço */}
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-green-600">
                {formatPrice(price)}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Status badges */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              )}
            >
              {isActive ? 'Ativo' : 'Inativo'}
            </span>
            
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                isPaused
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              )}
            >
              {isPaused ? 'Indisponível' : 'Disponível'}
            </span>
          </div>

          {/* Barra de ações */}
          <div className="flex items-center justify-between">
            {/* Ações principais */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(id)}
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                title="Editar produto"
              >
                <EditIcon size="sm" />
              </button>

              <button
                onClick={handlePauseToggle}
                className={cn(
                  'inline-flex items-center justify-center w-9 h-9 rounded-full transition-colors',
                  isPaused
                    ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-yellow-600'
                )}
                title={isPaused ? 'Retomar produto' : 'Pausar produto'}
              >
                {isPaused ? <PlayIcon size="sm" /> : <PauseIcon size="sm" />}
              </button>
            </div>

            {/* Menu de ações secundárias */}
            <div className="relative">
              <button
                onClick={() => setIsActionsOpen(!isActionsOpen)}
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                title="Mais ações"
              >
                <MoreIcon size="sm" />
              </button>

              {/* Dropdown de ações */}
              {isActionsOpen && (
                <>
                  {/* Overlay para fechar o menu */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsActionsOpen(false)}
                  />
                  
                  {/* Menu dropdown */}
                  <div className="absolute right-0 bottom-full mb-2 z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px]">
                    <button
                      onClick={() => {
                        onDuplicate(id);
                        setIsActionsOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <CopyIcon size="sm" />
                      Duplicar
                    </button>
                    
                    <div className="border-t border-gray-100 my-1" />
                    
                    <button
                      onClick={() => {
                        onDelete(id);
                        setIsActionsOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <TrashIcon size="sm" />
                      Excluir
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

AdminProductCard.displayName = 'AdminProductCard';

export { AdminProductCard };
