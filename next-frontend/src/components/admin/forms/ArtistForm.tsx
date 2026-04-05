'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { artistsService } from '@/services/artistsService';
import {
  generateCorrelationId,
  logErrorWithContext,
  parsedErrorToFormErrors,
  parseFormErrors
} from '@/utils/errorHandler';
import { retryWithBackoff } from '@/utils/retryUtils';

interface ArtistFormProps {
  initialData?: { artist_id: number; full_name: string; slug: string; bio: string; profile_image?: string };
  isEdit?: boolean;
}

interface FormData {
  full_name: string;
  slug: string;
  bio: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  display_order: number;
}

export default function ArtistForm({ initialData, isEdit = false }: ArtistFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [previousImageUrl, setPreviousImageUrl] = useState('');
  const [formData, setFormData] = useState<FormData>({
    full_name: initialData?.full_name || '',
    slug: initialData?.slug || '',
    bio: initialData?.bio || '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    display_order: 0,
  });

  useEffect(() => {
    if (initialData?.profile_image) {
      setImagePreview(initialData.profile_image);
      setPreviousImageUrl(initialData.profile_image);
    }
  }, [initialData]);

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'display_order' ? parseInt(value) : value,
    }));
    if (name === 'full_name') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }
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

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, String(value));
      });
      if (image) {
        data.append('profile_image', image);
      } else if (previousImageUrl && !imagePreview) {
        // Image was intentionally removed - send clear_image flag
        data.append('clear_image', 'true');
      }

      if (isEdit && initialData) {
        await artistsService.update(initialData.artist_id, data);
      } else {
        await artistsService.create(data);
      }

      router.push('/admin/artists');
    } catch (err) {
      setError('Failed to save artist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
          <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cf0408]" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Slug</label>
          <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" readOnly />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
        <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={5} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cf0408]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
          <input type="number" name="display_order" value={formData.display_order} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
        </div>
      </div>

      {imagePreview && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Preview</p>
          <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
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
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">SEO Keywords</label>
            <input type="text" name="seo_keywords" value={formData.seo_keywords} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg">{error}</div>}

      <div className="flex gap-3 justify-end pt-6 border-t">
        <button type="button" onClick={() => router.back()} className="px-6 py-2 border border-gray-300 rounded-lg font-semibold">Cancel</button>
        <button type="submit" disabled={loading} className="px-6 py-2 bg-[#cf0408] text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50">
          {loading ? 'Saving...' : isEdit ? 'Update Artist' : 'Create Artist'}
        </button>
      </div>
    </form>
  );
}
