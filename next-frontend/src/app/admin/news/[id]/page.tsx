'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { newsService } from '@/services/newsService';
import NewsForm from '@/components/admin/forms/NewsForm';

interface NewsItem {
  news_id?: number;
  title?: string;
  slug?: string;
  rich_content?: string;
  news_date?: string;
  image_url?: string;
  content?: string;
  display_order?: number;
}

export default function EditNewsPage() {
  const params = useParams();
  const id = params.id as string;
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await newsService.getById(parseInt(id));
        if (response) {
          setNewsItem(response as NewsItem);
        } else {
          setError('News not found');
        }
      } catch (err) {
        setError('Failed to load news');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [id]);

  if (loading) {
    return <div className="text-center py-8"><div className="inline-block w-8 h-8 border-4 border-[#cf0408] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (error) {
    return <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-['Playfair Display'] font-bold text-[#191938]">Edit News</h1>
        <p className="text-gray-600 font-['Inter'] mt-1">Update news article</p>
      </div>
      {newsItem && <NewsForm initialData={newsItem as any} isEdit />}
    </div>
  );
}
