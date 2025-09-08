'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface Tab {
  id: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

export interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  scrollable?: boolean;
}

const TabBar = React.forwardRef<HTMLDivElement, TabBarProps>(
  ({
    tabs,
    activeTab,
    onTabChange,
    className,
    variant = 'underline',
    size = 'md',
    scrollable = true,
    ...props
  }, ref) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const sizes = {
      sm: 'text-xs sm:text-sm px-2 sm:px-3 py-2 min-w-12 sm:min-w-16',
      md: 'text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 min-w-16 sm:min-w-20', // min 80dp conforme especificação
      lg: 'text-base sm:text-lg px-4 sm:px-6 py-3 sm:py-4 min-w-20 sm:min-w-24'
    };

    const getTabClasses = (tab: Tab) => {
      const isactive = tab.id === activeTab;
      const baseClasses = cn(
        'relative flex items-center justify-center gap-1 sm:gap-2 font-medium transition-all duration-200',
        'cursor-pointer select-none whitespace-nowrap',
        sizes[size],
        tab.disabled && 'opacity-50 cursor-not-allowed'
      );

      if (variant === 'underline') {
        return cn(
          baseClasses,
          isactive ? 'tab-active' : 'tab-inactive',
          'border-b-2 hover:text-red-600'
        );
      }

      if (variant === 'pills') {
        return cn(
          baseClasses,
          'rounded-full',
          isactive 
            ? 'bg-red-100 text-red-700 border border-red-200' 
            : 'text-gray-600 hover:bg-gray-100'
        );
      }

      // default variant
      return cn(
        baseClasses,
        isactive 
          ? 'text-red-600 bg-red-50' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      );
    };

    const handleTabClick = (tab: Tab) => {
      if (tab.disabled) return;
      onTabChange(tab.id);
    };

    React.useEffect(() => {
      // Auto-scroll to active tab if scrollable
      if (scrollable && scrollRef.current) {
        const activeElement = scrollRef.current.querySelector(`[data-tab-id="${activeTab}"]`);
        if (activeElement) {
          activeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }
      }
    }, [activeTab, scrollable]);

    return (
      <div
        ref={ref}
        className={cn(
          'relative bg-white border-b border-gray-200',
          className
        )}
        {...props}
      >
        <div
          ref={scrollRef}
          className={cn(
            'flex',
            scrollable ? 'overflow-x-auto scrollbar-hide px-2 sm:px-4' : 'justify-center',
            'gap-0.5 sm:gap-1'
          )}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              data-tab-id={tab.id}
              className={getTabClasses(tab)}
              onClick={() => handleTabClick(tab)}
              disabled={tab.disabled}
              role="tab"
              aria-selected={tab.id === activeTab}
              aria-controls={`tabpanel-${tab.id}`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={cn(
                  'text-xs px-1 sm:px-1.5 py-0.5 rounded-full min-w-[1rem] text-center',
                  tab.id === activeTab 
                    ? 'bg-red-200 text-red-800' 
                    : 'bg-gray-200 text-gray-600'
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Underline animation for active tab */}
        {variant === 'underline' && (
          <style jsx>{`
            .tab-active::after {
              content: '';
              position: absolute;
              bottom: -2px;
              left: 50%;
              transform: translateX(-50%);
              width: calc(100% - 8px);
              height: 2px;
              background-color: var(--brand-red);
              border-radius: 8px;
              transition: all 180ms ease-out;
            }
            @media (min-width: 640px) {
              .tab-active::after {
                width: calc(100% - 16px);
              }
            }
          `}</style>
        )}
      </div>
    );
  }
);

TabBar.displayName = 'TabBar';

export { TabBar };
