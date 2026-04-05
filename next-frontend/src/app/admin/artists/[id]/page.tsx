'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { artistsService } from '@/services/artistsService';
import ArtistForm from '@/components/admin/forms/ArtistForm';

interface Artist {
  artist_id?: number;
  full_name?: string;
  slug?: string;
  bio?: string;
  profile_image?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

export default function EditArtistPage() {
  const params = useParams();
  const id = params.id as string;
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const response = await artistsService.getById(parseInt(id));
        if (response) {
          setArtist(response as Artist);
        } else {
          setError('Artist not found');
        }
      } catch (err) {
        setError('Failed to load artist');
      } finally {
        setLoading(false);
      }
    };
    fetchArtist();
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
        <h1 className="text-3xl font-['Playfair Display'] font-bold text-[#191938]">Edit Artist</h1>
        <p className="text-gray-600 font-['Inter'] mt-1">Update artist details</p>
      </div>
      {artist && <ArtistForm initialData={artist as any} isEdit />}
    </div>
  );
}
