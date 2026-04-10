'use client';

import { useState, useEffect } from 'react';
import MarketChartContainer from '@/components/chart/MarketChartContainer';
import { supabase } from '@/lib/supabase';
import {
  Plus,
  LayoutGrid,
  Settings2,
  Cpu,
  ChevronRight,
  TrendingUp,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AnalysisPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('GDXU');
  const [selectedModel, setSelectedModel] = useState<number | null>(1);
  const [viewMode, setViewMode] = useState<'price' | 'disparity'>('price');
  const [realStats, setRealStats] = useState<any>(null);

  const models = [
    {
      id: 1,
      model_name: 'Model 1',
      full_name: 'Model 1 (Multi-Step)',
      signal_type: 'safe',
      confidence: 0.55,
      description: '최근 시세 흐름과 이평선의 추세를 분석하여 향후 3일의 가격과 이평선 위치를 다단계로 예측합니다.'
    },
    {
      id: 2,
      model_name: 'Model 2',
      full_name: 'Model 2 (ma20 Gap)',
      signal_type: 'safe',
      confidence: 0.60,
      description: 'AI가 예측한 20일 이평선 경로에, 모델 2가 예측한 "20일 이격 회복률"을 반영하여 최종 가격을 산출합니다.'
    },
    {
      id: 3,
      model_name: 'Model 3',
      full_name: 'Model 3 (ma60 Gap)',
      signal_type: 'safe',
      confidence: 0.58,
      description: 'AI가 예측한 60일 이평선 경로에, 모델 3이 예측한 "60일 이격 회복률"을 반영하여 최종 가격을 산출합니다.'
    },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-center bg-slate-900/40 p-10 rounded-[2rem] border border-slate-800 shadow-xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-brand/10" />
        <div className="z-10">
          <h1 className="text-4xl font-bold tracking-tight mb-3 text-white">AI 시장 분석</h1>
          <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50 w-fit">
            <button
              onClick={() => setViewMode('price')}
              className={cn(
                "px-6 py-2 text-sm font-bold rounded-lg transition-all",
                viewMode === 'price'
                  ? "bg-slate-700 text-white shadow-lg"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              GDXU (3x)
            </button>
            <button
              onClick={() => setViewMode('disparity')}
              className={cn(
                "px-6 py-2 text-sm font-bold rounded-lg transition-all ml-1",
                viewMode === 'disparity'
                  ? "bg-slate-700 text-white shadow-lg"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              이격도 분석
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-3 z-10">
          <button className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-300 transition-colors">
            <LayoutGrid className="w-6 h-6" />
          </button>
          <button className="toss-button flex items-center space-x-2 px-8 py-4 shadow-xl shadow-brand/20">
            <Plus className="w-5 h-5" />
            <span>분석 전략 추가</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="toss-card border-slate-700/40 shadow-2xl p-8 bg-slate-900/50 backdrop-blur-sm min-h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className={cn("w-3 h-3 rounded-full animate-pulse", viewMode === 'price' ? "bg-brand" : "bg-yellow-400")} />
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {viewMode === 'price' ? `${selectedSymbol} 가격 추세 분석(5분봉은 예측 X)` : `${selectedSymbol} 이평선 이격도 분석`}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-3 hover:bg-slate-800 rounded-xl text-slate-500 transition-colors">
                  <Settings2 className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-[500px]">
              <MarketChartContainer
                symbol={selectedSymbol}
                predictions={selectedModel ? models.filter((p: any) => p.id === selectedModel) : []}
                viewMode={viewMode}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="toss-card border-slate-800/60 p-6 bg-slate-900/40">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-2.5 bg-brand/10 text-brand rounded-xl">
                <Cpu className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">AI 모델 리스트</h2>
            </div>

            <div className="space-y-4">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={cn(
                    "w-full text-left p-5 rounded-[2rem] transition-all border group relative overflow-hidden",
                    selectedModel === model.id
                      ? "bg-slate-800/80 border-brand shadow-2xl shadow-brand/10"
                      : "bg-slate-900/20 border-slate-800/60 hover:border-slate-700 hover:bg-slate-900/30"
                  )}
                >
                  {/* 선택 시 빛나는 효과 */}
                  {selectedModel === model.id && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-2xl -mr-16 -mt-16 animate-pulse" />
                  )}

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <span className={cn(
                        "text-[10px] font-black px-2.5 py-1 rounded-full tracking-widest uppercase",
                        selectedModel === model.id ? "bg-brand text-slate-900" : "bg-slate-800 text-slate-500"
                      )}>
                        {model.model_name}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-slate-500 flex items-center">
                          <Target className="w-3 h-3 mr-1" />
                          정확도
                        </span>
                        <span className={cn(
                          "text-xs font-black",
                          model.confidence > 0.58 ? "text-emerald-400" : "text-brand"
                        )}>
                          {(model.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <h3 className="text-white font-bold text-lg mb-2 group-hover:text-brand transition-colors">{model.full_name}</h3>

                    <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-400">
                      {model.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
