'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface ImageThumbProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'square' | 'rounded' | 'circle';
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  fallback?: React.ReactNode;
  onError?: () => void;
}

const ImageThumb = React.forwardRef<HTMLDivElement, ImageThumbProps>(
  ({ 
    src,
    alt,
    size = 'md',
    variant = 'rounded',
    className,
    loading = 'lazy',
    priority = false,
    fallback,
    onError,
    ...props 
  }, ref) => {
    const [hasError, setHasError] = React.useState(false);
    
    const sizes = {
      sm: 'w-12 h-12', // 48px
      md: 'w-20 h-20', // 80px - padrão do novidades.md
      lg: 'w-24 h-24', // 96px
      xl: 'w-32 h-32'  // 128px
    };
    
    const variants = {
      square: 'rounded-none',
      rounded: 'rounded-xl', // 12px conforme design tokens
      circle: 'rounded-full'
    };

    const handleError = () => {
      setHasError(true);
      onError?.();
    };

    if (hasError && fallback) {
      return (
        <div
          ref={ref}
          className={cn(
            'thumb',
            sizes[size],
            variants[variant],
            'bg-gray-100 flex items-center justify-center',
            className
          )}
          {...props}
        >
          {fallback}
        </div>
      );
    }

    if (hasError) {
      return (
        <div
          ref={ref}
          className={cn(
            'thumb',
            sizes[size],
            variants[variant],
            'bg-gray-100 flex items-center justify-center text-gray-400',
            className
          )}
          {...props}
        >
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'thumb relative overflow-hidden',
          sizes[size],
          variants[variant],
          className
        )}
        {...props}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          loading={loading}
          priority={priority}
          onError={handleError}
          sizes={`(max-width: 768px) ${size === 'sm' ? '48px' : size === 'md' ? '80px' : size === 'lg' ? '96px' : '128px'}, ${size === 'sm' ? '48px' : size === 'md' ? '80px' : size === 'lg' ? '96px' : '128px'}`}
        />
      </div>
    );
  }
);

ImageThumb.displayName = 'ImageThumb';

export { ImageThumb };
