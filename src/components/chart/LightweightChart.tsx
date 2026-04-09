'use client';

import { createChart, ColorType, ISeriesApi, AreaSeries, createSeriesMarkers } from 'lightweight-charts';
import { useEffect, useRef } from 'react';

interface ChartProps {
  data: any[];
  predictions?: any[];
  colors?: {
    backgroundColor?: string;
    lineColor?: string;
    textColor?: string;
    areaTopColor?: string;
    areaBottomColor?: string;
  };
}

export default function LightweightChart({
  data,
  predictions = [],
  colors: {
    backgroundColor = '#0f172a',
    lineColor = '#3b82f6',
    textColor = '#94a3b8',
    areaTopColor = '#3b82f633',
    areaBottomColor = '#0f172a00',
  } = {},
}: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      chartRef.current.applyOptions({ width: chartContainerRef.current!.clientWidth });
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
    });
    chart.timeScale().fitContent();

    const newSeries = chart.addSeries(AreaSeries, {
      lineColor,
      topColor: areaTopColor,
      bottomColor: areaBottomColor,
    });
    newSeries.setData(data);

    // AI Overlays (High-end visualization)
    predictions.forEach(pred => {
      if (pred.signal_type === 'danger') {
        // Markers are easier and performant
        createSeriesMarkers(newSeries, [
          { time: pred.timestamp as any, position: 'aboveBar', color: '#ef4444', shape: 'arrowDown', text: 'Danger' }
        ]);
      }
    });

    chartRef.current = chart;
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor, predictions]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full h-full"
    />
  );
}
