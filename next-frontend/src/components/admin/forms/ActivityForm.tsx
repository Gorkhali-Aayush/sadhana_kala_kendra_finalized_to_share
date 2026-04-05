'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { activitiesService } from '@/services/activitiesService';
import {
  generateCorrelationId,
  logErrorWithContext,
  parsedErrorToFormErrors,
  parseFormErrors
} from '@/utils/errorHandler';
import { retryWithBackoff } from '@/utils/retryUtils';

interface ActivityFormProps {
  initialData?: { activity_id: number; title: string; description: string; video_url?: string; display_order: number };
  isEdit?: boolean;
}

interface FormData {
  title: string;
  description: string;
  video_url: string;
  display_order: number;
}

export default function ActivityForm({ initialData, isEdit = false }: ActivityFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    video_url: initialData?.video_url || '',
    display_order: initialData?.display_order || 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'display_order' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]: [string, any]) => {
        data.append(key, String(value));
      });

      if (isEdit && initialData) {
        await activitiesService.update(initialData.activity_id, data);
      } else {
        await activitiesService.create(data);
      }

      router.push('/admin/activities');
    } catch (err) {
      setError('Failed to save activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Activity Title *</label>
          <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Annual Musical Gala 2026" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cf0408]" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Video URL (YouTube/Facebook) *</label>
          <input type="url" name="video_url" value={formData.video_url} onChange={handleInputChange} placeholder="https://youtube.com/watch?v=..." required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cf0408]" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
        <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Provide context about this activity..." rows={5} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cf0408]" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
        <input type="number" name="display_order" value={formData.display_order} onChange={handleInputChange} placeholder="e.g. 1, 2, 3..." min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cf0408]" />
        <p className="text-xs text-gray-400 mt-2">Determines the order in which this item appears.</p>
      </div>

      {error && <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg">{error}</div>}

      <div className="flex gap-3 justify-end pt-6 border-t">
        <button type="button" onClick={() => router.back()} className="px-6 py-2 border border-gray-300 rounded-lg font-semibold">Cancel</button>
        <button type="submit" disabled={loading} className="px-6 py-2 bg-[#cf0408] text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50">
          {loading ? 'Saving...' : isEdit ? 'Update Activity' : 'Create Activity'}
        </button>
      </div>
    </form>
  );
}
