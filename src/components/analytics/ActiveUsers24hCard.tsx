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
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis 
            dataKey="hour" 
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickLine={false}
            axisLine={false}
            width={35}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                    <p className="text-sm text-gray-500">{data.hour}</p>
                    <p className="font-medium">
                      <span className="text-blue-600">{data.value}</span> usuários
                    </p>
                    <p className="text-sm text-gray-500">
                      Média: {data.baseline} usuários
                    </p>
                    {data.isAnomaly && (
                      <p className="text-sm text-brand-blue mt-1">
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
            fill="#e2e8f0"
            fillOpacity={0.3}
            stackId="confidence"
          />
          <Area
            type="monotone"
            dataKey="lowerBound"
            stroke="none"
            fill="#ffffff"
            fillOpacity={1}
            stackId="confidence"
          />
          
          {/* Baseline */}
          <Area
            type="monotone"
            dataKey="baseline"
            stroke="#94a3b8"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fillOpacity={0}
            activeDot={false}
          />
          
          {/* Main value line */}
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
            activeDot={{
              r: 6,
              stroke: '#ffffff',
              strokeWidth: 2,
              fill: '#3b82f6',
              style: { filter: 'drop-shadow(0 0 2px rgba(59, 130, 246, 0.8))' }
            }}
          />
          
          {/* Anomaly indicators */}
          {anomalies.map((point, index) => (
            <circle
              key={index}
              cx={point.hour}
              cy={point.value}
              r={4}
              fill="#ef4444"
              stroke="#ffffff"
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
