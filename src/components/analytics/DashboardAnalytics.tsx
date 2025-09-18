import React from 'react';
import { TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react';
import { AutoGrid } from '@/components/layout';

// Componente de Card Analytics
interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  change,
  icon,
  trend = 'neutral',
  className = ''
}) => {
  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400'
  };

  return (
    <div 
      className={`
        cq
        p-fluid-3 sm:p-fluid-4
        rounded-xl 
        border border-border
        bg-card
        hover:shadow-lg hover:shadow-accent/5
        transition-all duration-300
        ${className}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-fluid-sm text-muted-foreground truncate">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold mt-1 text-fluid-lg">
            {value}
          </h3>
          {change && (
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp 
                className={`w-4 h-4 ${trendColors[trend]}`} 
                aria-hidden="true"
              />
              <span className={`text-fluid-sm font-medium ${trendColors[trend]}`}>
                {change}
              </span>
            </div>
          )}
        </div>
        <div 
          className="
            p-2 sm:p-3 
            rounded-lg 
            bg-primary/10 
            text-primary
            flex-shrink-0
          "
        >
          {React.cloneElement(icon as React.ReactElement, {
            className: 'w-5 h-5 sm:w-6 sm:h-6'
          })}
        </div>
      </div>
    </div>
  );
};

// Componente Dashboard Principal
interface DashboardAnalyticsProps {
  className?: string;
  data?: Array<{
    title: string;
    value: string | number;
    change?: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
  }>;
}

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
  className = '',
  data: customData
}) => {
  // Dados de exemplo - em produção viriam de uma API
  const defaultData = [
    {
      title: 'Receita Total',
      value: 'R$ 45.231',
      change: '+12.5%',
      icon: <DollarSign />,
      trend: 'up' as const
    },
    {
      title: 'Usuários Ativos',
      value: '2.350',
      change: '+5.2%',
      icon: <Users />,
      trend: 'up' as const
    },
    {
      title: 'Pedidos',
      value: '1.423',
      change: '-2.4%',
      icon: <ShoppingCart />,
      trend: 'down' as const
    },
    {
      title: 'Taxa de Conversão',
      value: '3.2%',
      change: '+0.5%',
      icon: <TrendingUp />,
      trend: 'up' as const
    }
  ];

  const analyticsData = customData || defaultData;

  return (
    <div className={`w-full ${className}`}>
      <AutoGrid 
        min={240} 
        className="md:grid-cols-2 lg:grid-cols-4"
      >
        {analyticsData.map((item, index) => (
          <AnalyticsCard
            key={index}
            title={item.title}
            value={item.value}
            change={item.change}
            icon={item.icon}
            trend={item.trend}
          />
        ))}
      </AutoGrid>
    </div>
  );
};

// Exportar como default também
export default DashboardAnalytics;
