'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  thickness?: 'thin' | 'medium' | 'thick';
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ 
    className, 
    orientation = 'horizontal',
    variant = 'solid',
    spacing = 'none',
    thickness = 'thin',
    ...props 
  }, ref) => {
    const baseClasses = 'border-gray-200';
    
    const orientations = {
      horizontal: 'w-full border-t',
      vertical: 'h-full border-l'
    };
    
    const variants = {
      solid: 'border-solid',
      dashed: 'border-dashed',
      dotted: 'border-dotted'
    };
    
    const spacings = {
      none: '',
      sm: orientation === 'horizontal' ? 'my-2' : 'mx-2',
      md: orientation === 'horizontal' ? 'my-4' : 'mx-4',
      lg: orientation === 'horizontal' ? 'my-6' : 'mx-6'
    };
    
    const thicknesses = {
      thin: 'border-t-1',
      medium: 'border-t-2',
      thick: 'border-t-4'
    };

    return (
      <div
        className={cn(
          baseClasses,
          orientations[orientation],
          variants[variant],
          spacings[spacing],
          orientation === 'horizontal' ? thicknesses[thickness] : thicknesses[thickness].replace('t-', 'l-'),
          className
        )}
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';

export { Divider };
