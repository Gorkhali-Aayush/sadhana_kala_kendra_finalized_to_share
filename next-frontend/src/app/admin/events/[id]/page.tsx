'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { eventsService } from '@/services/eventsService';
import EventForm from '@/components/admin/forms/EventForm';

interface Event {
  event_id?: number;
  event_name?: string;
  slug?: string;
  category?: string;
  description?: string;
  event_date?: string;
  event_time?: string;
  venue?: string;
  organized_by?: string;
}

export default function EditEventPage() {
  const params = useParams();
  const id = params.id as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventsService.getById(parseInt(id));
        if (response) {
          setEvent(response as Event);
        } else {
          setError('Event not found');
        }
      } catch (err) {
        setError('Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
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
        <h1 className="text-3xl font-['Playfair Display'] font-bold text-[#191938]">Edit Event</h1>
        <p className="text-gray-600 font-['Inter'] mt-1">Update event details</p>
      </div>
      {event && <EventForm initialData={event as any} isEdit />}
    </div>
  );
}
