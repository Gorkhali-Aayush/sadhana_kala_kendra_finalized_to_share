'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { eventsService } from '@/services/eventsService';
import RichTextEditor from './RichTextEditor';
import { 
  generateCorrelationId,
  logErrorWithContext,
  parsedErrorToFormErrors,
  parseFormErrors 
} from '@/utils/errorHandler';
import { retryWithBackoff } from '@/utils/retryUtils';

interface EventFormProps {
  initialData?: { event_id: number; event_name: string; event_date: string; event_time: string; venue: string; description: string; rich_content?: string; display_order: number };
  isEdit?: boolean;
}

interface FormData {
  event_name: string;
  event_date: string;
  event_time: string;
  venue: string;
  description: string;
  rich_content: string;
  seo_title: string;
  seo_description: string;
  display_order: number;
}

export default function EventForm({ initialData, isEdit = false }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorSuggestion, setErrorSuggestion] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [correlationId, setCorrelationId] = useState('');
  const [formData, setFormData] = useState<FormData>({
    event_name: initialData?.event_name || '',
    event_date: initialData?.event_date || '',
    event_time: initialData?.event_time || '',
    venue: initialData?.venue || '',
    description: initialData?.description || '',
    rich_content: initialData?.rich_content || '',
    seo_title: '',
    seo_description: '',
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
    setErrorSuggestion('');
    setFieldErrors({});

    const requestId = generateCorrelationId();
    setCorrelationId(requestId);

    try {
      await retryWithBackoff(
        async () => {
          if (isEdit && initialData) {
            return await eventsService.update(initialData.event_id, formData);
          } else {
            return await eventsService.create(formData);
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
      router.push('/admin/events');
    } catch (err: any) {
      const parsed = parseFormErrors(err, requestId);
      
      logErrorWithContext(parsed, {
        action: isEdit ? 'update_event' : 'create_event',
        eventId: isEdit ? initialData?.event_id : undefined,
        eventName: formData.event_name,
      });

      const formErrors = parsedErrorToFormErrors(parsed);

      if (formErrors.submit) {
        setError(formErrors.submit);
        setErrorSuggestion(parsed.suggestion || '');
      } else {
        setFieldErrors(formErrors);
        if (Object.keys(formErrors).length === 0) {
          setError('Failed to save event. Please try again.');
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
          <label className="block text-sm font-semibold text-gray-700 mb-2">Event Name *</label>
          <input type="text" name="event_name" value={formData.event_name} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cf0408]" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
          <input type="number" name="display_order" value={formData.display_order} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
          <input type="date" name="event_date" value={formData.event_date} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Time *</label>
          <input type="time" name="event_time" value={formData.event_time} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Venue *</label>
          <input type="text" name="venue" value={formData.venue} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
        <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} placeholder="Brief description of the event" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cf0408]" />
      </div>

      <div>
        <RichTextEditor
          label="Detailed Content"
          value={formData.rich_content}
          onChange={(value) => setFormData(prev => ({ ...prev, rich_content: value }))}
          placeholder="Enter detailed event information with rich formatting..."
          height={400}
        />
      </div>

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
          {loading ? 'Saving...' : isEdit ? 'Update Event' : 'Create Event'}
        </button>
      </div>
    </form>
  );
}
