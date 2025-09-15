// src/components/analytics/context.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Filters } from '@/types/analytics';

export const AnalyticsContext = createContext<{
  filters: Filters;
  updateFilters: (updates: Partial<Filters>) => void;
  resetFilters: () => void;
} | undefined>(undefined);

const defaultFilters: Filters = {
  range: { from: '-30d', to: 'now' },
  compare: false,
};

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const updateFilters = useCallback((updates: Partial<Filters>) => {
    setFilters(prev => ({
      ...prev,
      ...updates,
      segment: {
        ...prev.segment,
        ...(updates.segment || {}),
      },
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return (
    <AnalyticsContext.Provider value={{ filters, updateFilters, resetFilters }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
