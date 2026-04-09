'use client';

import { useState, useRef, ClipboardEvent } from 'react';
import { Send, Image as ImageIcon, Hash, TrendingUp, User, Lock, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function FeedInput() {
  const [author, setAuthor] = useState('');
  const [password, setPassword] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 크기는 5MB 이하여야 합니다.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle image paste
  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          setImageFile(file);
          setImagePreview(URL.createObjectURL(file));
        }
      }
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadImage = async (file: File) => {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('feed_images')
      .upload(fileName, file);

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('feed_images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!author || !password || !content) {
      alert('이름, 비밀번호, 내용을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      let image_url = null;
      if (imageFile) {
        image_url = await uploadImage(imageFile);
      }

      const { error } = await supabase.from('feeds').insert([
        { author, content, password, image_url }
      ]);

      if (error) throw error;

      // Reset form
      setContent('');
      removeImage();
      alert('인사이트가 공유되었습니다!');
    } catch (error: any) {
      console.error(error);
      alert('공유 실패 (팁: Supabase Storage에 feed_images 버킷을 생성했는지 확인하세요): ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="toss-card border-slate-700/50 shadow-2xl p-0 overflow-hidden group">
      <div className="p-6 space-y-4">
        {/* User Info Inputs (Icons on Right) */}
        <div className="flex space-x-3">
          <div className="relative flex-1 group/input">
            <input
              type="text"
              placeholder="이름"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="toss-input w-full pr-10 bg-slate-800/50 border border-slate-700/50"
            />
            <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/input:text-brand transition-colors" />
          </div>
          <div className="relative flex-1 group/input">
            <input
              type="password"
              placeholder="삭제 비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="toss-input w-full pr-10 bg-slate-800/50 border border-slate-700/50"
            />
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/input:text-brand transition-colors" />
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand to-blue-700 flex items-center justify-center text-white font-bold shadow-lg shrink-0">
            {author ? author[0].toUpperCase() : '?'}
          </div>
          <div className="flex-1 space-y-4">
            <textarea
              placeholder="현재 시장에 대한 의견을 공유해주세요(10일 후 자동 삭제)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onPaste={handlePaste}
              className="w-full bg-transparent border-none outline-none resize-none text-xl min-h-[120px] pt-1 text-slate-200 placeholder:text-slate-600"
            />

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative inline-block group/preview">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-80 rounded-2xl border border-slate-700 shadow-xl object-contain bg-slate-900"
                />
                <button
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-slate-800 hover:bg-red-500 text-white p-1.5 rounded-full shadow-lg transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="px-6 py-4 bg-slate-900/50 flex justify-between items-center border-t border-slate-800">
        <div className="flex items-center space-x-3 text-slate-500">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 hover:bg-slate-800 rounded-xl hover:text-brand transition-all"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <button className="p-2.5 hover:bg-slate-800 rounded-xl hover:text-brand transition-all"><Hash className="w-5 h-5" /></button>
          <button className="p-2.5 hover:bg-slate-800 rounded-xl hover:text-brand transition-all"><TrendingUp className="w-5 h-5" /></button>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="toss-button flex items-center space-x-2 px-6 py-3 disabled:opacity-50"
        >
          <span>{isSubmitting ? '공유 중...' : '공유하기'}</span>
          <Send className="w-4 h-4 ml-1" />
        </button>
      </div>
    </section>
  );
}
