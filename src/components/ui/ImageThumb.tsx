'use client';

import React from 'react';
import Image from 'next/image';

interface ImageThumbProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'rounded' | 'circle' | 'square';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  fluid?: boolean;
  className?: string;
  priority?: boolean;
}

export function ImageThumb({ 
  src, 
  alt, 
  size = 'md', 
  variant = 'rounded',
  rounded,
  fluid = false,
  className = '',
  priority = false 
}: ImageThumbProps) {
  const [hasError, setHasError] = React.useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16', 
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const variantClasses = {
    rounded: 'rounded-lg',
    circle: 'rounded-full',
    square: 'rounded-none'
  };

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };

  const handleError = () => {
    setHasError(true);
  };

  // Se fluid é true, usa w-full h-full, senão usa os tamanhos fixos
  const containerClasses = fluid 
    ? 'w-full h-full'
    : sizeClasses[size];

  // Determina as classes de border-radius
  const borderClasses = rounded 
    ? roundedClasses[rounded]
    : variantClasses[variant];

  if (!src || hasError) {
    return (
      <div
        className={`${containerClasses} ${borderClasses} bg-muted/20 border border-border flex items-center justify-center ${className}`}
      >
        <svg className="w-8 h-8 text-muted-foreground/80" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`${containerClasses} ${borderClasses} overflow-hidden relative ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        priority={priority}
        onError={handleError}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}
