// src/components/analytics/KpiCard.tsx
'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Delta } from '@/types/analytics';

interface KpiCardProps {
  title: string;
  value: string | number;
  delta?: Delta;
  icon?: LucideIcon;
  isReverseTrend?: boolean;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function KpiCard({
  title,
  value,
  delta,
  icon: Icon,
  isReverseTrend = false,
  onClick,
  className,
  children,
}: KpiCardProps) {
  const renderDelta = () => {
    if (!delta) return null;

    let isPositive = delta.direction === 'up';
    let isNegative = delta.direction === 'down';
    
    // Reverse the trend colors if needed (e.g., for bounce rate where lower is better)
    if (isReverseTrend) {
      [isPositive, isNegative] = [isNegative, isPositive];
    }
    
    const deltaValue = `${delta.value}%`;

    return (
      <div
        className={cn(
          'inline-flex items-center text-sm font-medium',
          isPositive ? 'text-green-600' : '',
          isNegative ? 'text-brand-blue' : '',
          !isPositive && !isNegative ? 'text-gray-500' : ''
        )}
      >
        {isPositive && <TrendingUp className="h-4 w-4 mr-1" />}
        {isNegative && <TrendingDown className="h-4 w-4 mr-1" />}
        {!isPositive && !isNegative && <Minus className="h-4 w-4 mr-1" />}
        {deltaValue}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'bg-white p-6 rounded-lg shadow-sm border border-gray-100',
        'transition-colors hover:shadow-md',
        onClick && 'cursor-pointer hover:bg-gray-50',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {delta ? renderDelta() : Icon && <Icon className="h-4 w-4 text-gray-400" />}
      </div>
      <div className="mt-2">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
      {children && <div className="mt-4 h-16">{children}</div>}
    </div>
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="animate-pulse bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-16 bg-gray-100 rounded"></div>
    </div>
  );
}
