'use client';

import TradingViewWidget from '@/components/chart/TradingViewWidget';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';

const MarketCard = ({ symbol, name, price, change, isPositive }: any) => (
  <div className="toss-card flex flex-col justify-between p-5 min-w-[240px]">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-sm font-medium text-slate-400">{name}</h3>
        <p className="text-xl font-bold mt-1">{symbol}</p>
      </div>
      <div className={`p-2 rounded-lg ${isPositive ? 'bg-blue-500/10' : 'bg-red-500/10'}`}>
        {isPositive ? (
          <TrendingUp className="w-5 h-5 text-blue-400" />
        ) : (
          <TrendingDown className="w-5 h-5 text-red-400" />
        )}
      </div>
    </div>
    <div className="flex items-baseline space-x-2">
      <span className="text-2xl font-bold">${price}</span>
      <span className={`text-sm font-medium ${isPositive ? 'text-blue-400' : 'text-red-400'}`}>
        {isPositive ? '+' : ''}{change}%
      </span>
    </div>
  </div>
);

export default function HomePage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">홈 (실시간 마켓)</h1>
          <p className="text-slate-400 mt-2">금광주 ETF 및 현물 시장의 실시간 현황입니다.</p>
        </div>
        <div className="flex space-x-2">
          <button className="toss-button flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>데이터 동기화</span>
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MarketCard
          symbol="GDXU"
          name="금광주 3x 레버리지"
          price="34.20"
          change="3.45"
          isPositive={true}
        />
        <MarketCard
          symbol="GDXY"
          name="금광 배당주"
          price="12.45"
          change="-9.21"
          isPositive={false}
        />
        <MarketCard
          symbol="GDX"
          name="금광주 ETF (Spot)"
          price="28.90"
          change="1.15"
          isPositive={true}
        />
        <MarketCard
          symbol="XAUUSD"
          name="금 현물 (Gold)"
          price="2,345.10"
          change="0.45"
          isPositive={true}
        />
      </section>

      <section className="h-[600px] w-full toss-card p-0 overflow-hidden relative group">
        <div className="absolute inset-0 bg-slate-900 animate-pulse group-hover:hidden transition-opacity duration-300" />
        <div className="relative h-full w-full">
          <TradingViewWidget />
        </div>
      </section>
    </div>
  );
}
