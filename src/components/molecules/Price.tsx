'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { Text } from '@/components/ui';

export interface PriceProps {
  value: number;
  originalValue?: number;
  discount?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'prominent' | 'compact';
  showCurrency?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const Price = React.forwardRef<HTMLDivElement, PriceProps>(
  ({
    value,
    originalValue,
    discount,
    size = 'md',
    variant = 'default',
    showCurrency = true,
    prefix,
    suffix,
    className,
    ...props
  }, ref) => {
    const hasDiscount = originalValue && originalValue > value;
    const discountPercentage = hasDiscount 
      ? Math.round(((originalValue - value) / originalValue) * 100)
      : discount;

    const formatValue = (price: number) => {
      if (showCurrency) {
        return formatPrice(price);
      }
      return price.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    };

    const sizes = {
      sm: {
        current: 'text-sm',
        original: 'text-xs',
        discount: 'text-xs'
      },
      md: {
        current: 'text-lg', // 16/700 conforme especificação
        original: 'text-sm',
        discount: 'text-sm'
      },
      lg: {
        current: 'text-xl',
        original: 'text-base',
        discount: 'text-base'
      }
    };

    if (variant === 'compact') {
      return (
        <div
          ref={ref}
          className={cn('flex items-center gap-2', className)}
          {...props}
        >
          {prefix && (
            <Text size={size} color="muted">
              {prefix}
            </Text>
          )}
          
          <Text 
            className={cn('price', sizes[size].current)} 
            weight="bold"
          >
            {formatValue(value)}
          </Text>
          
          {hasDiscount && (
            <Text 
              className={cn('price-old', sizes[size].original)}
              color="muted"
            >
              {formatValue(originalValue)}
            </Text>
          )}
          
          {suffix && (
            <Text size={size} color="muted">
              {suffix}
            </Text>
          )}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col gap-1',
          variant === 'prominent' && 'items-center',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2">
          {prefix && (
            <Text size={size} color="muted">
              {prefix}
            </Text>
          )}
          
          <Text 
            className={cn('price', sizes[size].current)} 
            weight="bold"
            color="strong"
          >
            {formatValue(value)}
          </Text>
          
          {discountPercentage && (
            <span className="badge badge-success">
              -{discountPercentage}%
            </span>
          )}
          
          {suffix && (
            <Text size={size} color="muted">
              {suffix}
            </Text>
          )}
        </div>
        
        {hasDiscount && (
          <Text 
            className={cn('price-old', sizes[size].original)}
            color="muted"
          >
            De {formatValue(originalValue)}
          </Text>
        )}
      </div>
    );
  }
);

Price.displayName = 'Price';

export { Price };
