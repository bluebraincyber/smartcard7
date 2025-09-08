'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'strong' | 'muted' | 'light' | 'brand' | 'success' | 'warning' | 'error' | 'inverse';
  align?: 'left' | 'center' | 'right' | 'justify';
  truncate?: boolean | number;
  leading?: 'tight' | 'normal' | 'relaxed';
}

const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ 
    as: Component = 'p',
    className,
    size = 'base',
    weight = 'normal',
    color = 'default',
    align = 'left',
    truncate = false,
    leading = 'normal',
    children,
    ...props 
  }, ref) => {
    const sizes = {
      xs: 'text-xs',
      sm: 'text-sm', 
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl'
    };
    
    const weights = {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold'
    };
    
    const colors = {
      default: 'text-gray-900',
      strong: 'text-strong',
      muted: 'text-muted',
      light: 'text-light',
      brand: 'text-brand',
      success: 'text-success',
      warning: 'text-warning',
      error: 'text-error',
      inverse: 'text-white'
    };
    
    const alignments = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify'
    };
    
    const leadings = {
      tight: 'leading-tight',
      normal: 'leading-normal',
      relaxed: 'leading-relaxed'
    };
    
    const getTruncateClass = () => {
      if (truncate === true) return 'truncate';
      if (typeof truncate === 'number') {
        if (truncate === 2) return 'truncate-2';
        return `line-clamp-${truncate}`;
      }
      return '';
    };

    return (
      <Component
        className={cn(
          sizes[size],
          weights[weight],
          colors[color],
          alignments[align],
          leadings[leading],
          getTruncateClass(),
          className
        )}
        ref={ref as React.Ref<HTMLElement>}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = 'Text';

export { Text };
