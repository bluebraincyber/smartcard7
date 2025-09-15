import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { TrendingUpIcon, TrendingDownIcon, UsersIcon, EyeIcon, ClockIcon, DownloadIcon } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import the chart with no SSR
const ActiveUsers24hChart = dynamic(
  () => import("@/components/charts/ActiveUsers24hChart"),
  { ssr: false }
);

// Componente de gráfico de barras
const BarChart = ({ data }: { data: Array<{ name: string; views: number }> }) => {
  const maxValue = Math.max(...data.map(item => item.views));
  
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-gray-100 hover:-translate-y-1">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <EyeIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Visualizações por Página</h3>
              <p className="text-sm text-gray-500">Últimos 30 dias</p>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <span className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-1"></span>
            Visualizações
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="h-64">
          <div className="h-full flex flex-col">
            <div className="flex-1 relative">
              <div className="absolute inset-0 flex flex-col justify-between">
                {[100, 75, 50, 25, 0].map((percent, i) => (
                  <div key={i} className="flex items-start h-0">
                    <span className="text-xs text-gray-400 -mt-2 mr-2 w-8 text-right">
                      {Math.round((maxValue * percent) / 100).toLocaleString()}
                    </span>
                    <div className="flex-1 border-t border-gray-100"></div>
                  </div>
                ))}
              </div>
              
              <div className="h-full pl-10 flex items-end justify-between gap-4">
                {data.map((item, index) => {
                  const heightPercent = (item.views / maxValue) * 100;
                  return (
                    <div key={index} className="flex flex-col items-center flex-1 group">
                      <div 
                        className="relative w-full rounded-t-lg bg-gradient-to-t from-purple-500 to-purple-400 transition-all duration-300 hover:shadow-lg hover:shadow-purple-200"
                        style={{ height: `${heightPercent}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-medium py-1 px-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {item.views.toLocaleString()} visualizações
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-600 font-medium">
                        {item.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="h-8 flex items-center pl-10 border-t border-gray-100">
              <span className="text-xs text-gray-400">Páginas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de métrica
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
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) => (
  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-gray-100 hover:-translate-y-1">
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          change > 0 
            ? 'bg-green-50 text-green-700' 
            : change < 0 
            ? 'bg-red-50 text-red-700' 
            : 'bg-gray-50 text-gray-700'
        }`}>
          {change > 0 ? (
            <TrendingUpIcon className="w-3 h-3" />
          ) : change < 0 ? (
            <TrendingDownIcon className="w-3 h-3" />
          ) : null}
          {change !== 0 ? `${Math.abs(change)}%` : '0%'}
        </div>
      </div>
      <h3 className="text-sm text-gray-500 mb-1">{title}</h3>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

// Tipos para os dados
interface ActiveUserData {
  name: string;
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

// Função para gerar dados simulados
const generateMockData = (days: number): AnalyticsData => {
  // Implementação existente...
  return {
    activeUsers: [],
    pageViews: [],
    metrics: {
      totalUsers: { value: '0', change: 0 },
      bounceRate: { value: '0%', change: 0 },
      avgSession: { value: '0m 0s', change: 0 }
    }
  };
};

// Componente V1
const V1Analytics = () => {
  const [data, setData] = React.useState<AnalyticsData>({
    activeUsers: [],
    pageViews: [],
    metrics: {
      totalUsers: { value: '0', change: 0 },
      bounceRate: { value: '0%', change: 0 },
      avgSession: { value: '0m 0s', change: 0 }
    }
  });

  React.useEffect(() => {
    // Simular carregamento de dados
    const mockData = generateMockData(30);
    setData(mockData);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Usuários"
          value={data.metrics.totalUsers.value}
          change={data.metrics.totalUsers.change}
          icon={UsersIcon}
          color="blue"
        />
        <MetricCard
          title="Taxa de Rejeição"
          value={data.metrics.bounceRate.value}
          change={data.metrics.bounceRate.change}
          icon={TrendingDownIcon}
          color="red"
        />
        <MetricCard
          title="Tempo Médio"
          value={data.metrics.avgSession.value}
          change={data.metrics.avgSession.change}
          icon={ClockIcon}
          color="green"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Usuários Ativos (24h)</h3>
          <div className="h-64">
            <ActiveUsers24hChart data={data.activeUsers} />
          </div>
        </div>
        <BarChart data={data.pageViews} />
      </div>
    </div>
  );
};

export default V1Analytics;
