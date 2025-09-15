"use client";

import React, { useMemo } from 'react';
import { KpiCard, KpiCardSkeleton } from '@/components/analytics/KpiCard';
import { useAnalytics } from '@/components/analytics/context';
import dynamic from 'next/dynamic';
import { Users, Clock, BarChart2, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { formatNumber, formatPercentage, formatTime } from '@/lib/analytics/stats';

// Dynamically import client-side only components
const ActiveUsers24hCard = dynamic(
  () => import('@/components/analytics/ActiveUsers24hCard').then(mod => mod.ActiveUsers24hCard),
  { ssr: false, loading: () => <KpiCardSkeleton /> }
);

const PagesRankingTable = dynamic(
  () => import('@/components/analytics/PagesRankingTable').then(mod => mod.PagesRankingTable),
  { ssr: false, loading: () => <KpiCardSkeleton /> }
);

const GeoUsersMap = dynamic(
  () => import('@/components/analytics/GeoUsersMap').then(mod => mod.GeoUsersMap),
  { ssr: false, loading: () => <KpiCardSkeleton /> }
);

type Delta = {
  value: number;
  direction: 'up' | 'down' | 'flat';
};

// Mock data - replace with real API calls
const mockKpis = {
  totalUsers: {
    current: 12453,
    previous: 10876,
  },
  bounceRate: {
    current: 0.42,
    previous: 0.38,
  },
  avgSession: {
    current: 126, // seconds
    previous: 118,
  },
  conversions: {
    current: 342,
    previous: 298,
  },
};

const calculateDelta = (current: number, previous: number): Delta => {
  if (previous === 0) return { value: 0, direction: 'flat' };
  const value = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(Math.round(value * 10) / 10),
    direction: value > 0 ? 'up' : value < 0 ? 'down' : 'flat',
  };
};

const V2Analytics = () => {
  const { filters } = useAnalytics();
  
  // Calculate deltas
  const deltas = useMemo(() => ({
    totalUsers: calculateDelta(mockKpis.totalUsers.current, mockKpis.totalUsers.previous),
    bounceRate: calculateDelta(mockKpis.bounceRate.current, mockKpis.bounceRate.previous),
    avgSession: calculateDelta(mockKpis.avgSession.current, mockKpis.avgSession.previous),
    conversions: calculateDelta(mockKpis.conversions.current, mockKpis.conversions.previous),
  }), [filters]);

  return (
    <div className="space-y-6">
      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total de Usuários"
          value={formatNumber(mockKpis.totalUsers.current)}
          delta={deltas.totalUsers}
          icon={Users}
        >
          {/* Mini sparkline would go here */}
        </KpiCard>

        <KpiCard
          title="Taxa de Rejeição"
          value={formatPercentage(mockKpis.bounceRate.current)}
          delta={deltas.bounceRate}
          icon={BarChart2}
          isReverseTrend
        >
          {/* Mini sparkline would go here */}
        </KpiCard>

        <KpiCard
          title="Tempo Médio"
          value={formatTime(mockKpis.avgSession.current)}
          delta={deltas.avgSession}
          icon={Clock}
        >
          {/* Mini sparkline would go here */}
        </KpiCard>

        <KpiCard
          title="Conversões"
          value={formatNumber(mockKpis.conversions.current)}
          delta={deltas.conversions}
          icon={ArrowUp}
        >
          {/* Mini sparkline would go here */}
        </KpiCard>
      </div>

      {/* Active Users 24h */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Usuários Ativos (24h)</h2>
        <ActiveUsers24hCard />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pages Ranking */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Ranking de Páginas</h2>
          <PagesRankingTable />
        </div>

        {/* Geo Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Usuários por Localização</h2>
          <GeoUsersMap />
        </div>
      </div>
    </div>
  );
};

export default V2Analytics;
