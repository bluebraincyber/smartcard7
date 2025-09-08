'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'selected' | 'filter';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  onRemove?: () => void;
  removable?: boolean;
}

const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    icon, 
    onRemove,
    removable = false,
    children, 
    ...props 
  }, ref) => {
    const baseClasses = 'chip';
    
    const variants = {
      default: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      selected: 'bg-red-100 text-red-700 border border-red-200',
      filter: 'bg-white border border-gray-300 text-gray-700 hover:border-red-300'
    };
    
    const sizes = {
      sm: 'text-xs px-2 py-1 h-6',
      md: 'text-sm px-3 py-1.5 h-8'
    };

    return (
      <span
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          'transition-colors duration-fast cursor-pointer',
          className
        )}
        ref={ref}
        {...props}
      >
        {icon && (
          <span className={cn(
            'flex-shrink-0',
            size === 'sm' ? 'w-3 h-3' : 'w-4 h-4',
            children ? 'mr-1' : ''
          )}>
            {icon}
          </span>
        )}
        {children}
        {removable && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className={cn(
              'flex-shrink-0 ml-1 hover:bg-gray-300 rounded-full transition-colors',
              size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
            )}
            aria-label="Remover"
          >
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className="w-full h-full"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Chip.displayName = 'Chip';

export { Chip };
