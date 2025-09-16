"use client";

import React, { useRef, useEffect, useState } from "react";
import { TrendingUpIcon } from "lucide-react";
import { format } from "date-fns";
// If the error persists, ensure you have installed date-fns:
// npm install date-fns
// npm install --save-dev @types/date-fns
// Note: First install date-fns and its types:
// npm install date-fns @types/date-fns
// Add to package.json: "date-fns": "^2.30.0"
// Run: npm install date-fns --save
// Run: npm install --save-dev @types/date-fns
// Add to package.json: "date-fns": "^2.30.0"
// Run: npm install date-fns

interface ActiveUsers24hChartProps {
  data: Array<{ x: Date; y: number }>;
  maWindow: number;
  height: number;
}

export function ActiveUsers24hChart({ data, height = 200, maWindow }: ActiveUsers24hChartProps) {
  const [chartHoverIndex, setChartHoverIndex] = useState<number | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);
  const [chartHeight, setChartHeight] = useState(0);

  useEffect(() => {
    const updateDimensions = () => {
      if (chartContainerRef.current) {
        setChartWidth(chartContainerRef.current.offsetWidth);
        setChartHeight(chartContainerRef.current.offsetHeight);
      }
    };

    updateDimensions(); // Define as dimensões iniciais
    window.addEventListener("resize", updateDimensions); // Atualiza ao redimensionar

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  const maxValue = Math.max(...data.map((point) => point.y));
  const PADDING = 40;
  const SIDE_PADDING = 20; // Padding lateral ajustado para ser menor
  const innerWidth = chartWidth - SIDE_PADDING * 2; // Usa o padding lateral
  const innerHeight = chartHeight - PADDING * 2;

  const generatePath = (data: Array<{ x: Date; y: number }>) => {
    if (data.length === 0 || chartWidth === 0 || chartHeight === 0) return '';

    let path = `M ${SIDE_PADDING} ${innerHeight - (data[0].y / maxValue) * innerHeight + PADDING}`;

    for (let i = 1; i < data.length; i++) {
      const x = SIDE_PADDING + (i / (data.length - 1)) * innerWidth; // Usa SIDE_PADDING
      const y = innerHeight - (data[i].y / maxValue) * innerHeight + PADDING;
      path += ` L ${x} ${y}`;
    }

    return path;
  };

  const generateAreaPath = (data: Array<{ x: Date; y: number }>) => {
    if (data.length === 0 || chartWidth === 0 || chartHeight === 0) return '';

    let path = `M ${SIDE_PADDING} ${innerHeight + PADDING}`; // Usa SIDE_PADDING
    path += ` L ${SIDE_PADDING} ${innerHeight - (data[0].y / maxValue) * innerHeight + PADDING}`;

    for (let i = 1; i < data.length; i++) {
      const x = SIDE_PADDING + (i / (data.length - 1)) * innerWidth; // Usa SIDE_PADDING
      const y = innerHeight - (data[i].y / maxValue) * innerHeight + PADDING;
      path += ` L ${x} ${y}`;
    }

    path += ` L ${innerWidth + SIDE_PADDING} ${innerHeight + PADDING} Z`; // Usa SIDE_PADDING

    return path;
  };

  const latestValue = data.length > 0 ? data[data.length - 1].y : 0;
  const previousValue = data.length > 1 ? data[data.length - 2].y : 0;
  const percentageChange = previousValue > 0 ? ((latestValue - previousValue) / previousValue) * 100 : 0;

  return (
    <div className="h-64 p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-border relative">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-medium text-foreground">Usuários Ativos (24h)</h3>
        <div className="flex items-center space-x-2 bg-card/80 px-2 py-1 rounded-full shadow-sm border border-border">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-xs text-foreground">Tempo real</span>
        </div>
      </div>

      <div ref={chartContainerRef} className="relative w-full h-full">
        {chartWidth > 0 && chartHeight > 0 && (
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            width="100%"
            height="100%"
            className="absolute inset-0"
            aria-label="Gráfico de usuários ativos nas últimas 24h"
            role="img"
          >
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Linha do eixo Y */}
            <line
              x1={SIDE_PADDING}
              y1={PADDING}
              x2={SIDE_PADDING}
              y2={innerHeight + PADDING}
              stroke="currentColor"
              strokeDasharray="2 2"
              className="text-border"
            />

            {/* Linha do eixo X */}
            <line
              x1={SIDE_PADDING}
              y1={innerHeight + PADDING}
              x2={innerWidth + SIDE_PADDING}
              y2={innerHeight + PADDING}
              stroke="currentColor"
              strokeDasharray="2 2"
              className="text-border"
            />

            {/* Labels do eixo X */}
            {data.map((point, i) => {
              const labelInterval = Math.ceil(data.length / (chartWidth / 100));
              if (i % labelInterval !== 0) return null;

              const x = SIDE_PADDING + (i / (data.length - 1)) * innerWidth;
              return (
                <text
                  key={i}
                  x={x}
                  y={innerHeight + PADDING + 10}
                  textAnchor="middle"
                  fontSize="10"
                  fill="currentColor"
                  className="text-muted-foreground"
                >
                  {format(point.x, 'HH:mm')}
                </text>
              );
            })}

            {/* Tooltip */}
            {chartHoverIndex !== null && data[chartHoverIndex] && (
              <g className="pointer-events-none">
                <rect
                  x={Math.min(
                    Math.max(
                      SIDE_PADDING + (chartHoverIndex / (data.length - 1)) * innerWidth - 50,
                      SIDE_PADDING
                    ),
                    innerWidth + SIDE_PADDING - 100
                  )}
                  y={PADDING - 10}
                  width={100}
                  height={24}
                  rx="4"
                  fill="hsl(var(--popover))"
                  className="shadow-lg"
                />
                <text
                  x={SIDE_PADDING + (chartHoverIndex / (data.length - 1)) * innerWidth}
                  y={PADDING + 8}
                  textAnchor="middle"
                  fontSize="12"
                  fill="hsl(var(--popover-foreground))"
                  className="font-medium"
                >
                  {data[chartHoverIndex].y.toLocaleString()} usuários
                </text>
              </g>
            )}

            {/* Área do gráfico */}
            <path
              d={generateAreaPath(data.map(point => ({ x: point.x, y: point.y })))}
              fill="url(#gradient)"
              className="drop-shadow-sm"
            />

            {/* Linha do gráfico */}
            <path
              d={generatePath(data.map(point => ({ x: point.x, y: point.y })))}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary drop-shadow-sm"
            />
            
            {/* Invisible hit area for tooltip */}
            <rect
              x={SIDE_PADDING}
              y={PADDING}
              width={innerWidth}
              height={innerHeight}
              fill="transparent"
              onMouseMove={(e) => {
                if (!chartContainerRef.current) return;
                const rect = chartContainerRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left - SIDE_PADDING;
                const index = Math.round((x / innerWidth) * (data.length - 1));
                setChartHoverIndex(Math.min(Math.max(0, index), data.length - 1));
              }}
              onMouseLeave={() => setChartHoverIndex(null)}
            />

            {/* Render points */}
            {data.map((point, i) => {
              const x = SIDE_PADDING + (i / (data.length - 1)) * innerWidth;
              const y = innerHeight - (point.y / maxValue) * innerHeight + PADDING;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y - 0.5} // Ajuste para alinhar visualmente com a linha
                  r="3"
                  fill="currentColor"
                  className="text-primary animate-pulse"
                />
              );
            })}

            {/* Real-time indicator */}
            {data.length > 0 && (
              <>
                <circle
                  cx={SIDE_PADDING + innerWidth}
                  cy={innerHeight - (data[data.length - 1].y / maxValue) * innerHeight + PADDING - 0.5} // Adjust to visually align with the line
                  r="4"
                  fill="currentColor"
                  className="text-primary"
                />
              </>
            )}
          </svg>
        )}
      </div>

      {/* Indicadores de valor */}
      <div className="absolute top-2 right-2 bg-card/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-border">
        <div className="text-xs text-muted-foreground">Atual</div>
        <div className="text-lg font-bold text-primary">{latestValue.toLocaleString('pt-BR')}</div>
        <div className={`text-xs flex items-center ${percentageChange >= 0 ? 'text-success' : 'text-destructive'}`}>
          <TrendingUpIcon className="h-3 w-3 mr-1" />
          {percentageChange.toFixed(1)}%
        </div>
      </div>
    </div>
  );
}

export default ActiveUsers24hChart;
