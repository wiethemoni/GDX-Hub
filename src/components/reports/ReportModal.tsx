'use client';

import { useState, useRef } from 'react';
import { X, Upload, User, Lock, FileText, AlignLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReportModal({ isOpen, onClose, onSuccess }: ReportModalProps) {
  const [author, setAuthor] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 20 * 1024 * 1024) {
        alert('파일 크기는 20MB 이하여야 합니다.');
        return;
      }
      setFile(selectedFile);
    }
  };

  const uploadFile = async (file: File) => {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('report_files')
      .upload(fileName, file);

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('report_files')
      .getPublicUrl(fileName);
      
    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!author || !password || !title || !content || !file) {
      alert('모든 필드와 첨부파일을 확인해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const fileUrl = await uploadFile(file);

      const { error } = await supabase.from('reports').insert([
        { title, author, content, password, file_url: fileUrl }
      ]);

      if (error) throw error;

      alert('리포트가 성공적으로 업로드되었습니다!');
      onSuccess();
      onClose();
    } catch (error: any) {
      alert('업로드 실패: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl animate-in fade-in" onClick={onClose} />
      
      <div className="toss-card w-full max-w-2xl bg-slate-900 border-slate-700 shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
        <header className="px-8 py-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-brand/10 text-brand rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">새 분석 리포트 작성</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </header>

        <main className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative group/input">
              <input 
                type="text" 
                placeholder="제목" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="toss-input w-full pr-10 bg-slate-800/50"
              />
              <AlignLeft className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/input:text-brand" />
            </div>
            <div className="relative group/input">
              <input 
                type="text" 
                placeholder="작성자" 
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="toss-input w-full pr-10 bg-slate-800/50"
              />
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/input:text-brand" />
            </div>
          </div>

          {/* Password Section */}
          <div className="relative group/input">
            <input 
              type="password" 
              placeholder="삭제 비밀번호 (나중에 리포트를 삭제할 때 필요합니다)" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="toss-input w-full pr-10 bg-slate-800/50"
            />
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/input:text-brand" />
          </div>

          {/* Content Area */}
          <textarea 
            placeholder="분석 자료에 대한 상세 내용을 입력하세요..." 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-slate-800/30 border border-slate-800 focus:border-brand/40 outline-none rounded-2xl p-4 min-h-[200px] text-lg text-slate-200 transition-all"
          />

          {/* File Upload Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-800 hover:border-brand/40 rounded-2xl p-8 transition-all cursor-pointer bg-slate-900/50 group flex flex-col items-center justify-center text-center space-y-3"
          >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            {file ? (
              <>
                <FileText className="w-12 h-12 text-brand animate-bounce" />
                <div>
                  <p className="text-white font-bold">{file.name}</p>
                  <p className="text-slate-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB • 변경하려면 클릭하세요</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-slate-800 rounded-full group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <p className="text-slate-300 font-medium">분석 파일 업로드 (PDF, Word 등)</p>
                  <p className="text-slate-500 text-sm">파일을 드래그하거나 클릭하여 선택하세요 (최대 20MB)</p>
                </div>
              </>
            )}
          </div>
        </main>

        <footer className="p-8 pt-0">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="toss-button w-full h-16 text-xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <span>리포트 발행하기</span>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}
