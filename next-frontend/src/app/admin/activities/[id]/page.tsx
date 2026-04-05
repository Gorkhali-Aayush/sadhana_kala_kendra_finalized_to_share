'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { activitiesService } from '@/services/activitiesService';
import ActivityForm from '@/components/admin/forms/ActivityForm';

interface Activity {
  activity_id?: number;
  title?: string;
  description?: string;
  video_url?: string;
  activity_name?: string;
  image_url?: string;
  display_order?: number;
}

export default function EditActivityPage() {
  const params = useParams();
  const id = params.id as string;
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await activitiesService.getById(parseInt(id));
        if (response) {
          setActivity(response as Activity);
        } else {
          setError('Activity not found');
        }
      } catch (err) {
        setError('Failed to load activity');
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
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
        <h1 className="text-3xl font-['Playfair Display'] font-bold text-[#191938]">Edit Activity</h1>
        <p className="text-gray-600 font-['Inter'] mt-1">Update activity details</p>
      </div>
      {activity && <ActivityForm initialData={activity as any} isEdit />}
    </div>
  );
}
