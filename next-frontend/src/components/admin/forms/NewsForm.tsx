'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { newsService } from '@/services/newsService';
import RichTextEditor from './RichTextEditor';
import { 
  generateCorrelationId,
  logErrorWithContext,
  parsedErrorToFormErrors,
  parseFormErrors 
} from '@/utils/errorHandler';
import { retryWithBackoff } from '@/utils/retryUtils';

interface NewsFormProps {
  initialData?: { news_id: number; title: string; rich_content?: string; content?: string; news_date: string; image_url?: string; display_order: number };
  isEdit?: boolean;
}

interface FormData {
  title: string;
  rich_content: string;
  news_date: string;
  seo_title: string;
  seo_description: string;
  display_order: number;
}

export default function NewsForm({ initialData, isEdit = false }: NewsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorSuggestion, setErrorSuggestion] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [correlationId, setCorrelationId] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState<FormData>({
    title: initialData?.title || '',
    rich_content: initialData?.rich_content || initialData?.content || '',
    news_date: initialData?.news_date || new Date().toISOString().split('T')[0],
    seo_title: '',
    seo_description: '',
    display_order: initialData?.display_order || 0,
  });

  useEffect(() => {
    if (initialData?.image_url) {
      setImagePreview(initialData.image_url);
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'display_order' ? parseInt(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setErrorSuggestion('');
    setFieldErrors({});

    const requestId = generateCorrelationId();
    setCorrelationId(requestId);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, String(value));
      });
      if (image) {
        data.append('image_url', image);
      }

      await retryWithBackoff(
        async () => {
          if (isEdit && initialData) {
            return await newsService.update(initialData.news_id, data);
          } else {
            return await newsService.create(data);
          }
        },
        {
          maxRetries: 2,
          baseDelay: 500,
          shouldRetry: (error) => {
            return !error?.response || error.response?.status >= 500;
          }
        }
      );

      router.push('/admin/news');
    } catch (err: any) {
      const parsed = parseFormErrors(err, requestId);
      
      logErrorWithContext(parsed, {
        action: isEdit ? 'update_news' : 'create_news',
        newsId: isEdit ? initialData?.news_id : undefined,
        newsTitle: formData.title,
      });

      const formErrors = parsedErrorToFormErrors(parsed);

      if (formErrors.submit) {
        setError(formErrors.submit);
        setErrorSuggestion(parsed.suggestion || '');
      } else {
        setFieldErrors(formErrors);
        if (Object.keys(formErrors).length === 0) {
          setError('Failed to save news. Please try again.');
        }
      }

      if (parsed.category) {
        console.error(`[${parsed.correlationId}] ${parsed.category}:`, formErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
          <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cf0408]" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">News Date</label>
          <input type="date" name="news_date" value={formData.news_date} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
      </div>

      <div>
        <RichTextEditor
          label="News Content *"
          value={formData.rich_content}
          onChange={(value) => setFormData(prev => ({ ...prev, rich_content: value }))}
          placeholder="Write your news article with rich formatting..."
          height={400}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Featured Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
          <input type="number" name="display_order" value={formData.display_order} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
      </div>

      {imagePreview && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Image Preview</p>
          <img src={imagePreview} alt="Preview" className="w-40 h-40 object-cover rounded-lg" />
        </div>
      )}

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">SEO Title</label>
            <input type="text" name="seo_title" value={formData.seo_title} onChange={handleInputChange} maxLength={60} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">SEO Description</label>
            <textarea name="seo_description" value={formData.seo_description} onChange={handleInputChange} maxLength={160} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg">{error}</div>}

      <div className="flex gap-3 justify-end pt-6 border-t">
        <button type="button" onClick={() => router.back()} className="px-6 py-2 border border-gray-300 rounded-lg font-semibold">Cancel</button>
        <button type="submit" disabled={loading} className="px-6 py-2 bg-[#cf0408] text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50">
          {loading ? 'Saving...' : isEdit ? 'Update News' : 'Create News'}
        </button>
      </div>
    </form>
  );
}
