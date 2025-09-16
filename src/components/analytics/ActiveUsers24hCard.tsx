"use client";

import React from 'react';
import { useAnalytics } from './context';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data - replace with real API call
const generateMockData = () => {
  const now = new Date();
  const hours = Array.from({ length: 24 }, (_, i) => {
    const date = new Date(now);
    date.setHours(i, 0, 0, 0);
    const hour = date.getHours();
    const baseValue = 100 + Math.sin(i / 24 * Math.PI * 2) * 50 + Math.random() * 30;
    const baseline = 80 + Math.sin(i / 24 * Math.PI * 2) * 40;
    const sigma = 15 + Math.random() * 5;
    
    return {
      hour: format(date, 'HH:00'),
      value: Math.round(Math.max(0, baseValue)),
      baseline: Math.round(baseline),
      lowerBound: Math.round(Math.max(0, baseline - sigma)),
      upperBound: Math.round(baseline + sigma),
      isAnomaly: Math.abs(baseValue - baseline) > 2 * sigma,
    };
  });
  
  return hours;
};

export function ActiveUsers24hCard() {
  const { filters } = useAnalytics();
  const data = React.useMemo(() => generateMockData(), [filters]);
  
  const anomalies = data.filter(d => d.isAnomaly);
  
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis 
            dataKey="hour" 
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            width={35}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-card p-3 rounded-lg shadow-lg border border-border">
                    <p className="text-sm text-muted-foreground">{data.hour}</p>
                    <p className="font-medium">
                      <span className="text-primary">{data.value}</span> usuários
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Média: {data.baseline} usuários
                    </p>
                    {data.isAnomaly && (
                      <p className="text-sm text-destructive mt-1">
                        Anomalia detectada
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          
          {/* Confidence interval band */}
          <Area
            type="monotone"
            dataKey="upperBound"
            stroke="none"
            fill="hsl(var(--muted))"
            fillOpacity={0.3}
            stackId="confidence"
          />
          <Area
            type="monotone"
            dataKey="lowerBound"
            stroke="none"
            fill="hsl(var(--background))"
            fillOpacity={1}
            stackId="confidence"
          />
          
          {/* Baseline */}
          <Area
            type="monotone"
            dataKey="baseline"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fillOpacity={0}
            activeDot={false}
          />
          
          {/* Main value line */}
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
            activeDot={{
              r: 6,
              stroke: 'hsl(var(--background))',
              strokeWidth: 2,
              fill: 'hsl(var(--primary))',
              style: { filter: 'drop-shadow(0 0 2px hsl(var(--primary) / 0.8))' }
            }}
          />
          
          {/* Anomaly indicators */}
          {anomalies.map((point, index) => (
            <circle
              key={index}
              cx={point.hour}
              cy={point.value}
              r={4}
              fill="hsl(var(--destructive))"
              stroke="hsl(var(--background))"
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
