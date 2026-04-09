'use client';

import { 
  FileText, 
  Download, 
  Search, 
  Plus, 
  User, 
  Calendar,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const mockReports = [
  { id: 1, title: '2024년 4월 금광주 매크로 분석 보고서 (최종)', author: '박준형', file_url: '#', created_at: '2024-04-03T10:00:00Z', size: '2.4 MB' },
  { id: 2, title: 'GDXU/GDXY 변동성 헤지 전략 매뉴얼', author: '이민수', file_url: '#', created_at: '2024-04-01T15:30:00Z', size: '1.1 MB' },
  { id: 3, title: '연준 금리 결정에 따른 금 가격 상관관계 분석', author: '김지아', file_url: '#', created_at: '2024-03-28T09:12:00Z', size: '5.6 MB' },
];

export default function ReportsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-center bg-slate-900/40 p-10 rounded-[2rem] border border-slate-800 shadow-xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-brand/10" />
        <div className="z-10">
          <h1 className="text-4xl font-bold tracking-tight mb-3">심층 분석 리포트</h1>
          <p className="text-slate-400 text-lg max-w-lg">팀원들과 함께 작성한 고도의 시장 분석 리포트를 확인하고 공유하세요.</p>
        </div>
        <button className="toss-button flex items-center space-x-2 px-8 py-4 shadow-xl shadow-brand/20 z-10">
          <Plus className="w-5 h-5" />
          <span className="text-lg">새 리포트 업로드</span>
        </button>
      </header>

      <div className="flex items-center space-x-4 mb-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand transition-colors" />
          <input 
            type="text" 
            placeholder="리포트 제목, 작성자 검색..." 
            className="toss-input w-full pl-12 h-14 text-lg border border-slate-800 group-hover:border-slate-700 transition-all"
          />
        </div>
        <button className="bg-slate-800 px-6 py-4 rounded-xl text-slate-400 hover:text-slate-200 transition-colors flex items-center space-x-2">
          <span>최신순</span>
          <Plus className="w-4 h-4 rotate-45" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {mockReports.map((report) => (
          <div 
            key={report.id} 
            className="toss-card flex items-center justify-between p-6 hover:bg-slate-800/60 transition-all cursor-pointer group hover:scale-[1.01] active:scale-[0.99] border-slate-800/50"
          >
            <div className="flex items-center space-x-6">
              <div className="p-4 bg-slate-800 rounded-2xl group-hover:bg-brand/10 group-hover:text-brand transition-colors shadow-sm">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold group-hover:text-brand transition-colors truncate max-w-md">{report.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-slate-500 mt-2">
                  <div className="flex items-center space-x-1.5 font-medium">
                    <User className="w-4 h-4" />
                    <span>{report.author}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 font-medium">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(report.created_at), 'yyyy년 MM월 dd일', { locale: ko })}</span>
                  </div>
                  <div className="flex items-center space-x-1 font-mono text-[10px]">
                    <span className="px-2 py-0.5 bg-slate-800 rounded uppercase tracking-wider">{report.size}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-3 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 rounded-xl transition-all">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-3 bg-slate-800 shadow-sm hover:bg-slate-700 text-brand rounded-xl transition-all">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
