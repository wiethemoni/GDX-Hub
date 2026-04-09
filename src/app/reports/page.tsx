'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  FileText,
  Download,
  Search,
  Plus,
  User,
  Calendar,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import ReportModal from '@/components/reports/ReportModal';

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error: any) {
      console.error('Error fetching reports:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1200px] mx-auto space-y-10 animate-in slide-in-from-bottom-8 duration-700">
      {/* Header Section */}
      <header className="flex justify-between items-center bg-slate-900/40 p-10 rounded-[2rem] border border-slate-800 shadow-xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-brand/10" />
        <div className="z-10">
          <h1 className="text-5xl font-bold tracking-tight mb-3">분석 리포트</h1>
          <p className="text-slate-400 text-xl max-w-lg">시장 분석 자료를 공유하는 페이지입니다.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="toss-button flex items-center space-x-3 px-8 py-5 shadow-xl shadow-brand/20 z-10 text-xl"
        >
          <Plus className="w-6 h-6" />
          <span>새 리포트 업로드</span>
        </button>
      </header>

      {/* Search Bar */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand transition-colors w-6 h-6" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="리포트 제목, 작성자 검색..."
            className="toss-input w-full pl-14 h-16 text-xl border border-slate-800 group-hover:border-slate-700 transition-all bg-slate-950/50"
          />
        </div>
      </div>

      {/* Reports Table/List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-brand animate-spin" />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="toss-card text-center py-20 text-slate-500 text-xl">
            {searchQuery ? '검색 결과가 없습니다.' : '등록된 분석 리포트가 없습니다.'}
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => router.push(`/reports/${report.id}`)}
              className="toss-card flex items-center justify-between p-8 hover:bg-slate-800/60 transition-all cursor-pointer group hover:scale-[1.01] active:scale-[0.99] border-slate-800/50"
            >
              <div className="flex items-center space-x-8">
                <div className="p-4 bg-slate-800 rounded-2xl group-hover:bg-brand/10 group-hover:text-brand transition-colors">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-brand transition-colors">{report.title}</h3>
                  <div className="flex items-center space-x-6 text-slate-500 font-medium">
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>{report.author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5" />
                      <span>{format(new Date(report.created_at), 'yyyy년 MM월 dd일')}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <button
                  className="p-4 bg-slate-800/50 hover:bg-slate-700 rounded-2xl text-slate-400 hover:text-white transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(report.file_url, '_blank');
                  }}
                >
                  <Download className="w-6 h-6" />
                </button>
                <ChevronRight className="w-8 h-8 text-slate-700 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      <ReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchReports}
      />
    </div>
  );
}
