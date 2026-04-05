'use client';

import NewsForm from '@/components/admin/forms/NewsForm';

export default function NewNewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-['Playfair Display'] font-bold text-[#191938]">Create New News</h1>
        <p className="text-gray-600 font-['Inter'] mt-1">Add a new news article or announcement</p>
      </div>
      <NewsForm />
    </div>
  );
}
