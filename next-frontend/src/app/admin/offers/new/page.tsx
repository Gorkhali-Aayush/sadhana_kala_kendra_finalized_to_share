'use client';

import OfferForm from '@/components/admin/forms/OfferForm';

export default function NewOfferPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-['Playfair Display'] font-bold text-[#191938]">Create New Offer</h1>
        <p className="text-gray-600 font-['Inter'] mt-1">Add a new discount or special offer</p>
      </div>
      <OfferForm />
    </div>
  );
}
