// src/types/analytics.ts
export type DateRange = { from: string; to: string };

export type Delta = {
  value: number;
  direction: "up" | "down" | "flat";
};

export type Kpis = {
  totalUsers: number;
  bounceRate: number;       // 0..1 or %
  avgSessionMin: number;    // minutes
  conversions?: number;
};

export type KpisWithDelta = { 
  current: Kpis; 
  delta?: Partial<Record<keyof Kpis, Delta>> 
};

export type XYPoint = { 
  x: string;  // ISO hour
  y: number;
};

export type Series24h = {
  series: XYPoint[];
  baseline7d: XYPoint[];    // average same hour in last 7 days
  sigma: XYPoint[];         // standard deviation
  anomalies: string[];      // x (ISO) marked as outliers
};

export type PageRow = {
  path: string;
  title?: string;
  views: number;
  avgTimeSec: number;
  varPct?: number;          // -0.28 = -28%
};

export type GeoRow = { 
  city: string; 
  state: string; 
  users: number 
};

export type SortDirection = 'asc' | 'desc';
export type SortField = 'views' | 'avgTimeSec' | 'varPct';

export type Filters = {
  range: DateRange;
  compare: boolean;
  storeId?: string;
  segment?: {
    channel?: string;
    device?: string;
  };
};

export type AnalyticsContextType = {
  filters: Filters;
  setFilters: (updater: (prev: Filters) => Filters) => void;
  isLoading: boolean;
  error: Error | null;
};
