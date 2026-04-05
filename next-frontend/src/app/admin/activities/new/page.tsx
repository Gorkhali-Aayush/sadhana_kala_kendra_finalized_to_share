'use client';

import ActivityForm from '@/components/admin/forms/ActivityForm';

export default function NewActivityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-['Playfair Display'] font-bold text-[#191938]">Create New Activity</h1>
        <p className="text-gray-600 font-['Inter'] mt-1">Add a new activity or program</p>
      </div>
      <ActivityForm />
    </div>
  );
}
