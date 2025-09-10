'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Icon, ImageIcon } from './Icon';

type Radius = 'md' | 'lg' | 'xl' | 'full' | 'none';

export interface ImageThumbProps {
  src: string;
  alt: string;
  className?: string;
  rounded?: Radius;
  /** Quando true, a imagem preenche o container (usar com aspect-*) */
  fluid?: boolean;
  /** Fallback local opcional */
  placeholderSrc?: string;
  priority?: boolean;
  onError?: () => void;
}

const ImageThumb = React.forwardRef<HTMLDivElement, ImageThumbProps>(
  (
    {
      src,
      alt,
      className,
      rounded = 'lg',
      fluid = false,
      placeholderSrc,
      priority = false,
      onError,
    },
    ref
  ) => {
    const [hasError, setHasError] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);

    const radius = {
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full',
      none: 'rounded-none',
    }[rounded || 'lg'];

    const handleError = () => {
      if (onError) onError();
      setHasError(true);
      setIsLoading(false);
    };

    const handleLoad = () => {
      setIsLoading(false);
    };

    // Verifica se deve mostrar placeholder
    const shouldShowPlaceholder = !src || src.length === 0 || hasError;

    if (fluid) {
      // Preenche TODO o container (recomendo usar com aspect-square/ratio no wrapper)
      return (
        <div ref={ref} className={cn('relative w-full h-full overflow-hidden', radius, className)}>
          {shouldShowPlaceholder ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 border-2 border-slate-200">
              <div className="flex flex-col items-center justify-center text-slate-400">
                <ImageIcon className="w-12 h-12 mb-2" />
                <div className="w-8 h-2 bg-slate-300 rounded-full"></div>
                <div className="w-6 h-1.5 bg-slate-300 rounded-full mt-1"></div>
              </div>
            </div>
          ) : (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 border-2 border-slate-200">
                  <div className="flex flex-col items-center justify-center text-slate-400 animate-pulse">
                    <ImageIcon className="w-12 h-12 mb-2" />
                    <div className="w-8 h-2 bg-slate-300 rounded-full"></div>
                    <div className="w-6 h-1.5 bg-slate-300 rounded-full mt-1"></div>
                  </div>
                </div>
              )}
              <Image
                src={src}
                alt={alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
                priority={priority}
                onError={handleError}
                onLoad={handleLoad}
              />
            </>
          )}
        </div>
      );
    }

    // Modo fixo (backup)
    return (
      <div
        ref={ref}
        className={cn('relative w-32 h-32 bg-gray-100 overflow-hidden', radius, className)}
      >
        {shouldShowPlaceholder ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 border-2 border-slate-200">
            <div className="flex flex-col items-center justify-center text-slate-400">
              <ImageIcon className="w-8 h-8 mb-1" />
              <div className="w-6 h-1.5 bg-slate-300 rounded-full"></div>
              <div className="w-4 h-1 bg-slate-300 rounded-full mt-0.5"></div>
            </div>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 border-2 border-slate-200">
                <div className="flex flex-col items-center justify-center text-slate-400 animate-pulse">
                  <ImageIcon className="w-8 h-8 mb-1" />
                  <div className="w-6 h-1.5 bg-slate-300 rounded-full"></div>
                  <div className="w-4 h-1 bg-slate-300 rounded-full mt-0.5"></div>
                </div>
              </div>
            )}
            <Image
              src={src}
              alt={alt}
              fill
              sizes="128px"
              className="object-cover"
              priority={priority}
              onError={handleError}
              onLoad={handleLoad}
            />
          </>
        )}
      </div>
    );
  }
);

ImageThumb.displayName = 'ImageThumb';

export { ImageThumb };
