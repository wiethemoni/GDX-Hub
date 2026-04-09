'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FileText, Download, Calendar, User, ArrowLeft, Loader2, Trash2, X, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function ReportDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReport = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setReport(data);
    } catch (error: any) {
      alert('리포트를 찾을 수 없거나 불러오는 데 실패했습니다.');
      router.push('/reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  const handleDelete = async () => {
    if (password !== report.password) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('리포트가 삭제되었습니다.');
      router.push('/reports');
    } catch (error: any) {
      alert('삭제 중 오류 발생: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-brand animate-spin" />
        <p className="text-slate-500 font-medium">분석 자료를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto animate-in fade-in duration-500">
      {/* Navigation */}
      <button 
        onClick={() => router.push('/reports')}
        className="flex items-center space-x-2 text-slate-500 hover:text-white transition-colors mb-10 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-lg font-medium">리포트 목록으로 돌아가기</span>
      </button>

      {/* Main Content */}
      <article className="space-y-10">
        <header className="space-y-6">
          <div className="inline-flex px-4 py-2 bg-brand/10 text-brand rounded-full text-sm font-bold tracking-widest uppercase">
            Market Analysis Report
          </div>
          <h1 className="text-5xl font-bold tracking-tight leading-tight text-white">{report.title}</h1>
          
          <div className="flex items-center justify-between pb-8 border-b border-slate-800">
            <div className="flex items-center space-x-6 text-slate-400">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span className="text-lg font-medium">{report.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span className="text-lg font-medium">
                  {format(new Date(report.created_at), 'yyyy년 MM월 dd일', { locale: ko })}
                </span>
              </div>
            </div>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="p-3 hover:bg-red-500/10 text-slate-600 hover:text-red-400 rounded-2xl transition-all"
            >
              <Trash2 className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <section className="toss-card border-none bg-slate-900/30 p-10 min-h-[400px]">
          <p className="text-xl text-slate-300 leading-[2] whitespace-pre-wrap tracking-tight">
            {report.content}
          </p>
        </section>

        {/* Attachment Footer */}
        <footer className="toss-card border-slate-700/50 bg-slate-900 shadow-2xl p-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-slate-800 rounded-2xl">
              <FileText className="w-8 h-8 text-brand" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Attached File</p>
              <p className="text-white text-xl font-bold truncate max-w-[400px]">분석 첨부 자료 (PDF/DOC)</p>
            </div>
          </div>
          <a 
            href={report.file_url} 
            download
            target="_blank"
            className="toss-button flex items-center space-x-3 px-8 py-5 h-auto text-xl shadow-lg shadow-brand/20 active:scale-95"
          >
            <Download className="w-6 h-6" />
            <span>파일 다운로드하기</span>
          </a>
        </footer>
      </article>

      {/* Delete Modal Overlay */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="toss-card w-full max-w-sm p-8 space-y-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">리포트 삭제</h3>
              <button onClick={() => setShowDeleteModal(false)}><X className="w-6 h-6 text-slate-500" /></button>
            </div>
            <p className="text-slate-400 font-medium">
              이 리포트를 삭제하시겠습니까?<br/>삭제를 위해 비밀번호를 입력해주세요.
            </p>
            <div className="relative group/input">
              <input 
                type="password" 
                placeholder="비밀번호" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="toss-input w-full pr-10 bg-slate-800"
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="toss-button w-full py-4 bg-red-500 hover:bg-red-600 shadow-none disabled:opacity-50"
            >
              {isDeleting ? '삭제 중...' : '확인 및 영구 삭제'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
