'use client';

import { 
  TrendingUp, 
  MessageSquare, 
  Clock, 
  Send, 
  Image as ImageIcon, 
  Hash, 
  MoreHorizontal,
  LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

const mockFeeds = [
  { id: 1, author: '박준형', content: 'GDXU 현재 지지선 34.00 붕괴 위험. 5분봉에서 하락 다이버전스 포착되었습니다. 리포트 탭의 최신 글 참고하세요.', created_at: '2024-04-05T04:20:00Z', is_alert: true },
  { id: 2, author: '이민수', content: '금리 동결 가능성 높아지면서 GDXY 헷지 비중 축소 고민 중입니다. 다른 분들 의견은 어떠신가요?', created_at: '2024-04-05T03:45:00Z', is_alert: false },
  { id: 3, author: '김지아', content: '오늘 밤 9시 30분 비농업 고용 지수 발표 예정입니다. 변동성 확대 주의하세요. #XAUUSD #Economy', created_at: '2024-04-05T02:12:00Z', is_alert: false },
];

export default function InsightsPage() {
  return (
    <div className="max-w-[800px] mx-auto space-y-8 animate-in slide-in-from-bottom-6 duration-700">
      <header className="flex justify-between items-center mb-10 pb-8 border-b border-slate-800">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-brand/10 text-brand rounded-[1rem] shadow-sm">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">인사이트 피드</h1>
            <p className="text-slate-400 mt-1">팀원 간 실시간 시장 대응 및 아이디어를 공유하세요.</p>
          </div>
        </div>
        <button className="p-3 hover:bg-slate-800 rounded-2xl text-slate-500 transition-colors">
          <LayoutGrid className="w-6 h-6" />
        </button>
      </header>

      {/* Write New Insight */}
      <section className="toss-card border-slate-700/50 shadow-2xl p-0 overflow-hidden group">
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-slate-300 font-bold shadow-inner">
              나
            </div>
            <textarea 
              placeholder="현재 시장에 대한 통찰을 공유해주세요..." 
              className="flex-1 bg-transparent border-none outline-none resize-none text-xl min-h-[140px] pt-2 text-slate-200 placeholder:text-slate-600 focus:placeholder:text-slate-700 transition-all"
            />
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-900/50 flex justify-between items-center border-t border-slate-800 transition-colors group-hover:bg-slate-900/70">
          <div className="flex items-center space-x-3 text-slate-500">
            <button className="p-2.5 hover:bg-slate-800 rounded-xl hover:text-brand transition-all active:scale-90"><ImageIcon className="w-5 h-5" /></button>
            <button className="p-2.5 hover:bg-slate-800 rounded-xl hover:text-brand transition-all active:scale-90"><Hash className="w-5 h-5" /></button>
            <button className="p-2.5 hover:bg-slate-800 rounded-xl hover:text-brand transition-all active:scale-90"><TrendingUp className="w-5 h-5" /></button>
          </div>
          <button className="toss-button flex items-center space-x-2 px-6 py-3 font-semibold text-lg shadow-lg shadow-brand/10">
            <span>공유하기</span>
            <Send className="w-4 h-4 ml-1" />
          </button>
        </div>
      </section>

      {/* Feed List */}
      <section className="space-y-4">
        {mockFeeds.map((feed) => (
          <div 
            key={feed.id} 
            className={cn(
              "toss-card border-slate-800/60 hover:bg-slate-800/40 transition-all p-6 relative group",
              feed.is_alert && "border-l-4 border-l-red-500 bg-red-500/5 shadow-inner"
            )}
          >
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-500 hover:text-slate-300">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm font-sans",
                feed.author === '박준형' ? "bg-slate-700 text-slate-200" : "bg-slate-800 text-slate-400"
              )}>
                {feed.author[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-bold text-lg text-slate-200">{feed.author}</span>
                  <span className="text-slate-600">•</span>
                  <div className="flex items-center text-sm text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    <span>{formatDistanceToNow(new Date(feed.created_at), { addSuffix: true, locale: ko })}</span>
                  </div>
                </div>
                <p className="text-slate-300 text-[1.1rem] leading-[1.8] tracking-tight">{feed.content}</p>
                
                {feed.is_alert && (
                   <div className="mt-4 flex items-center space-x-2 px-3 py-1.5 bg-red-500/10 rounded-lg inline-flex">
                     <TrendingUp className="w-4 h-4 text-red-400" />
                     <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Urgent Market Insight</span>
                   </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
