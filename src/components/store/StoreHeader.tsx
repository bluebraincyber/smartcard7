'use client';

import * as React from 'react';
import { EditableImageCard } from '@/components/ui/editable-image-card';
import { useEffect, useState } from 'react';

type StoreHeaderProps = {
  name: string;
  description?: string | null;
  coverImage?: string | null;
  profileImage?: string | null;
  storeId?: string | number | null;
  slugUrl?: string | null;
  primaryColor?: string | null;
  showSearch?: boolean;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
  statusPill?: React.ReactNode;
  className?: string;
  accent?: 'none' | 'bar' | 'shadow';
  variant?: 'overlay' | 'stacked';
  onCoverImageUpdate?: (url: string) => void;
  onProfileImageUpdate?: (url: string) => void;
};

export default function StoreHeader({
  name,
  description,
  coverImage,
  profileImage,
  storeId,
  slugUrl,
  primaryColor,
  showSearch = true,
  searchPlaceholder = 'Buscar itens…',
  actions,
  statusPill,
  className = '',
  accent = 'bar',
  variant = 'stacked',
  onCoverImageUpdate,
  onProfileImageUpdate,
}: StoreHeaderProps) {
  const [currentCover, setCurrentCover] = useState(coverImage);
  const [currentProfile, setCurrentProfile] = useState(profileImage);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentCover(coverImage);
  }, [coverImage]);

  useEffect(() => {
    setCurrentProfile(profileImage);
  }, [profileImage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className={`relative w-full overflow-hidden rounded-3xl border border-border bg-card/40 shadow-sm ${className}`}>
      <div className="relative z-0 h-[156px] sm:h-[208px] md:h-[244px] overflow-hidden group">
        <EditableImageCard
          type="cover"
          storeId={storeId || ''}
          currentImage={currentCover}
          onUploadSuccess={(url) => {
            setCurrentCover(url);
            onCoverImageUpdate?.(url);
          }}
          onError={(error) => setError(error)}
          className="absolute inset-0 h-full w-full"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent pointer-events-none z-10" 
             style={{ height: '70%', bottom: 0, left: 0, right: 0 }} />
        
        {accent === 'bar' && primaryColor && (
          <div 
            className="absolute inset-x-0 bottom-0 h-px opacity-40 z-20 pointer-events-none" 
            style={{ background: `color-mix(in oklab, ${primaryColor} 85%, black)` }} 
          />
        )}
      </div>

      <div className={`relative z-[1] px-4 sm:px-6 lg:px-8 ${variant === 'overlay' ? 'pb-5 sm:pb-6' : 'py-5'}`}>
        <div className={`${variant === 'overlay' ? '-mt-10 sm:-mt-12' : ''} flex items-end gap-3 min-w-0`}>
          <div className="relative z-10 mx-4 -mt-8 sm:-mt-12">
            <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-xl border-4 border-background shadow-md overflow-hidden">
              <EditableImageCard
                type="profile"
                storeId={storeId || ''}
                currentImage={currentProfile}
                onUploadSuccess={(url) => {
                  setCurrentProfile(url);
                  onProfileImageUpdate?.(url);
                }}
                onError={(error) => setError(error)}
                className="h-full w-full"
              />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="font-semibold text-[clamp(1.125rem,2.2vw,1.75rem)] truncate">{name}</h1>
              {statusPill}
            </div>
            {slugUrl && (
              <a 
                href={slugUrl} 
                className="block text-xs text-muted-foreground hover:underline truncate" 
                target="_blank" 
                rel="noreferrer"
              >
                {slugUrl}
              </a>
            )}
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}
          </div>

          {actions && <div className="hidden md:flex items-center gap-2 shrink-0">{actions}</div>}
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          {showSearch && (
            <input
              className="h-11 w-full rounded-xl border bg-background/80 px-4 placeholder:text-muted-foreground/60 shadow-sm"
              placeholder={searchPlaceholder}
            />
          )}
          {actions && <div className="md:hidden flex gap-2">{actions}</div>}
        </div>
      </div>
      
      {error && (
        <div className="absolute top-4 right-4 z-50 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}
