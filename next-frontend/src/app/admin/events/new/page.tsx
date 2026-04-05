'use client';

import EventForm from '@/components/admin/forms/EventForm';

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-['Playfair Display'] font-bold text-[#191938]">Create New Event</h1>
        <p className="text-gray-600 font-['Inter'] mt-1">Add a new upcoming event</p>
      </div>
      <EventForm />
    </div>
  );
}
