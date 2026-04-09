'use client';

import { useState } from 'react';
import { Clock, MoreHorizontal, TrendingUp, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';

interface FeedItemProps {
  feed: {
    id: number;
    author: string;
    content: string;
    image_url?: string;
    created_at: string;
  };
}

export default function FeedItem({ feed }: FeedItemProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Check password
      const { data, error: fetchError } = await supabase
        .from('feeds')
        .select('password')
        .eq('id', feed.id)
        .single();

      if (fetchError) throw fetchError;

      if (data.password !== password) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }

      // Execute delete
      const { error: deleteError } = await supabase
        .from('feeds')
        .delete()
        .eq('id', feed.id);

      if (deleteError) throw deleteError;

      alert('삭제되었습니다.');
      setShowDeleteModal(false);
    } catch (error: any) {
      alert('삭제 실패: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="toss-card border-slate-800/60 hover:bg-slate-800/40 transition-all p-6 relative group">
      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
        <button 
          onClick={() => setShowDeleteModal(true)}
          className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-500 hover:text-slate-300">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm bg-slate-800 text-slate-400">
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
          <p className="text-slate-300 text-[1.1rem] leading-[1.8] tracking-tight whitespace-pre-wrap">{feed.content}</p>
          
          {feed.image_url && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900">
              <img 
                src={feed.image_url} 
                alt="Feed insight" 
                className="max-h-[500px] w-full object-contain"
              />
            </div>
          )}
        </div>
      </div>

      {/* Mini Delete Overlay */}
      {showDeleteModal && (
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-6 rounded-[1.25rem] z-10 animate-in fade-in duration-200">
          <div className="w-full max-w-xs space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-white">게시글 삭제</h4>
              <button onClick={() => setShowDeleteModal(false)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <input 
              type="password" 
              placeholder="비밀번호 입력" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="toss-input w-full bg-slate-800"
            />
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all disabled:opacity-50"
            >
              {isDeleting ? '삭제 중...' : '확인 및 삭제'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
