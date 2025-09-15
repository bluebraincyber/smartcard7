"use client";

import { Suspense, useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Download, RefreshCw } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the analytics components with SSR disabled
const AnalyticsV1 = dynamic(() => import('./analytics-v1'), {
  ssr: false,
  loading: () => <AnalyticsSkeleton />
});

const AnalyticsV2 = dynamic(() => import('./analytics-v2'), {
  ssr: false,
  loading: () => <AnalyticsSkeleton />
});

// Dynamically import charts
const ActiveUsers24hChart = dynamic(() => import('@/components/charts/ActiveUsers24hChart'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
});

// Icons
const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const TrendingDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DownloadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[100px] mb-2" />
              <Skeleton className="h-4 w-[150px]" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="h-[400px]">
            <CardHeader>
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// MetricCard component
const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color 
}: { 
  title: string; 
  value: string; 
  change: number; 
  icon: any; 
  color: string 
}) => {
  const isPositive = change > 0;
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600'
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          <span>{isPositive ? '+' : ''}{change}%</span>
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  );
};

// Simple BarChart component inline
const SimpleBarChart = ({ data }: { data: { name: string; views: number }[] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Nenhum dado disponível
      </div>
    );
  }

  const maxViews = Math.max(...data.map(item => item.views));

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-4">
          <div className="w-20 text-sm text-gray-600 text-right">{item.name}</div>
          <div className="flex-1 flex items-center gap-2">
            <div 
              className="bg-blue-500 h-6 rounded transition-all duration-300 hover:bg-blue-600"
              style={{ width: `${(item.views / maxViews) * 100}%`, minWidth: '8px' }}
            />
            <span className="text-sm text-gray-700 font-medium">{item.views.toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// Tipos para os dados
interface ActiveUserData {
  name: string;  // Formato: "DD/MM"
  users: number;
}

interface PageViewData {
  name: string;
  views: number;
}

interface MetricsData {
  totalUsers: { value: string; change: number };
  bounceRate: { value: string; change: number };
  avgSession: { value: string; change: number };
}

interface AnalyticsData {
  activeUsers: ActiveUserData[];
  pageViews: PageViewData[];
  metrics: MetricsData;
}

// Função para gerar dados simulados baseados no período
const generateMockData = (days: number): AnalyticsData => {
  const now = new Date();
  const activeUsers: ActiveUserData[] = [];
  const pageViews: PageViewData[] = [];
  
  // Gerar dados de usuários ativos para o período
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Variação aleatória baseada no dia para parecer mais realista
    const baseUsers = 300 + (Math.sin(i) * 100);
    const randomVariation = Math.floor(Math.random() * 200) - 100;
    const users = Math.max(100, Math.floor(baseUsers + randomVariation));
    
    activeUsers.push({
      name: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      users: users
    });
  }
  
  // Gerar visualizações de página
  const pages = ["Home", "Dashboard", "Settings", "Reports", "Profile", "Analytics"];
  pages.forEach(page => {
    pageViews.push({
      name: page,
      views: Math.floor(Math.random() * 1000) + 100
    });
  });
  
  // Calcular métricas
  const totalUsers = activeUsers.reduce((sum, day) => sum + day.users, 0);
  
  return {
    activeUsers,
    pageViews,
    metrics: {
      totalUsers: { 
        value: totalUsers > 1000 ? `${(totalUsers / 1000).toFixed(1)}K` : totalUsers.toString(),
        change: Math.floor(Math.random() * 20) - 5 // Variação aleatória entre -5 e 15
      },
      bounceRate: { 
        value: `${Math.floor(Math.random() * 30) + 10}%`, 
        change: Math.floor(Math.random() * 10) - 5
      },
      avgSession: { 
        value: `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 9)} min`, 
        change: Math.floor(Math.random() * 15) - 5
      }
    }
  };
}

// Generate mock data for ActiveUsers24hChart (last 24 hours)
const generate24hActiveUsersData = () => {
  const data = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 60 * 60 * 1000); // Hourly data
    data.push({ x: date, y: Math.floor(Math.random() * 1000) + 500 }); // Random users between 500 and 1500
  }
  return data;
};

// Dados iniciais para evitar erros de carregamento
const initialData: AnalyticsData = {
  activeUsers: [],
  pageViews: [],
  metrics: {
    totalUsers: { value: '0', change: 0 },
    bounceRate: { value: '0%', change: 0 },
    avgSession: { value: '0 min', change: 0 }
  }
};

// This is the main page component
export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<"7" | "30" | "90">("30");
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(initialData);

  // Gerar dados baseados no período selecionado
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simular carregamento
        await new Promise(resolve => setTimeout(resolve, 500));
        const days = parseInt(dateRange);
        const result = generateMockData(days);
        setAnalyticsData(result);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dateRange]);
  
  const activeUsers24hData = useMemo(() => generate24hActiveUsersData(), [dateRange]);

  function downloadCSV() {
    const rows = [
      ["Mês", "Usuários Ativos"],
      ...analyticsData.activeUsers.map((r: { name: string; users: number }) => [r.name, String(r.users)])
    ];
    const csv = rows.map((r: any[]) => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `usuarios-ativos_${dateRange}dias.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
              <p className="text-gray-600">Acompanhe o desempenho da sua aplicação</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  className="appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2 pr-8 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as "7" | "30" | "90")}
                  disabled={isLoading}
                >
                  <option value="7">Últimos 7 dias</option>
                  <option value="30">Últimos 30 dias</option>
                  <option value="90">Últimos 90 dias</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                {isLoading && (
                  <div className="absolute right-8 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                )}
              </div>
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <DownloadIcon className="w-4 h-4" />
                Exportar Relatório
              </button>
            </div>
          </div>
        </header>

        {/* Cards de métricas */}
        <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <MetricCard 
            title="Total de Usuários" 
            value={analyticsData.metrics.totalUsers.value} 
            change={analyticsData.metrics.totalUsers.change}
            icon={UsersIcon}
            color="blue"
          />
          <MetricCard 
            title="Taxa de Rejeição" 
            value={analyticsData.metrics.bounceRate.value} 
            change={analyticsData.metrics.bounceRate.change}
            icon={TrendingDownIcon}
            color="orange"
          />
          <MetricCard 
            title="Duração Média" 
            value={analyticsData.metrics.avgSession.value} 
            change={analyticsData.metrics.avgSession.change}
            icon={ClockIcon}
            color="green"
          />
        </section>

        {/* Gráficos */}
        <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-6">
              <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg" />}>
                <ActiveUsers24hChart data={activeUsers24hData} height={256} maWindow={7} />
              </Suspense>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Visualizações por Página</h3>
              <SimpleBarChart data={analyticsData.pageViews} />
            </div>
          </div>
        </section>

        {/* Mapa de geolocalização */}
        <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-gray-100 hover:-translate-y-1">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Mapa de Usuários</h3>
                <p className="text-sm text-gray-500">Distribuição geográfica</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex h-64 items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">Componente de Mapa</p>
                <p className="text-sm text-gray-500 mt-1">Integração em desenvolvimento</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
