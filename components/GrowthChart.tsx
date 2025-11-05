
import React, { useState, useMemo } from 'react';
import type { MonthlyResult } from '../types';

type MetricKey = 'cumulativeProfit' | 'cash' | 'totalPhonesBought';

interface MetricConfig {
  label: string;
  color: string;
  isCurrency: boolean;
}

const metrics: Record<MetricKey, MetricConfig> = {
  cumulativeProfit: { label: 'Lucro Acumulado', color: '#2dd4bf', isCurrency: true },
  cash: { label: 'Caixa Final', color: '#64748b', isCurrency: true },
  totalPhonesBought: { label: 'Total de Celulares', color: '#f87171', isCurrency: false },
};

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const formatNumber = (value: number) => {
    return Math.round(value).toString();
};


export const GrowthChart: React.FC<{ results: MonthlyResult[] }> = ({ results }) => {
  const [activeMetric, setActiveMetric] = useState<MetricKey>('cumulativeProfit');

  const chartData = useMemo(() => {
    if (!results.length) return null;
    
    const dataPoints = results.map(r => r[activeMetric]);
    const maxValue = Math.max(...dataPoints, 0);
    const minValue = Math.min(...dataPoints, 0);

    const range = maxValue - minValue;
    const yAxisMax = range === 0 ? (maxValue === 0 ? 100 : maxValue * 1.2) : maxValue + range * 0.1;
    const yAxisMin = range === 0 ? 0 : minValue - range * 0.1;
    
    const yLabelsCount = 5;
    const yLabels = Array.from({ length: yLabelsCount + 1 }).map((_, i) => {
        const value = yAxisMin + (i * (yAxisMax - yAxisMin)) / yLabelsCount;
        return value;
    });

    const width = 500;
    const height = 300;
    const padding = { top: 20, right: 20, bottom: 40, left: 80 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const xScale = (month: number) => padding.left + ((month - 1) / Math.max(1, results.length - 1)) * chartWidth;
    const yScale = (value: number) => padding.top + chartHeight - ((value - yAxisMin) / Math.max(1, yAxisMax - yAxisMin)) * chartHeight;

    const pathData = results.map((r, i) => `${i === 0 ? 'M' : 'L'} ${xScale(r.month)} ${yScale(r[activeMetric])}`).join(' ');

    const circles = results.map(r => ({
        cx: xScale(r.month),
        cy: yScale(r[activeMetric]),
        value: r[activeMetric],
        month: r.month,
    }));

    return {
        width, height, padding,
        yScale, xScale,
        yLabels,
        pathData,
        circles
    };

  }, [results, activeMetric]);
  
  if (!chartData) return null;

  const { width, height, padding, yLabels, pathData, circles, xScale, yScale } = chartData;
  const config = metrics[activeMetric];
  const formatter = config.isCurrency ? formatCurrency : formatNumber;


  return (
    <div className="bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Métricas de Crescimento</h2>
        <div className="flex flex-wrap gap-2 mb-4">
            {(Object.keys(metrics) as MetricKey[]).map(key => (
                <button
                    key={key}
                    onClick={() => setActiveMetric(key)}
                    className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${activeMetric === key ? 'bg-teal-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                >
                    {metrics[key].label}
                </button>
            ))}
        </div>
        <div className="relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" aria-label={`Gráfico de ${config.label}`}>
                {/* Y-axis grid lines and labels */}
                {yLabels.map((label, i) => (
                    <g key={i} className="text-slate-500">
                        <line 
                            x1={padding.left} 
                            y1={yScale(label)} 
                            x2={width - padding.right} 
                            y2={yScale(label)} 
                            stroke="currentColor" 
                            strokeWidth="0.5"
                            strokeDasharray="2,3"
                        />
                        <text
                            x={padding.left - 8}
                            y={yScale(label)}
                            dy="0.32em"
                            textAnchor="end"
                            fontSize="10"
                            fill="currentColor"
                        >
                            {formatter(label)}
                        </text>
                    </g>
                ))}

                {/* X-axis labels */}
                {results.map((r) => (
                    <text
                        key={r.month}
                        x={xScale(r.month)}
                        y={height - padding.bottom + 15}
                        textAnchor="middle"
                        fontSize="10"
                        fill="currentColor"
                         className="text-slate-400"
                    >
                        {r.month}
                    </text>
                ))}
                 <text
                    x={padding.left + (width - padding.left - padding.right) / 2}
                    y={height - 5}
                    textAnchor="middle"
                    fontSize="12"
                    fill="currentColor"
                    className="font-semibold text-slate-400"
                >
                    Mês
                </text>


                {/* Chart Path */}
                <path d={pathData} fill="none" stroke={config.color} strokeWidth="2" />
                
                 {/* Interactive Layer for Tooltips */}
                {circles.map((circle, i) => (
                    <g key={`hover-${i}`} className="group" role="tooltip" tabIndex={0} aria-label={`Mês ${circle.month}: ${formatter(circle.value)}`}>
                        <rect 
                            x={circle.cx - (xScale(2) - xScale(1))/2 || 10} 
                            y={padding.top} 
                            width={xScale(2) - xScale(1) || 20} 
                            height={height - padding.top - padding.bottom}
                            fill="transparent"
                        />
                        <circle
                            cx={circle.cx}
                            cy={circle.cy}
                            r="8"
                            fill="transparent"
                        />
                         <circle
                            cx={circle.cx}
                            cy={circle.cy}
                            r="4"
                            fill={config.color}
                            className="opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity"
                            pointerEvents="none"
                        />
                         <g className="opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity pointer-events-none -translate-y-2">
                            <rect x={circle.cx - 55} y={circle.cy - 35} width="110" height="25" fill="#1e293b" rx="4" />
                            <text
                                x={circle.cx}
                                y={circle.cy - 22.5}
                                textAnchor="middle"
                                dy="0.32em"
                                fontSize="12"
                                fill="#e2e8f0"
                                className="font-semibold"
                            >
                                Mês {circle.month}: {formatter(circle.value)}
                            </text>
                         </g>
                    </g>
                ))}
            </svg>
        </div>
    </div>
  );
};
