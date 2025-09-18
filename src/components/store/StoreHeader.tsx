'use client';

import * as React from 'react';
import Image from 'next/image';

type StoreHeaderProps = {
  name: string;
  description?: string | null;
  coverImage?: string | null;
  profileImage?: string | null;
  slugUrl?: string | null;
  primaryColor?: string | null;
  showSearch?: boolean;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
  statusPill?: React.ReactNode;
  className?: string;
  accent?: 'none' | 'bar' | 'shadow';
  variant?: 'overlay' | 'stacked';
};

export default function StoreHeader({
  name,
  description,
  coverImage,
  profileImage,
  slugUrl,
  primaryColor,
  showSearch = true,
  searchPlaceholder = 'Buscar itens…',
  actions,
  statusPill,
  className = '',
  accent = 'bar',
  variant = 'stacked',
}: StoreHeaderProps) {
  const coverSrc = coverImage ?? '/images/placeholder-cover.jpg';
  const avatarSrc = profileImage ?? '/images/placeholder-logo.png';

  return (
    <header className={`relative w-full overflow-hidden rounded-3xl border border-border bg-card/40 shadow-sm ${className}`}>
      {/* capa */}
      <div className="relative z-0 h-[156px] sm:h-[208px] md:h-[244px] overflow-hidden">
        <Image 
          src={coverSrc} 
          alt={`Capa da loja ${name}`} 
          fill 
          className="object-cover" 
          priority 
          sizes="100vw" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/30 to-transparent" />
        {accent === 'bar' && primaryColor && (
          <div 
            className="absolute inset-x-0 bottom-0 h-px opacity-40" 
            style={{ background: `color-mix(in oklab, ${primaryColor} 85%, black)` }} 
          />
        )}
      </div>

      {/* conteúdo */}
      <div className={`relative z-[1] px-4 sm:px-6 lg:px-8 ${variant === 'overlay' ? 'pb-5 sm:pb-6' : 'py-5'}`}>
        <div className={`${variant === 'overlay' ? '-mt-10 sm:-mt-12' : ''} flex items-end gap-3 min-w-0`}>
          {/* AVATAR NO HEADER */}
          <div className="relative size-16 sm:size-20 md:size-24 rounded-full bg-background ring-1 ring-black/5 shadow-xl overflow-hidden shrink-0">
            <Image 
              src={avatarSrc} 
              alt={`Logo da loja ${name}`} 
              fill 
              className="object-cover" 
              sizes="96px" 
            />
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

          {/* AÇÕES à direita (desktop) */}
          {actions && <div className="hidden md:flex items-center gap-2 shrink-0">{actions}</div>}
        </div>

        {/* busca + ações no mobile */}
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
    </header>
  );
}
