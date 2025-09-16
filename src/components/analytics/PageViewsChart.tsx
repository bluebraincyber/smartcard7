"use client";

import { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Eye } from "lucide-react";

interface PageViewData {
  name: string;
  views: number;
}

interface PageViewsChartProps {
  data: PageViewData[];
}

const PADDING = 40; // Padding top/bottom for the chart area
const SIDE_PADDING = 20; // Padding left/right for the chart area

export default function PageViewsChart({ data }: PageViewsChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
        setHeight(containerRef.current.offsetHeight);
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  if (width === 0 || height === 0 || data.length === 0) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-accent" />
            Visualizações por Página
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
          Carregando dados ou dados indisponíveis...
        </CardContent>
      </Card>
    );
  }

  const innerWidth = width - 2 * SIDE_PADDING;
  const innerHeight = height - 2 * PADDING;

  const maxValue = Math.max(...data.map((d) => d.views));
  const barWidth = innerWidth / data.length;

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-accent" />
          Visualizações por Página
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="h-[200px] w-full">
          <svg width={width} height={height}>
            {/* Eixo Y (linha horizontal superior) */}
            <line
              x1={SIDE_PADDING}
              y1={PADDING}
              x2={width - SIDE_PADDING}
              y2={PADDING}
              stroke="hsl(var(--border))"
              strokeWidth="1"
            />
            {/* Eixo Y (linha horizontal inferior) */}
            <line
              x1={SIDE_PADDING}
              y1={height - PADDING}
              x2={width - SIDE_PADDING}
              y2={height - PADDING}
              stroke="hsl(var(--border))"
              strokeWidth="1"
            />

            {data.map((d, i) => {
              const x = SIDE_PADDING + i * barWidth;
              const barHeight = (d.views / maxValue) * innerHeight;
              const y = height - PADDING - barHeight;

              return (
                <g key={d.name}>
                  {/* Barras */}
                  <rect
                    x={x + barWidth * 0.1} // Pequeno offset para espaçamento entre as barras
                    y={y}
                    width={barWidth * 0.8} // Largura da barra
                    height={barHeight}
                    fill="hsl(var(--accent))" // Cor accent
                    rx="4" // Borda arredondada
                    ry="4" // Borda arredondada
                  />
                  {/* Rótulos dos nomes */}
                  <text
                    x={x + barWidth / 2}
                    y={height - PADDING + 15} // Abaixo do eixo X
                    textAnchor="middle"
                    fontSize="12"
                    fill="hsl(var(--muted-foreground))"
                  >
                    {d.name}
                  </text>
                  {/* Rótulos dos valores */}
                  <text
                    x={x + barWidth / 2}
                    y={y - 5} // Acima da barra
                    textAnchor="middle"
                    fontSize="12"
                    fill="hsl(var(--muted-foreground))"
                  >
                    {d.views}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}