'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import CourseForm from '@/components/admin/forms/CourseForm';
import { coursesService } from '@/services/coursesService';

interface CourseData {
  id?: number;
  course_id?: number;
  title?: string;
  course_name?: string;
  slug: string;
  description: string;
  level: string;
  price: number;
  teacher_id: number;
  teacher_name?: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  display_order: number;
  image_url?: string;
  schedules?: any[];
}

export default function EditCoursePage() {
  const params = useParams();
  const courseId = params.id as string;
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await coursesService.getById(Number(courseId));
        if (response) {
          setCourseData(response);
        }
      } catch (err) {
        setError('Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#cf0408] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-['Inter']">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-300 text-red-700 p-6 rounded-lg">
        <p className="font-['Inter']">{error}</p>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="bg-yellow-50 border border-yellow-300 text-yellow-700 p-6 rounded-lg">
        <p className="font-['Inter']">Course not found</p>
      </div>
    );
  }

  const courseForForm = {
    course_name: courseData.course_name || courseData.title || '',
    slug: courseData.slug,
    description: courseData.description || '',
    level: courseData.level || '',
    price: courseData.price,
    teacher_name: courseData.teacher_name || '',
    seo_title: courseData.seo_title || '',
    seo_description: courseData.seo_description || '',
    seo_keywords: courseData.seo_keywords || '',
    display_order: courseData.display_order || 0,
    image_url: courseData.image_url || '',
    schedules: courseData.schedules || [],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-['Playfair Display'] font-bold text-[#191938]">📚 Edit Course</h1>
        <p className="text-gray-600 font-['Inter'] mt-1">Update course information</p>
      </div>

      <CourseForm
        course={courseForForm}
        courseId={Number(courseId)}
        isEdit={true}
      />
    </div>
  );
}
