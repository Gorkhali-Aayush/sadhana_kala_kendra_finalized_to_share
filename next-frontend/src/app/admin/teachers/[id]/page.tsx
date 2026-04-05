'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { teachersService } from '@/services/teachersService';
import TeacherForm from '@/components/admin/forms/TeacherForm';

interface Teacher {
  teacher_id?: number;
  id?: number;
  full_name?: string;
  specialization?: string;
  description?: string;
  profile_image?: string;
  display_order?: number;
}

export default function EditTeacherPage() {
  const params = useParams();
  const id = params.id as string;
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const response = await teachersService.getById(Number(id));
        if (response) {
          setTeacher(response as Teacher);
        } else {
          setError('Teacher not found');
        }
      } catch (err) {
        setError('Failed to load teacher');
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, [id]);

  if (loading) {
    return <div className="text-center py-8"><div className="inline-block w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (error) {
    return <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Teacher</h1>
        <p className="text-gray-600 mt-1">Update teacher details</p>
      </div>
      {teacher && <TeacherForm initialData={teacher as any} teacherId={Number(id)} isEdit />}
    </div>
  );
}
