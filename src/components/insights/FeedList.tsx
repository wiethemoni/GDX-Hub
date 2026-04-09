'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import FeedItem from './FeedItem';
import { Loader2 } from 'lucide-react';

export default function FeedList() {
  const [feeds, setFeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeeds = async () => {
    try {
      const { data, error } = await supabase
        .from('feeds')
        .select('id, author, content, image_url, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeeds(data || []);
    } catch (error: any) {
      console.error('Error fetching feeds:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('feeds_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feeds' }, () => {
        fetchFeeds();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feeds.length === 0 ? (
        <div className="toss-card text-center py-20 text-slate-500">
          첫 번째 인사이트를 나눠보세요!
        </div>
      ) : (
        feeds.map((feed) => (
          <FeedItem key={feed.id} feed={feed} />
        ))
      )}
    </div>
  );
}
