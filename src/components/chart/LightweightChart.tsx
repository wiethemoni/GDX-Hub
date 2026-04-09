'use client';

import { createChart, ColorType, AreaSeries, LineSeries } from 'lightweight-charts';
import { useEffect, useRef } from 'react';

interface ChartProps {
  data: any[];
  predictions?: any[];
  predictionPath?: any[]; // AI 예측 경로 (+1h, +2h, +3h)
  ma20Data?: any[];       // 20일 이평선
  ma60Data?: any[];       // 60일 이평선
  ma20Path?: any[];       // 20일 예측 경로
  ma60Path?: any[];       // 60일 예측 경로
  onScrollLeft?: () => void;
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
  onScrollLeft,
  predictions = [],
  predictionPath = [],
  ma20Data = [],
  ma60Data = [],
  ma20Path = [],
  ma60Path = [],
  colors: {
    backgroundColor = '#0f172a00',
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
      if (chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current!.clientWidth });
      }
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      grid: {
        vertLines: { color: 'rgba(30, 41, 59, 0.3)' },
        horzLines: { color: 'rgba(30, 41, 59, 0.3)' },
      },
      localization: {
        locale: 'ko-KR',
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#1e293b',
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
    });

    // 1. 메인 시세 영역 (Area)
    const mainSeries = chart.addSeries(AreaSeries, {
      lineColor,
      topColor: areaTopColor,
      bottomColor: areaBottomColor,
      lineWidth: 2,
    });
    mainSeries.setData(data);

    // 🟡 2. 20일 이평선 (노란색, 얇게)
    const ma20Series = chart.addSeries(LineSeries, {
      color: '#fde047dd', // 약간의 투명도 추가
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false, // 우측 가격 태그 제거
    });
    ma20Series.setData(ma20Data);

    // 🟠 3. 60일 이평선 (주황색, 얇게)
    const ma60Series = chart.addSeries(LineSeries, {
      color: '#f97316dd',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false, // 우측 가격 태그 제거
    });
    ma60Series.setData(ma60Data);

    // 🤖 4. AI 예측 경로들 (Dashed Line)
    if (predictionPath && predictionPath.length > 0) {
      const predSeries = chart.addSeries(LineSeries, {
        color: '#8b5cf6',
        lineStyle: 2, // Dashed
        lineWidth: 3,
        lastValueVisible: true, // 종가 예측만 라벨 유지
      });
      predSeries.setData(predictionPath);
    }

    if (ma20Path && ma20Path.length > 0) {
      const predMa20Series = chart.addSeries(LineSeries, {
        color: '#fde047aa',
        lineStyle: 2,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false, // 예측선 라벨 제거
      });
      predMa20Series.setData(ma20Path);
    }

    if (ma60Path && ma60Path.length > 0) {
      const predMa60Series = chart.addSeries(LineSeries, {
        color: '#f97316aa',
        lineStyle: 2,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false, // 예측선 라벨 제거
      });
      predMa60Series.setData(ma60Path);
    }

    // 🔍 최신 데이터 150개에 초점 맞추기 + 미래 여백
    if (data.length > 150) {
      chart.timeScale().setVisibleLogicalRange({
        from: data.length - 150,
        to: data.length + 10
      });
    } else {
      chart.timeScale().fitContent();
    }

    // 💡 AI 마커
    const markers = predictions
      .filter(pred => pred.signal_type === 'danger' && pred.timestamp)
      .map(pred => ({
        time: pred.timestamp as any,
        position: 'aboveBar' as const,
        color: '#ef4444',
        shape: 'arrowDown' as const,
        text: 'Danger'
      }));

    if (markers.length > 0) {
      (mainSeries as any).setMarkers(markers);
    }

    // 💡 무한 스크롤 탐지
    const timeScale = chart.timeScale();
    timeScale.subscribeVisibleTimeRangeChange(() => {
      const range = timeScale.getVisibleRange();
      if (!range) return;
      if (data.length > 0 && Number(range.from) <= Number(data[0].time)) {
        onScrollLeft?.();
      }
    });

    chartRef.current = chart;
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor, predictions, predictionPath, onScrollLeft]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full h-full min-h-[500px]"
    />
  );
}
