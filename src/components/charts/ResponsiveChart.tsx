'use client';

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  TooltipProps
} from 'recharts';
import { useMediaQuery } from '@/hooks/use-media-query';

// Tipos de gráficos disponíveis
type ChartType = 'line' | 'area' | 'bar';

// Tipos para os dados do gráfico
export interface ChartDataPoint {
  [key: string]: string | number;
  label: string;
}

interface ChartTooltipProps extends TooltipProps<number, string> {
  color?: string;
  valueFormatter?: (value: number) => string;
}

interface ResponsiveChartProps {
  data: ChartDataPoint[];
  type?: ChartType;
  dataKey: string;
  xAxisKey?: string;
  title?: string;
  color?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  height?: number;
  className?: string;
  valueFormatter?: (value: number) => string;
}
// Componente de Tooltip customizado
const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
  color = '#3072F9',
  valueFormatter = (value) => value.toLocaleString('pt-BR')
}) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-muted-foreground">{label}</p>
      <p className="font-bold text-foreground" style={{ color }}>
        {valueFormatter(Number(payload[0].value))}
      </p>
    </div>
  );
};

export const ResponsiveChart: React.FC<ResponsiveChartProps> = ({
  data = [],
  type = 'line',
  dataKey,
  xAxisKey = 'label',
  title,
  color = 'hsl(var(--primary))',
  showGrid = true,
  showLegend = true,
  height = 300,
  className = '',
  valueFormatter
}) => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(max-width: 768px)');

  // Configurações responsivas
  const chartConfig = useMemo(() => ({
    margin: isMobile 
      ? { top: 10, right: 5, bottom: 10, left: 0 } 
      : isTablet 
        ? { top: 15, right: 10, bottom: 15, left: 5 }
        : { top: 15, right: 20, bottom: 15, left: 10 },
    fontSize: isMobile ? 10 : isTablet ? 11 : 12,
    strokeWidth: isMobile ? 2 : 3,
    yAxisWidth: isMobile ? 30 : isTablet ? 40 : 50,
    xAxisInterval: isMobile ? 2 : isTablet ? 1 : 0,
    legendHeight: isMobile ? 20 : isTablet ? 24 : 30,
  }), [isMobile, isTablet]);

  // Renderiza o gráfico baseado no tipo
  const renderChart = () => {
    const commonProps = {
      data,
      margin: chartConfig.margin,
    };

    const axisProps = {
      tick: { 
        fontSize: chartConfig.fontSize,
        fill: 'hsl(var(--muted-foreground))',
      },
      stroke: 'hsl(var(--border))',
      tickLine: false,
    };

    const chartProps = {
      ...commonProps,
      children: (
        <>
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              vertical={false}
            />
          )}
          <XAxis 
            dataKey={xAxisKey}
            {...axisProps}
            interval={chartConfig.xAxisInterval}
            axisLine={false}
          />
          <YAxis 
            {...axisProps}
            width={chartConfig.yAxisWidth}
            axisLine={false}
            tickFormatter={valueFormatter}
          />
          <Tooltip 
            content={<ChartTooltip color={color} valueFormatter={valueFormatter} />} 
          />
          {showLegend && (
            <Legend 
              wrapperStyle={{ 
                paddingTop: chartConfig.legendHeight,
                fontSize: chartConfig.fontSize,
              }}
              formatter={(value) => (
                <span className="text-muted-foreground">
                  {value}
                </span>
              )}
            />
          )}
        </>
      ),
    };

    const seriesProps = {
      dataKey,
      stroke: color,
      fill: color,
      strokeWidth: chartConfig.strokeWidth,
      activeDot: !isMobile && { r: 6 },
      dot: !isMobile,
      fillOpacity: 0.2,
      radius: [4, 4, 0, 0],
    };

    switch (type) {
      case 'area':
        return (
          <AreaChart {...chartProps}>
            <Area type="monotone" {...seriesProps} />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...chartProps}>
            <Bar {...seriesProps} radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      case 'line':
      default:
        return (
          <LineChart {...chartProps}>
            <Line type="monotone" {...seriesProps} />
          </LineChart>
        );
    }
  };

  return (
    <div className={`cq p-fluid-3 rounded-xl border bg-card ${className}`}>
      {title && (
        <h3 className="text-fluid-base font-semibold mb-4 text-foreground">
          {title}
        </h3>
      )}
      <div 
        className="w-full" 
        style={{ 
          aspectRatio: '16/9',
          minHeight: `${height}px`,
          maxHeight: isMobile ? '300px' : '400px'
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Exemplo de uso com dados
export const UsersActiveChart: React.FC<{ 
  data?: ChartDataPoint[];
  className?: string;
}> = ({ 
  data,
  className = '' 
}) => {
  // Dados de exemplo se não fornecidos
  const defaultData: ChartDataPoint[] = [
    { label: 'Jan', ativos: 4000 },
    { label: 'Fev', ativos: 3000 },
    { label: 'Mar', ativos: 5000 },
    { label: 'Abr', ativos: 2780 },
    { label: 'Mai', ativos: 5890 },
    { label: 'Jun', ativos: 4390 },
  ];

  return (
    <ResponsiveChart
      data={data || defaultData}
      type="area"
      dataKey="ativos"
      xAxisKey="label"
      title="Usuários Ativos"
      className={className}
      valueFormatter={(value) => value.toLocaleString('pt-BR')}
    />
  );
};

export default ResponsiveChart;
