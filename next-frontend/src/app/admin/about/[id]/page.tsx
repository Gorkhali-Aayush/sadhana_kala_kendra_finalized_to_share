'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { aboutService } from '@/services/aboutService';
import AboutForm from '@/components/admin/forms/AboutForm';

interface AboutItem {
  bod_id?: number;
  program_id?: number;
  name?: string;
  title?: string;
  slug?: string;
  bio?: string;
  description?: string;
  details_content?: string;
  profile_image?: string;
  about_id?: number;
  order_field?: string;
  category?: string;
  details?: string;
  display_order?: number;
}

export default function EditAboutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const category = searchParams.get('category') || 'bod';
  const [aboutItem, setAboutItem] = useState<AboutItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const getService = () => {
          if (category === 'bod' || category === 'BOD') return aboutService.bodService;
          if (category === 'team' || category === 'Team') return aboutService.teamMembersService;
          return aboutService.programsService;
        };

        const service = getService();
        const response = await service.getById(parseInt(id));
        if (response) {
          setAboutItem(response as AboutItem);
        } else {
          setError('Entry not found');
        }
      } catch (err) {
        setError('Failed to load entry');
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, [id, category]);

  if (loading) {
    return <div className="text-center py-8"><div className="inline-block w-8 h-8 border-4 border-[#cf0408] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (error) {
    return <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-['Playfair Display'] font-bold text-[#191938]">Edit Entry</h1>
        <p className="text-gray-600 font-['Inter'] mt-1">Update about section entry</p>
      </div>
      {aboutItem && <AboutForm initialData={aboutItem as any} isEdit />}
    </div>
  );
}
