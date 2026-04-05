'use client';

import TeacherForm from '@/components/admin/forms/TeacherForm';

export default function NewTeacherPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-['Playfair Display'] font-bold text-[#191938]">Create New Teacher</h1>
        <p className="text-gray-600 font-['Inter'] mt-1">Add a new teacher to the faculty</p>
      </div>
      <TeacherForm />
    </div>
  );
}
