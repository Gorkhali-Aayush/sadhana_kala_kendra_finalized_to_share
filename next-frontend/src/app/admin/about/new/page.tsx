'use client';

import { useSearchParams } from 'next/navigation';
import AboutForm from '@/components/admin/forms/AboutForm';

export default function NewAboutPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'BOD';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-['Playfair Display'] font-bold text-[#191938]">Add New Entry</h1>
        <p className="text-gray-600 font-['Inter'] mt-1">Add to {category === 'BOD' ? 'Board of Directors' : category === 'Team' ? 'Team' : 'Programs'}</p>
      </div>
      <AboutForm initialData={{ category } as any} />
    </div>
  );
}
