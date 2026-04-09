'use client';

import { useEffect, useRef } from 'react';
import { createChart, LineSeries, ColorType, LineStyle } from 'lightweight-charts';

interface DisparityChartProps {
  gap20Data: any[];
  gap60Data: any[];
  gap20Path: any[];
  gap60Path: any[];
}

export default function DisparityChart({ gap20Data, gap60Data, gap20Path, gap60Path }: DisparityChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth || 800,
      height: 450,
      layout: {
        background: { type: ColorType.Solid, color: '#020617' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      rightPriceScale: {
        borderVisible: true,
        borderColor: '#1e293b',
      },
      timeScale: {
        borderVisible: true,
        borderColor: '#1e293b',
        timeVisible: true,
        rightOffset: 12, // 미래 예측선을 위한 우측 공간 확보
      },
    });

    const baselineSeries = chart.addSeries(LineSeries, {
      color: '#475569',
      lineWidth: 1,
      lineStyle: LineStyle.Dotted,
      lastValueVisible: false,
      priceLineVisible: false,
    });
    const bData = gap20Data.map(d => ({ time: d.time, value: 0 }));
    if (bData.length > 0) baselineSeries.setData(bData);

    const series20 = chart.addSeries(LineSeries, {
      color: '#fde047',
      lineWidth: 2,
    });
    if (gap20Data.length > 0) series20.setData(gap20Data);

    const series60 = chart.addSeries(LineSeries, {
      color: '#f97316',
      lineWidth: 2,
    });
    if (gap60Data.length > 0) series60.setData(gap60Data);

    if (gap20Path.length > 0) {
      const pred20 = chart.addSeries(LineSeries, {
        color: '#fde047',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
      });
      pred20.setData(gap20Path);
    }

    if (gap60Path.length > 0) {
      const pred60 = chart.addSeries(LineSeries, {
        color: '#f97316',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
      });
      pred60.setData(gap60Path);
    }

    // 🎯 화면 줌 최적화 (가장 최근 100봉 확대)
    const totalPoints = gap20Data.length;
    if (totalPoints > 100) {
        chart.timeScale().setVisibleLogicalRange({
            from: totalPoints - 100,
            to: totalPoints + 8, // 우측 여백 8봉
        });
    } else {
        chart.timeScale().fitContent();
    }

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [gap20Data, gap60Data, gap20Path, gap60Path]);

  return (
    <div 
      ref={chartContainerRef} 
      className="w-full h-full"
      style={{ minHeight: '450px', background: '#020617' }} 
    />
  );
}
