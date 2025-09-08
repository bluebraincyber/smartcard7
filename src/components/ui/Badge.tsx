'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'solid' | 'outline' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'solid', size = 'md', icon, children, ...props }, ref) => {
    const baseClasses = 'badge';
    
    const variants = {
      solid: 'badge-solid',
      outline: 'badge-outline', 
      success: 'badge-success',
      warning: 'bg-yellow-500 text-white',
      error: 'bg-red-500 text-white'
    };
    
    const sizes = {
      sm: 'text-xs px-1.5 py-0.5',
      md: 'text-xs px-2 py-1'
    };

    return (
      <span
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {icon && (
          <span className="w-3 h-3 mr-1">
            {icon}
          </span>
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
