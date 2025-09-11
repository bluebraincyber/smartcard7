'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, Button, ImageThumb, Badge, Icon, HeartIcon } from '@/components/ui';
import { Price } from './Price';

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  imageAlt?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  discount?: number;
  badge?: string;
  isFavorite?: boolean;
  isNew?: boolean;
  inStock?: boolean;
  deliveryTime?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'featured';
  onClick?: () => void;
  onFavoriteClick?: () => void;
  onAddToCart?: () => void;
  className?: string;
}

const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  ({
    name,
    price,
    originalPrice,
    image,
    imageAlt,
    category,
    rating,
    reviewCount,
    discount,
    badge,
    isFavorite = false,
    isNew = false,
    inStock = true,
    deliveryTime,
    size = 'md',
    variant = 'default',
    onClick,
    onFavoriteClick,
    onAddToCart,
    className,
    ...props
  }, ref) => {
    const sizes = {
      sm: {
        card: 'w-40',
        image: 'sm' as const,
        title: 'text-sm',
        category: 'text-xs'
      },
      md: {
        card: 'w-48',
        image: 'md' as const,
        title: 'text-base',
        category: 'text-sm'
      },
      lg: {
        card: 'w-56',
        image: 'lg' as const,
        title: 'text-lg',
        category: 'text-base'
      }
    };

    const handleFavoriteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onFavoriteClick?.();
    };

    const handleAddToCartClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onAddToCart?.();
    };

    if (variant === 'compact') {
      return (
        <Card
          ref={ref}
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-md',
            'flex flex-row gap-3 p-3',
            !inStock && 'opacity-60',
            className
          )}
          onClick={onClick}
          {...props}
        >
          <div className="relative flex-shrink-0">
            <ImageThumb
              src={image}
              alt={imageAlt || name}
              size="sm"
              variant="rounded"
              priority={true}
            />
            
            {/* Badges */}
            <div className="absolute top-1 left-1 flex flex-col gap-1">
              {isNew && <Badge variant="success" size="sm">Novo</Badge>}
              {badge && <Badge variant="primary" size="sm">{badge}</Badge>}
              {discount && <Badge variant="destructive" size="sm">-{discount}%</Badge>}
            </div>
          </div>
          
          <CardContent className="flex-1 p-0 flex flex-col justify-between">
            <div>
              {category && (
                <p className={cn('text-gray-500 mb-1', sizes[size].category)}>
                  {category}
                </p>
              )}
              
              <h3 className={cn(
                'font-medium text-gray-900 line-clamp-2 mb-2',
                sizes[size].title
              )}>
                {name}
              </h3>
            </div>
            
            <div className="flex items-center justify-between">
              <Price
                value={price}
                originalValue={originalPrice}
                size="sm"
                variant="compact"
              />
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleFavoriteClick}
                className="p-1 h-8 w-8"
              >
                <HeartIcon className={cn(
                  'h-4 w-4',
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
                )} />
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card
        ref={ref}
        className={cn(
          'cursor-pointer transition-all duration-200 hover:shadow-lg',
          'group overflow-hidden',
          sizes[size].card,
          !inStock && 'opacity-60',
          variant === 'featured' && 'ring-2 ring-red-100',
          className
        )}
        onClick={onClick}
        {...props}
      >
        <div className="relative">
          <ImageThumb
            src={image}
            alt={imageAlt || name}
            size={sizes[size].image}
            variant="square"
            className="w-full"
            priority={true}
          />
          
          {/* Overlay com ações */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isNew && <Badge variant="success" size="sm">Novo</Badge>}
            {badge && <Badge variant="primary" size="sm">{badge}</Badge>}
            {discount && <Badge variant="destructive" size="sm">-{discount}%</Badge>}
            {!inStock && <Badge variant="secondary" size="sm">Esgotado</Badge>}
          </div>
          
          {/* Botão de favorito */}
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              'absolute top-2 right-2 p-1 h-8 w-8',
              'bg-white/80 hover:bg-white transition-all duration-200',
              'opacity-0 group-hover:opacity-100'
            )}
            onClick={handleFavoriteClick}
          >
            <HeartIcon className={cn(
              'h-4 w-4',
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
            )} />
          </Button>
          
          {/* Botão de adicionar ao carrinho */}
          {inStock && onAddToCart && (
            <Button
              size="sm"
              className={cn(
                'absolute bottom-2 left-2 right-2',
                'opacity-0 group-hover:opacity-100 transition-all duration-200',
                'transform translate-y-2 group-hover:translate-y-0'
              )}
              onClick={handleAddToCartClick}
            >
              Adicionar
            </Button>
          )}
        </div>
        
        <CardContent className="p-3">
          {category && (
            <p className={cn('text-gray-500 mb-1', sizes[size].category)}>
              {category}
            </p>
          )}
          
          <h3 className={cn(
            'font-medium text-gray-900 line-clamp-2 mb-2',
            sizes[size].title
          )}>
            {name}
          </h3>
          
          {/* Rating */}
          {rating && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon.StarIcon
                    key={star}
                    className={cn(
                      'h-3 w-3',
                      star <= rating 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                    )}
                  />
                ))}
              </div>
              {reviewCount && (
                <span className="text-xs text-gray-500">({reviewCount})</span>
              )}
            </div>
          )}
          
          <Price
            value={price}
            originalValue={originalPrice}
            size={size === 'lg' ? 'md' : 'sm'}
          />
          
          {deliveryTime && (
            <p className="text-xs text-gray-500 mt-2">
              Entrega: {deliveryTime}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }
);

ProductCard.displayName = 'ProductCard';

export { ProductCard };
