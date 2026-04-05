'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { offersService } from '@/services/offersService';
import OfferForm from '@/components/admin/forms/OfferForm';

interface Offer {
  offer_id?: number;
  course_id?: number;
  title?: string;
  slug?: string;
  description?: string;
  discount_percentage?: number;
  image_url?: string;
  valid_from?: string;
  valid_till?: string;
  display_order?: number;
}

export default function EditOfferPage() {
  const params = useParams();
  const id = params.id as string;
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const response = await offersService.getById(parseInt(id));
        if (response) {
          setOffer(response as Offer);
        } else {
          setError('Offer not found');
        }
      } catch (err) {
        setError('Failed to load offer');
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
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
        <h1 className="text-3xl font-['Playfair Display'] font-bold text-[#191938]">Edit Offer</h1>
        <p className="text-gray-600 font-['Inter'] mt-1">Update offer details</p>
      </div>
      {offer && <OfferForm initialData={offer as any} isEdit />}
    </div>
  );
}
