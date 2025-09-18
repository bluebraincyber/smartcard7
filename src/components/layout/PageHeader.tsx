'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileLayout } from '@/hooks/useMobileLayout';

interface PageHeaderProps {
  title: string;
  description: string | React.ReactNode;
  icon?: LucideIcon;
  className?: string;
  iconClassName?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  className = '',
  iconClassName = '',
}: PageHeaderProps) {
  const isMobile = useMobileLayout();
  
  return (
    <div className={cn(
      'border-b border-border bg-card/50 backdrop-blur-sm py-6 sm:py-8',
      className
    )}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
          {Icon && (
            <div className={cn(
              'mx-auto sm:mx-0 flex items-center justify-center rounded-2xl bg-primary p-3 mb-4 sm:mb-6 shadow-lg',
              isMobile ? 'h-14 w-14' : 'h-16 w-16',
              iconClassName
            )}>
              <Icon className={cn(
                'text-primary-foreground',
                isMobile ? 'h-6 w-6' : 'h-7 w-7'
              )} />
            </div>
          )}
          
          <h1 className={cn(
            'font-bold text-foreground mb-2 sm:mb-4',
            isMobile ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'
          )}>
            {title}
          </h1>
          
          {description && (
            <p className={cn(
              'text-muted-foreground max-w-3xl mx-auto sm:mx-0',
              'leading-relaxed',
              isMobile ? 'text-base' : 'text-lg'
            )}>
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
