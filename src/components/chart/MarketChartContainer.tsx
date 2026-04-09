'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import LightweightChart from './LightweightChart';
import DisparityChart from './DisparityChart';
import { supabase } from '@/lib/supabase';
import { Loader2, RefreshCw, TrendingUp, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketChartContainerProps {
  symbol: string;
  predictions: any[];
  viewMode?: 'price' | 'disparity';
}

const TIMEFRAMES = [
  { label: '5분', value: '5m' },
  { label: '1시간', value: '1h' },
  { label: '1일', value: '1d' },
];

export default function MarketChartContainer({ symbol, predictions, viewMode = 'price' }: MarketChartContainerProps) {
  const [data, setData] = useState<any[]>([]);
  const [interval, setInterval] = useState<string>('5m');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [showPriceAi, setShowPriceAi] = useState(true);
  const [showMa20, setShowMa20] = useState(true);
  const [showMa60, setShowMa60] = useState(true);
  
  const [hasMore, setHasMore] = useState(true);
  const earliestTimestampRef = useRef<string | null>(null);

  const fetchData = useCallback(async (currentInterval: string, beforeTimestamp?: string) => {
    if (beforeTimestamp) setIsRefreshing(true);
    else setLoading(true);

    try {
      // ⚠️ 컬럼 유무와 상관없이 안전하게 select * 로 가져옴
      let query = supabase
        .from('market_data')
        .select('*') 
        .eq('symbol', symbol)
        .eq('interval', currentInterval)
        .order('timestamp', { ascending: false })
        .limit(2000); 

      if (beforeTimestamp) {
        query = query.lt('timestamp', beforeTimestamp);
      }

      const { data: marketData, error } = await query;
      if (error) throw error;
      
      if (!marketData || marketData.length === 0) {
        if (beforeTimestamp) setHasMore(false);
        return;
      }

      // 🛠️ 0값(0%)이 누락되지 않도록 d.ma20 != null 방식으로 명시적 체크
      const formattedData = marketData.map(d => ({
        time: Math.floor(new Date(d.timestamp).getTime() / 1000),
        value: Number(d.close),
        open: Number(d.open),
        high: Number(d.high),
        low: Number(d.low),
        close: Number(d.close),
        db_ma20: d.ma20 != null ? Number(d.ma20) : null,
        db_ma60: d.ma60 != null ? Number(d.ma60) : null,
        db_gap20: d.gap_ma20 != null ? Number(d.gap_ma20) * 100 : null,
        db_gap60: d.gap_ma60 != null ? Number(d.gap_ma60) * 100 : null
      })).reverse(); 

      if (beforeTimestamp) {
        setData(prev => [...formattedData, ...prev]);
      } else {
        setData(formattedData);
        setHasMore(true);
      }
      earliestTimestampRef.current = marketData[marketData.length - 1].timestamp;

    } catch (error: any) {
      console.error('Error fetching market data:', error.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [symbol]);

  const [basePrediction, setBasePrediction] = useState<any>(null);
  const [model2Prediction, setModel2Prediction] = useState<any>(null);
  const [model3Prediction, setModel3Prediction] = useState<any>(null);

  const fetchAiPrediction = useCallback(async () => {
    try {
      const fetchModel = async (name: string) => {
        const { data } = await supabase
          .from('predictions')
          .select('*')
            .eq('symbol', symbol)
            .eq('interval', interval)
            .eq('model_name', name)
            .order('created_at', { ascending: false })
            .limit(1);
        return data && data.length > 0 ? data[0] : null;
      };

      const [m1, m2, m3] = await Promise.all([
        fetchModel('Model 1 (Multi-Step)'),
        fetchModel('Model 2 (ma20 Gap)'),
        fetchModel('Model 3 (ma60 Gap)')
      ]);

      setBasePrediction(m1);
      setModel2Prediction(m2);
      setModel3Prediction(m3);
    } catch (err) {
      console.error('Error fetching AI predictions:', err);
    }
  }, [symbol, interval]);

  // 📊 하이브리드 데이터 연산 (DB 우선, 없으면 실시간 보정)
  const processedData = useMemo(() => {
    const ma20: any[] = [];
    const ma60: any[] = [];
    const gap20: any[] = [];
    const gap60: any[] = [];

    data.forEach((d, i) => {
        let curM20 = d.db_ma20;
        if (curM20 === null && i >= 19) {
            const sum = data.slice(i - 19, i + 1).reduce((acc, curr) => acc + curr.value, 0);
            curM20 = sum / 20;
        }
        if (curM20 !== null) {
            ma20.push({ time: d.time, value: curM20 });
            gap20.push({ time: d.time, value: d.db_gap20 ?? ((d.value - curM20) / curM20) * 100 });
        }

        let curM60 = d.db_ma60;
        if (curM60 === null && i >= 59) {
            const sum = data.slice(i - 59, i + 1).reduce((acc, curr) => acc + curr.value, 0);
            curM60 = sum / 60;
        }
        if (curM60 !== null) {
            ma60.push({ time: d.time, value: curM60 });
            gap60.push({ time: d.time, value: d.db_gap60 ?? ((d.value - curM60) / curM60) * 100 });
        }
    });

    return { ma20Data: ma20, ma60Data: ma60, gap20Data: gap20, gap60Data: gap60 };
  }, [data]);

  const { ma20Data, ma60Data, gap20Data, gap60Data } = processedData;

  const aiPaths = useMemo(() => {
    if (!basePrediction || data.length === 0) {
        return { predictionPath: [], ma20Path: [], ma60Path: [], gap20PredPath: [], gap60PredPath: [] };
    }
    
    const lastPriceData = data[data.length - 1];
    const lastTime = Number(lastPriceData.time);
    const stepSeconds = (interval as string) === '1d' ? 86400 : 3600;
    
    const lastMa20 = ma20Data[ma20Data.length - 1] || lastPriceData;
    const lastMa60 = ma60Data[ma60Data.length - 1] || lastPriceData;

    const baseTargets = basePrediction.prediction_data.targets;
    const m2Targets = model2Prediction?.prediction_data.targets;
    const m3Targets = model3Prediction?.prediction_data.targets;

    const ma20P = baseTargets.map((t: any, i: number) => ({
      time: lastTime + ((i + 1) * stepSeconds),
      value: lastMa20.value * (1 + t.ma20_return)
    }));
    const ma60P = baseTargets.map((t: any, i: number) => ({
      time: lastTime + ((i + 1) * stepSeconds),
      value: lastMa60.value * (1 + t.ma60_return)
    }));

    const lastGap20 = gap20Data[gap20Data.length - 1] || { time: lastTime, value: 0 };
    const lastGap60 = gap60Data[gap60Data.length - 1] || { time: lastTime, value: 0 };
    
    const g20P = m2Targets ? [lastGap20, ...m2Targets.map((t: any, i: number) => ({
        time: lastTime + ((i + 1) * stepSeconds),
        value: t.gap_return * 100
    }))] : [];
    const g60P = m3Targets ? [lastGap60, ...m3Targets.map((t: any, i: number) => ({
        time: lastTime + ((i + 1) * stepSeconds),
        value: t.gap_return * 100
    }))] : [];

    const selectedModelName = predictions[0]?.full_name;
    const closePath = baseTargets.map((t: any, i: number) => {
        const time = lastTime + ((i + 1) * stepSeconds);
        if (selectedModelName?.includes('ma20') && m2Targets?.[i]) {
            return { time, value: ma20P[i].value * (1 + m2Targets[i].gap_return) };
        } else if (selectedModelName?.includes('ma60') && m3Targets?.[i]) {
            return { time, value: ma60P[i].value * (1 + m3Targets[i].gap_return) };
        }
        return { time, value: lastPriceData.value * (1 + t.predicted_return) };
    });

    return { 
      predictionPath: [lastPriceData, ...closePath], 
      ma20Path: [lastMa20, ...ma20P], 
      ma60Path: [lastMa60, ...ma60P],
      gap20PredPath: g20P,
      gap60PredPath: g60P
    };
  }, [basePrediction, model2Prediction, model3Prediction, data, interval, ma20Data, ma60Data, gap20Data, gap60Data, predictions]);

  const { predictionPath, ma20Path, ma60Path, gap20PredPath, gap60PredPath } = aiPaths;

  useEffect(() => {
    fetchData(interval);
    fetchAiPrediction();
  }, [interval, symbol, fetchData, fetchAiPrediction]);

  const loadMoreHistory = () => {
    if (!hasMore || isRefreshing || loading) return;
    fetchData(interval, earliestTimestampRef.current || undefined);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => {
                setInterval(tf.value);
                setHasMore(true);
                earliestTimestampRef.current = null;
              }}
              className={cn(
                "px-4 py-1.5 text-sm font-bold rounded-lg transition-all",
                interval === tf.value ? "bg-slate-700 text-brand shadow-sm" : "text-slate-500 hover:text-slate-300"
              )}
            >
              {tf.label}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          {viewMode === 'price' && (
            <div className="flex bg-slate-800/40 p-1 rounded-xl border border-slate-700/30 mr-2">
              <button onClick={() => setShowPriceAi(!showPriceAi)} className={cn("flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all", showPriceAi ? "text-purple-400 bg-purple-400/10 shadow-sm" : "text-slate-600 hover:text-slate-400")}>
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold">AI</span>
              </button>
              <button onClick={() => setShowMa20(!showMa20)} className={cn("flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all", showMa20 ? "text-yellow-400 bg-yellow-400/10 shadow-sm" : "text-slate-600 hover:text-slate-400")}>
                <Activity className="w-4 h-4" />
                <span className="text-xs font-bold">20MA</span>
              </button>
              <button onClick={() => setShowMa60(!showMa60)} className={cn("flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all", showMa60 ? "text-orange-500 bg-orange-500/10 shadow-sm" : "text-slate-600 hover:text-slate-400")}>
                <Activity className="w-4 h-4" />
                <span className="text-xs font-bold">60MA</span>
              </button>
            </div>
          )}
          <button onClick={() => fetchData(interval)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-brand transition-all">
            <RefreshCw className={cn("w-5 h-5", isRefreshing && "animate-spin text-brand")} />
          </button>
        </div>
      </div>

      <div className="flex-1 relative flex flex-col space-y-4 min-h-[500px]">
        {loading && (
          <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center rounded-[2rem]">
            <Loader2 className="w-10 h-10 text-brand animate-spin" />
          </div>
        )}
        <div className="flex-1">
          {data.length > 0 ? (
            viewMode === 'price' ? (
              <LightweightChart 
                data={data} 
                predictions={predictions} 
                predictionPath={showPriceAi ? predictionPath : []}
                ma20Data={showMa20 ? ma20Data : []}
                ma60Data={showMa60 ? ma60Data : []}
                ma20Path={showPriceAi ? ma20Path : []}
                ma60Path={showPriceAi ? ma60Path : []}
                onScrollLeft={loadMoreHistory}
              />
            ) : (
                <div className="w-full h-full min-h-[500px] bg-slate-900/40 rounded-[2rem] p-8 border border-slate-800/60 shadow-inner flex flex-col">
                    <div className="flex items-center justify-between mb-6 px-4 shrink-0">
                        <div className="flex items-center space-x-8">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-[0_0_12px_rgba(250,204,21,0.6)]" />
                                <span className="text-sm font-black text-slate-200 uppercase tracking-tighter">MA20 GAP</span>
                                <span className="text-xl font-mono text-yellow-400">{gap20Data.length > 0 ? gap20Data[gap20Data.length-1].value.toFixed(2) : '0.00'}%</span>
                            </div>
                            <div className="flex items-center space-x-3 border-l border-slate-700/50 pl-8">
                                <div className="w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_12px_rgba(249,115,22,0.6)]" />
                                <span className="text-sm font-black text-slate-200 uppercase tracking-tighter">MA60 GAP</span>
                                <span className="text-xl font-mono text-orange-500">{gap60Data.length > 0 ? gap60Data[gap60Data.length-1].value.toFixed(2) : '0.00'}%</span>
                            </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">Disparity Oscillator v2.0</span>
                    </div>
                    {/* 🚀 유동적인 flex-1 대신, 차트 엔진이 인식하기 쉬운 고정 높이(450px) 부여 */}
                    <div className="h-[450px] w-full bg-slate-950/20 rounded-2xl overflow-hidden border border-slate-800/20">
                        <DisparityChart 
                            gap20Data={gap20Data} 
                            gap60Data={gap60Data} 
                            gap20Path={gap20PredPath} 
                            gap60Path={gap60PredPath} 
                        />
                    </div>
                </div>
            )
          ) : !loading && <div className="absolute inset-0 flex items-center justify-center text-slate-600">수집된 데이터가 없습니다.</div>}
        </div>
      </div>
    </div>
  );
}
