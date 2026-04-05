'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { offersService } from '@/services/offersService';
import { 
  generateCorrelationId,
  logErrorWithContext,
  parsedErrorToFormErrors,
  parseFormErrors 
} from '@/utils/errorHandler';
import { retryWithBackoff } from '@/utils/retryUtils';

interface OfferFormProps {
  initialData?: { offer_id: number; title: string; description: string; discount_percentage: number; valid_from: string; valid_till: string; display_order: number };
  isEdit?: boolean;
}

interface FormData {
  title: string;
  description: string;
  discount_percentage: number;
  valid_from: string;
  valid_till: string;
  display_order: number;
}

export default function OfferForm({ initialData, isEdit = false }: OfferFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorSuggestion, setErrorSuggestion] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [correlationId, setCorrelationId] = useState('');
  const [formData, setFormData] = useState<FormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    discount_percentage: initialData?.discount_percentage || 0,
    valid_from: initialData?.valid_from || '',
    valid_till: initialData?.valid_till || '',
    display_order: initialData?.display_order || 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'discount_percentage' || name === 'display_order' ? parseInt(value) : value,
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
            return await offersService.update(initialData.offer_id, formData);
          } else {
            return await offersService.create(formData);
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

      router.push('/admin/offers');
    } catch (err: any) {
      const parsed = parseFormErrors(err, requestId);
      
      logErrorWithContext(parsed, {
        action: isEdit ? 'update_offer' : 'create_offer',
        offerId: isEdit ? initialData?.offer_id : undefined,
        offerTitle: formData.title,
      });

      const formErrors = parsedErrorToFormErrors(parsed);

      if (formErrors.submit) {
        setError(formErrors.submit);
        setErrorSuggestion(parsed.suggestion || '');
      } else {
        setFieldErrors(formErrors);
        if (Object.keys(formErrors).length === 0) {
          setError('Failed to save offer. Please try again.');
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
          <label className="block text-sm font-semibold text-gray-700 mb-2">Offer Title *</label>
          <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cf0408]" placeholder="e.g., Summer Discount" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Percentage *</label>
          <div className="flex items-center">
            <input type="number" name="discount_percentage" value={formData.discount_percentage} onChange={handleInputChange} min="0" max="100" required className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cf0408]" />
            <span className="ml-3 text-2xl font-bold text-red-600">%</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
        <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cf0408]" placeholder="Describe the offer details, terms, and conditions" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Valid From *</label>
          <input type="date" name="valid_from" value={formData.valid_from} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cf0408]" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Valid Till *</label>
          <input type="date" name="valid_till" value={formData.valid_till} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cf0408]" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
          <input type="number" name="display_order" value={formData.display_order} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cf0408]" />
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg">{error}</div>}

      <div className="flex gap-3 justify-end pt-6 border-t">
        <button type="button" onClick={() => router.back()} className="px-6 py-2 border border-gray-300 rounded-lg font-semibold">Cancel</button>
        <button type="submit" disabled={loading} className="px-6 py-2 bg-[#cf0408] text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50">
          {loading ? 'Saving...' : isEdit ? 'Update Offer' : 'Create Offer'}
        </button>
      </div>
    </form>
  );
}
