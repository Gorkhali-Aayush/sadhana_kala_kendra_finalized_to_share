'use client';

import ArtistForm from '@/components/admin/forms/ArtistForm';

export default function NewArtistPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-['Playfair Display'] font-bold text-[#191938]">Create New Artist</h1>
        <p className="text-gray-600 font-['Inter'] mt-1">Add a new featured artist</p>
      </div>
      <ArtistForm />
    </div>
  );
}
