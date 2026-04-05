'use client';

import CourseForm from '@/components/admin/forms/CourseForm';

export default function NewCoursePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-['Playfair Display'] font-bold text-[#191938]">📚 Create New Course</h1>
        <p className="text-gray-600 font-['Inter'] mt-1">Add a new music course to the system</p>
      </div>

      <CourseForm isEdit={false} />
    </div>
  );
}
