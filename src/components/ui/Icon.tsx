'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface IconProps extends React.SVGAttributes<SVGElement> {
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'current' | 'muted' | 'brand' | 'success' | 'warning' | 'error';
}

const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ 
    className,
    size = 'md',
    color = 'current',
    children,
    ...props 
  }, ref) => {
    const sizes = {
      xs: 'w-3 h-3', // 12px
      sm: 'w-4 h-4', // 16px
      md: 'w-5 h-5', // 20px
      lg: 'w-6 h-6', // 24px
      xl: 'w-8 h-8'  // 32px
    };
    
    const colors = {
      current: 'text-current',
      muted: 'text-muted',
      brand: 'text-brand',
      success: 'text-success',
      warning: 'text-warning',
      error: 'text-error'
    };

    return (
      <svg
        className={cn(
          sizes[size],
          colors[color],
          'flex-shrink-0',
          className
        )}
        ref={ref}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        {...props}
      >
        {children}
      </svg>
    );
  }
);

Icon.displayName = 'Icon';

// Ícones comuns do sistema
export const HeartIcon = (props: Omit<IconProps, 'children'>) => (
  <Icon {...props}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Icon>
);

export const SearchIcon = (props: Omit<IconProps, 'children'>) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </Icon>
);

export const StarIcon = (props: Omit<IconProps, 'children'>) => (
  <Icon {...props}>
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </Icon>
);

export const PlusIcon = (props: Omit<IconProps, 'children'>) => (
  <Icon {...props}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const MinusIcon = (props: Omit<IconProps, 'children'>) => (
  <Icon {...props}>
    <path d="M5 12h14" />
  </Icon>
);

export const ChevronLeftIcon = (props: Omit<IconProps, 'children'>) => (
  <Icon {...props}>
    <path d="m15 18-6-6 6-6" />
  </Icon>
);

export const ChevronRightIcon = (props: Omit<IconProps, 'children'>) => (
  <Icon {...props}>
    <path d="m9 18 6-6-6-6" />
  </Icon>
);

export const ChevronDownIcon = (props: Omit<IconProps, 'children'>) => (
  <Icon {...props}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);

export const XIcon = (props: Omit<IconProps, 'children'>) => (
  <Icon {...props}>
    <path d="M18 6L6 18M6 6l12 12" />
  </Icon>
);

export const MenuIcon = (props: Omit<IconProps, 'children'>) => (
  <Icon {...props}>
    <path d="M3 12h18M3 6h18M3 18h18" />
  </Icon>
);

export const MapPinIcon = (props: Omit<IconProps, 'children'>) => (
  <Icon {...props}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </Icon>
);

export const ClockIcon = (props: Omit<IconProps, 'children'>) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </Icon>
);

export const TruckIcon = (props: Omit<IconProps, 'children'>) => (
  <Icon {...props}>
    <path d="M14 18V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18H9" />
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
    <circle cx="17" cy="18" r="2" />
    <circle cx="7" cy="18" r="2" />
  </Icon>
);

export { Icon };
