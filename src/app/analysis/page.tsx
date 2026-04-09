'use client';

import { useState } from 'react';
import LightweightChart from '@/components/chart/LightweightChart';
import { 
  Cpu, 
  RefreshCw, 
  Plus, 
  Settings2, 
  AlertTriangle, 
  ShieldCheck 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mockData = Array.from({ length: 100 }, (_, i) => ({
  time: (1712217600 + i * 86400) as any, // numeric timestamps
  value: 30 + Math.random() * 5 + i * 0.1,
}));

const mockPredictions = [
  { id: 1, model_name: 'Prophet V3', timestamp: 1712563200, signal_type: 'danger', confidence: 0.85, description: '급격한 하락 추세 감지' },
  { id: 2, model_name: 'LSTM-DeepMine', timestamp: 1712908800, signal_type: 'safe', confidence: 0.72, description: '바닥 지지선 형성 확인' },
];

export default function AnalysisPage() {
  const [selectedModel, setSelectedModel] = useState<number | null>(1);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">심층 분석 (Custom Chart)</h1>
          <p className="text-slate-400 mt-2">AI 모델의 예측값과 커스텀 보조지표를 실시간으로 확인하세요.</p>
        </div>
        <button className="toss-button flex items-center space-x-2 bg-slate-800 hover:bg-slate-700">
          <RefreshCw className="w-4 h-4" />
          <span>데이터 실시간 업데이트</span>
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
        {/* Main Chart Area */}
        <div className="flex-1 toss-card p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold flex items-center space-x-2">
                <span className="w-2 h-2 bg-brand rounded-full animate-pulse" />
                <span>GDXU (3x Bull) 5분봉</span>
              </span>
              <div className="flex bg-slate-800 rounded-lg p-1">
                {['1분', '5분', '15분', '1시간', '1일'].map((t) => (
                  <button key={t} className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-all",
                    t === '5분' ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                  )}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><Settings2 className="w-5 h-5" /></button>
              <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><Plus className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="flex-1 relative">
            <LightweightChart 
              data={mockData} 
              predictions={selectedModel ? mockPredictions.filter(p => p.id === selectedModel) : []} 
            />
          </div>
        </div>

        {/* AI Model Sidebar */}
        <aside className="w-full lg:w-[320px] space-y-6">
          <div className="toss-card">
            <h2 className="text-lg font-bold flex items-center space-x-2 mb-6">
              <Cpu className="text-brand w-5 h-5" />
              <span>AI 모델 리스트</span>
            </h2>
            <div className="space-y-4">
              {mockPredictions.map((pred) => (
                <button
                  key={pred.id}
                  onClick={() => setSelectedModel(pred.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border border-transparent transition-all space-y-2 group",
                    selectedModel === pred.id 
                      ? "bg-brand/10 border-brand/30 ring-1 ring-brand/50" 
                      : "bg-slate-800/50 hover:bg-slate-800"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-200 group-hover:text-white">{pred.model_name}</span>
                    {pred.signal_type === 'danger' ? (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full", pred.signal_type === 'danger' ? 'bg-red-500' : 'bg-blue-500')} 
                        style={{ width: `${pred.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{(pred.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{pred.description}</p>
                </button>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-800">
              <h3 className="text-sm font-semibold text-slate-400 mb-4 px-1">모델 설정 오버레이</h3>
              <div className="space-y-3">
                {['예측 오차 영역', '변동성 전파선', '추세 강도 색상'].map(opt => (
                  <label key={opt} className="flex items-center space-x-3 cursor-pointer group">
                    <div className="w-4 h-4 rounded border border-slate-600 group-hover:border-brand transition-colors" />
                    <span className="text-sm text-slate-300 group-hover:text-slate-200">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
