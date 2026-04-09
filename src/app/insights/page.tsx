import FeedInput from '@/components/insights/FeedInput';
import FeedList from '@/components/insights/FeedList';
import { MessageSquare, LayoutGrid } from 'lucide-react';

export default function InsightsPage() {
  return (
    <div className="max-w-[800px] mx-auto space-y-8 animate-in slide-in-from-bottom-6 duration-700">
      <header className="flex justify-between items-center mb-10 pb-8 border-b border-slate-800">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-brand/10 text-brand rounded-[1rem] shadow-sm">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">피드</h1>
            <p className="text-slate-400 mt-1">팀원 간 실시간 시장 대응 및 아이디어를 공유하세요.</p>
          </div>
        </div>
        <button className="p-3 hover:bg-slate-800 rounded-2xl text-slate-500 transition-colors">
          <LayoutGrid className="w-6 h-6" />
        </button>
      </header>

      {/* Write New Insight (Refactored) */}
      <FeedInput />

      {/* Feed List (Real-time DB Connection) */}
      <FeedList />
    </div>
  );
}
