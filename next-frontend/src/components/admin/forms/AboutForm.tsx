'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { aboutService } from '@/services/aboutService';

interface AboutFormProps {
  initialData?: { about_id: number; title: string; order_field: string; category: string; details: string; display_order: number };
  isEdit?: boolean;
}

interface FormData {
  title: string;
  order_field: string;
  category: 'BOD' | 'Team' | 'Programs';
  details: string;
  display_order: number;
}

export default function AboutForm({ initialData, isEdit = false }: AboutFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    title: initialData?.title || '',
    order_field: initialData?.order_field || '',
    category: (initialData?.category as 'BOD' | 'Team' | 'Programs') || (searchParams.get('category') as 'BOD' | 'Team' | 'Programs') || 'BOD',
    details: initialData?.details || '',
    display_order: initialData?.display_order || 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'display_order' ? parseInt(value) : name === 'category' ? (value as 'BOD' | 'Team' | 'Programs') : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const getService = () => {
        if (formData.category === 'BOD') return aboutService.bodService;
        if (formData.category === 'Team') return aboutService.teamMembersService;
        return aboutService.programsService;
      };

      const service = getService();

      if (isEdit && initialData) {
        await service.update(initialData.about_id, formData);
      } else {
        await service.create(formData);
      }

      router.push('/admin/about');
    } catch (err) {
      setError('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const fieldLabel = formData.category === 'BOD' ? 'Position' : formData.category === 'Team' ? 'Role' : 'Type';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg border border-gray-200 p-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
        <select name="category" value={formData.category} onChange={handleInputChange} disabled={isEdit} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cf0408]">
          <option value="BOD">Board of Directors</option>
          <option value="Team">Team</option>
          <option value="Programs">Programs</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Name/Title *</label>
          <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cf0408]" placeholder={formData.category === 'BOD' ? 'e.g., Dr. John Doe' : formData.category === 'Team' ? 'e.g., Jane Smith' : 'e.g., Classical Dance'} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{fieldLabel} *</label>
          <input type="text" name="order_field" value={formData.order_field} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cf0408]" placeholder={formData.category === 'BOD' ? 'e.g., Chairperson' : formData.category === 'Team' ? 'e.g., Teacher' : 'e.g., Beginner Level'} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Details/Description</label>
        <textarea name="details" value={formData.details} onChange={handleInputChange} rows={5} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cf0408]" placeholder="Add more details about this entry" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
        <input type="number" name="display_order" value={formData.display_order} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cf0408]" />
      </div>

      {error && <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg">{error}</div>}

      <div className="flex gap-3 justify-end pt-6 border-t">
        <button type="button" onClick={() => router.push('/admin/about')} className="px-6 py-2 border border-gray-300 rounded-lg font-semibold">Cancel</button>
        <button type="submit" disabled={loading} className="px-6 py-2 bg-[#cf0408] text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50">
          {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
