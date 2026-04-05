'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { coursesService } from '@/services/coursesService';
import { teachersService } from '@/services/teachersService';
import { API_BASE_URL } from '@/services/api';

// ============ TYPES ============
interface Course {
  course_id?: number;
  course_name: string;
  slug?: string;
  description?: string;
  level: string;
  price: number | null;
  teacher_id?: number;
  teacher_name?: string;
  image_url?: string;
  display_order?: number;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  schedules?: Schedule[];
}

interface Schedule {
  schedule_id?: number;
  class_day?: string;
  class_day_from?: string;
  class_day_to?: string;
  start_time?: string;
  end_time?: string;
  teacher_id?: number;
  teacher_name?: string;
}

interface Teacher {
  teacher_id: number;
  full_name: string;
  specialization?: string;
}

interface OrderConflict {
  warning: string;
  suggestion: string;
  nextAvailable: number;
}

// ============ ALERT COMPONENT ============
const Alert = ({ message, type, onClose }: { message: string; type: 'error' | 'success'; onClose: () => void }) => (
  <div className={`flex items-start md:items-center justify-between p-4 mb-6 rounded-xl border animate-in fade-in slide-in-from-top-4 duration-300 ${type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
    <div className="flex items-center font-medium">
      <span className="shrink-0">{type === 'error' ? '⚠️' : '✅'}</span>
      <span className="ml-3 text-sm md:text-base">{message}</span>
    </div>
    <button onClick={onClose} className="hover:opacity-70 transition-opacity text-xl leading-none ml-4">
      &times;
    </button>
  </div>
);

// ============ ORDER CONFLICT DIALOG ============
const OrderConflictDialog = ({ conflict, onResolve, onCancel }: { conflict: OrderConflict; onResolve: (order: number | string) => void; onCancel: () => void }) => {
  const [selectedOrder, setSelectedOrder] = useState<number | string | null>(null);
  const [customOrder, setCustomOrder] = useState('');

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in duration-300">
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex items-start gap-3">
          <div className="text-3xl">⚠️</div>
          <div>
            <h2 className="font-bold text-slate-900">Display Order Conflict</h2>
            <p className="text-sm text-slate-600 mt-1">{conflict?.warning}</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
            <p className="font-semibold mb-2">💡 Suggestion:</p>
            <p>{conflict?.suggestion}</p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition">
              <input
                type="radio"
                name="order-choice"
                checked={selectedOrder === conflict?.nextAvailable}
                onChange={() => {
                  setSelectedOrder(conflict?.nextAvailable);
                  setCustomOrder('');
                }}
                className="w-4 h-4 text-indigo-600"
              />
              <span className="ml-3 flex-1">
                <span className="font-semibold text-slate-900">Use suggested order: {conflict?.nextAvailable}</span>
                <p className="text-xs text-slate-500">Automatically assign the next available order</p>
              </span>
            </label>

            <label className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition">
              <input
                type="radio"
                name="order-choice"
                checked={selectedOrder === 'custom'}
                onChange={() => setSelectedOrder('custom')}
                className="w-4 h-4 text-indigo-600"
              />
              <span className="ml-3 flex-1">
                <span className="font-semibold text-slate-900">Enter custom order:</span>
                <input
                  type="number"
                  placeholder="Enter order number"
                  value={customOrder}
                  onChange={(e) => setCustomOrder(e.target.value)}
                  onClick={() => setSelectedOrder('custom')}
                  className="mt-2 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  min="1"
                />
              </span>
            </label>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (selectedOrder === 'custom') {
                if (!customOrder || Number(customOrder) < 1) {
                  alert('Please enter a valid order number');
                  return;
                }
                onResolve(Number(customOrder));
              } else if (selectedOrder !== null) {
                onResolve(selectedOrder);
              }
            }}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

// ============ SCHEDULE MANAGER ============
const ScheduleManager = ({ schedules, setSchedules, mainTeacherName }: { schedules: Schedule[]; setSchedules: (s: Schedule[]) => void; mainTeacherName: string }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleScheduleChange = (index: number, field: string, value: string) => {
    const newSchedules = [...schedules];
    newSchedules[index] = {
      ...newSchedules[index],
      [field]: value,
      teacher_name: newSchedules[index].teacher_name || mainTeacherName,
    };
    setSchedules(newSchedules);
  };

  const handleAddSchedule = () => {
    setSchedules([
      ...schedules,
      {
        class_day_from: '',
        class_day_to: '',
        start_time: '',
        end_time: '',
        teacher_name: mainTeacherName,
      },
    ]);
  };

  const handleRemoveSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const getDayValue = (schedule: Schedule, field: string) => {
    return (schedule[field as keyof Schedule] as string) || '';
  };

  const inputClass =
    'w-full border border-gray-300 font-sans rounded-lg shadow-sm p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500 transition disabled:bg-gray-50 disabled:cursor-not-allowed';
  const labelClass = 'block text-sm font-sans font-medium text-gray-700 mb-1';

  return (
    <div className="border-2 border-indigo-200 p-6 rounded-2xl bg-indigo-50 mt-10 shadow-inner font-sans">
      <h4 className="text-2xl font-bold mb-6 text-indigo-800 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Class Schedules
      </h4>

      <p className="text-sm font-sans text-gray-600 mb-6 p-3 bg-indigo-100 rounded-lg border border-indigo-200 shadow-sm">
        * Schedules are automatically assigned to the <strong>Main Teacher</strong> selected above.
      </p>

      <div className="space-y-4">
        {schedules.map((schedule, index) => (
          <div key={index} className="grid grid-cols-12 gap-3 p-4 border border-indigo-300 rounded-xl bg-white shadow-lg items-end">
            <div className="col-span-6 md:col-span-3">
              <label className={labelClass}>From Day</label>
              <select value={getDayValue(schedule, 'class_day_from')} onChange={(e) => handleScheduleChange(index, 'class_day_from', e.target.value)} className={`${inputClass} appearance-none`} required>
                <option value="">Select Day</option>
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-6 md:col-span-3">
              <label className={labelClass}>To Day</label>
              <select value={getDayValue(schedule, 'class_day_to')} onChange={(e) => handleScheduleChange(index, 'class_day_to', e.target.value)} className={`${inputClass} appearance-none`} required>
                <option value="">Select Day</option>
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-6 md:col-span-2">
              <label className={labelClass}>Start Time</label>
              <input type="time" value={schedule.start_time || ''} onChange={(e) => handleScheduleChange(index, 'start_time', e.target.value)} className={inputClass} required />
            </div>

            <div className="col-span-6 md:col-span-2">
              <label className={labelClass}>End Time</label>
              <input type="time" value={schedule.end_time || ''} onChange={(e) => handleScheduleChange(index, 'end_time', e.target.value)} className={inputClass} required />
            </div>

            <div className="col-span-12 md:col-span-2 flex justify-end">
              <button
                type="button"
                onClick={() => handleRemoveSchedule(index)}
                className="p-3 bg-red-50 text-red-600 rounded-lg shadow-sm hover:bg-red-100 transition duration-150 border border-red-200 hover:shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddSchedule}
        className="mt-6 flex items-center px-5 py-2 text-base font-sans font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition duration-150 shadow-lg hover:shadow-xl"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Schedule Row
      </button>
    </div>
  );
};

// ============ COURSE FORM ============
const CourseForm = ({ course, onSubmit, onCancel, isSaving, teachers }: { course: Course | null; onSubmit: (data: any) => void; onCancel: () => void; isSaving: boolean; teachers: Teacher[] }) => {
  const teacherNames = teachers.map((t) => t.full_name);
  
  // Transform schedules from backend format to form format
  const transformSchedulesForForm = (schedules?: Schedule[]) => {
    if (!schedules) return [];
    return schedules.map((s) => {
      let class_day_from = '';
      let class_day_to = '';
      
      if (s.class_day && s.class_day.includes(' to ')) {
        const [from, to] = s.class_day.split(' to ');
        class_day_from = from.trim();
        class_day_to = to.trim();
      } else if (s.class_day) {
        class_day_from = s.class_day;
        class_day_to = s.class_day;
      }
      
      // Convert time format from HH:MM:SS to HH:MM for input type="time"
      const formatTime = (timeStr?: string) => {
        if (!timeStr) return '';
        return timeStr.substring(0, 5); // Take only HH:MM from HH:MM:SS
      };
      
      return {
        class_day_from,
        class_day_to,
        start_time: formatTime(s.start_time),
        end_time: formatTime(s.end_time),
        teacher_name: s.teacher_name,
      };
    });
  };

  const [formData, setFormData] = useState({
    course_name: course?.course_name || '',
    slug: course?.slug || '',
    description: course?.description || '',
    level: 'Advanced',
    price: course?.price ?? '',
    teacher_name: course?.teacher_name || '',
    display_order: course?.display_order || '',
    seo_title: course?.seo_title || '',
    seo_description: course?.seo_description || '',
    seo_keywords: course?.seo_keywords || '',
    course_image_file: null as File | null,
    existing_image_url: course?.image_url || '',
    previous_image_url: course?.image_url || '',
  });

  const [schedules, setSchedules] = useState<Schedule[]>(transformSchedulesForForm(course?.schedules));

  useEffect(() => {
    const newTeacherName = formData.teacher_name;
    if (newTeacherName) {
      setSchedules((prevSchedules) =>
        prevSchedules.map((s) => ({
          ...s,
          teacher_name: s.teacher_name || newTeacherName,
        }))
      );
    }
  }, [formData.teacher_name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      course_image_file: e.target.files?.[0] || null,
      existing_image_url: '',
    }));
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      course_image_file: null,
      existing_image_url: '',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Transform schedules: combine class_day_from and class_day_to into class_day
    const transformedSchedules = schedules.map((s) => {
      const combined_day = s.class_day_from === s.class_day_to 
        ? s.class_day_from 
        : s.class_day_from && s.class_day_to 
          ? `${s.class_day_from} to ${s.class_day_to}`
          : s.class_day || '';
      
      return {
        class_day: combined_day,
        start_time: s.start_time,
        end_time: s.end_time,
        teacher_name: s.teacher_name,
      };
    });

    const submitData = new FormData();
    // Backend expects 'title', not 'course_name'
    submitData.append('title', formData.course_name);
    submitData.append('slug', formData.slug);
    submitData.append('description', formData.description);
    submitData.append('level', formData.level);
    submitData.append('price', String(formData.price));
    submitData.append('teacher_name', formData.teacher_name);
    submitData.append('display_order', String(formData.display_order || '0'));
    submitData.append('seo_title', formData.seo_title);
    submitData.append('seo_description', formData.seo_description);
    submitData.append('seo_keywords', formData.seo_keywords);
    submitData.append('schedules', JSON.stringify(transformedSchedules));

    if (formData.course_image_file) {
      submitData.append('image', formData.course_image_file);
    } else if (formData.previous_image_url && !formData.existing_image_url) {
      // Image was intentionally removed - send clear_image flag
      submitData.append('clear_image', 'true');
    }

    onSubmit(submitData);
  };

  const isFileRequired = !course && !formData.existing_image_url;
  const imagePreviewUrl = formData.course_image_file
    ? URL.createObjectURL(formData.course_image_file)
    : formData.existing_image_url
    ? `${API_BASE_URL}${formData.existing_image_url}`
    : '';

  const inputClass =
    'mt-2 block w-full border border-gray-300 font-sans rounded-lg shadow-sm p-3 text-base focus:ring-indigo-500 focus:border-indigo-500 transition disabled:bg-gray-50 disabled:cursor-not-allowed appearance-none';
  const labelClass = 'block text-sm font-sans font-medium text-gray-700';

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-2xl shadow-2xl border border-gray-200">
      <h3 className="text-3xl font-bold mb-8 text-gray-900 border-b-2 border-indigo-200 pb-4">{course ? '📝 Edit Course Details' : '✨ Add New Course'}</h3>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className={labelClass}>Course Title</label>
            <input type="text" name="course_name" value={formData.course_name} onChange={handleChange} required className={inputClass} placeholder="Enter course title" />
          </div>

          <div>
            <label className={labelClass}>Level</label>
            <div className="mt-2 block w-full border border-gray-300 font-sans rounded-lg shadow-sm p-3 text-base bg-gray-50 text-gray-700">
              Advanced
            </div>
            <input type="hidden" name="level" value="Advanced" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label className={labelClass}>Price (NPR)</label>
            <input type="number" name="price" min="0" step="0.01" value={formData.price} onChange={handleChange} className={inputClass} placeholder="5000" />
          </div>

          <div className="md:col-span-1">
            <label className={labelClass}>
              Display Order <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input type="number" name="display_order" placeholder="e.g. 1, 2, 3..." value={formData.display_order} onChange={handleChange} min="1" className={inputClass} />
            <p className="text-xs text-slate-400 mt-2">Determines the order in which this course appears in listings.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3">
            <label className={labelClass}>Slug (Optional)</label>
            <input type="text" name="slug" value={formData.slug} onChange={handleChange} className={inputClass} placeholder="hindustani-vocal" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label className={labelClass}>
              Main Teacher <span className="text-red-500">*</span>
            </label>
            <select name="teacher_name" value={formData.teacher_name || ''} onChange={handleChange} className={`${inputClass} bg-white`} required>
              <option value="">-- Select Main Teacher --</option>
              {teacherNames.map((name, index) => (
                <option key={index} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={inputClass} placeholder="A brief description of the course..." />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Course Image {isFileRequired && <span className="text-red-500">*</span>}
          </label>

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50">
            <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-white shadow-md bg-slate-200">
              {imagePreviewUrl ? (
                <img src={imagePreviewUrl} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Photo</div>
              )}
            </div>
            <label className="cursor-pointer bg-white px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition shadow-sm">
              {course ? 'Change Photo' : 'Upload Photo'}
              <input type="file" name="course_image_file" className="hidden" onChange={handleFileChange} required={isFileRequired} accept="image/*" />
            </label>
            <p className="text-[10px] text-slate-400 mt-3 uppercase tracking-tighter">JPG, PNG or WebP</p>
            {(formData.existing_image_url || formData.course_image_file) && (
              <button type="button" onClick={handleRemoveImage} className="text-sm text-red-600 underline mt-3">
                Remove current image
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className={labelClass}>SEO Title</label>
            <input type="text" name="seo_title" value={formData.seo_title} onChange={handleChange} className={inputClass} placeholder="Best music courses in Jaipur" />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>SEO Description</label>
            <textarea name="seo_description" value={formData.seo_description} onChange={handleChange} rows={3} className={inputClass} placeholder="Short SEO-friendly summary of the course" />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>SEO Keywords</label>
            <input type="text" name="seo_keywords" value={formData.seo_keywords} onChange={handleChange} className={inputClass} placeholder="music classes, vocal training, beginners" />
          </div>
        </div>
      </div>

      <ScheduleManager schedules={schedules} setSchedules={setSchedules} mainTeacherName={formData.teacher_name || ''} />

      <div className="mt-10 flex justify-end space-x-4 border-t border-gray-200 pt-6">
        <button type="button" onClick={onCancel} disabled={isSaving} className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-sans font-semibold hover:bg-gray-100 transition shadow-md disabled:bg-gray-50 disabled:text-gray-500">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className={`px-6 py-3 rounded-xl text-white font-sans font-semibold shadow-lg transition duration-150 flex items-center ${
            isSaving ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 transform hover:scale-[1.01]'
          }`}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </>
          ) : course ? (
            'Save Changes'
          ) : (
            'Add Course'
          )}
        </button>
      </div>
    </form>
  );
};

// ============ COURSE PREVIEW CARD ============
const CourseCardPublicPreview = ({ course }: { course: Course }) => {
  const placeholderImage = 'https://via.placeholder.com/600x400?text=Course+Image';
  const imageUrl = course.image_url ? `${API_BASE_URL}${course.image_url}` : placeholderImage;
  const levelColor = course.level === 'Advanced' ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200';

  return (
    <div className="group cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 border border-gray-200">
      <div className="overflow-hidden">
        <img src={imageUrl} alt={course.course_name} className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>

      <div className="p-6 space-y-3">
        <h3 className="text-xl font-bold text-gray-900 leading-tight">{course.course_name || 'Sample Course Title'}</h3>
        <p className="text-sm font-sans text-gray-600 line-clamp-2">{course.description || 'A brief and engaging description of the course content.'}</p>
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className={`text-xs font-sans font-semibold px-3 py-1 rounded-full border ${levelColor}`}>{course.level || 'Basic'}</span>
          <div className="text-right">
            <span className="block text-sm font-sans text-indigo-700 font-bold">{course.teacher_name || 'Teacher Name'}</span>
            <span className="block text-xs font-sans text-emerald-700 font-semibold">
              {course.price !== null && course.price !== undefined ? `NPR ${Number(course.price).toLocaleString()}` : 'Price on request'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ MAIN PAGE ============
export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [orderConflict, setOrderConflict] = useState<OrderConflict | null>(null);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [courseData, teacherData] = await Promise.all([coursesService.getAll(), teachersService.getAll()]);
      setCourses(Array.isArray(courseData) ? courseData : []);
      setTeachers(Array.isArray(teacherData) ? teacherData : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch data. Please check connection and services.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleFormSubmit = async (formData: FormData) => {
    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      if (editingCourse && editingCourse.course_id) {
        await coursesService.update(editingCourse.course_id, formData);
        setMessage('Course updated successfully!');
      } else {
        await coursesService.create(formData);
        setMessage('Course created successfully!');
      }

      setEditingCourse(null);
      setOrderConflict(null);
      setPendingFormData(null);
      await fetchData();
    } catch (err: any) {
      if (err?.response?.status === 409 && err?.response?.data?.warning) {
        setOrderConflict(err.response.data);
        setPendingFormData(formData);
        setIsSaving(false);
        return;
      }
      const errorMsg = err?.message || 'An unknown error occurred.';
      setError(errorMsg);
      setIsSaving(false);
    }
  };

  const handleResolveConflict = async (newOrder: number | string) => {
    if (!pendingFormData) return;

    setIsSaving(true);
    setOrderConflict(null);

    try {
      pendingFormData.set('display_order', String(newOrder));

      if (editingCourse && editingCourse.course_id) {
        await coursesService.update(editingCourse.course_id, pendingFormData);
        setMessage('Course updated successfully!');
      } else {
        await coursesService.create(pendingFormData);
        setMessage('Course created successfully!');
      }

      setEditingCourse(null);
      setPendingFormData(null);
      await fetchData();
    } catch (err: any) {
      setError(err?.message || 'Operation failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (courseId: number | undefined) => {
    if (!courseId) return;
    if (!window.confirm('Are you sure you want to delete this course? This action is irreversible.')) return;

    setError('');
    setMessage('');
    setLoading(true);

    try {
      await coursesService.delete(courseId);
      setMessage('Course deleted successfully.');
      await fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete course.');
      setLoading(false);
    }
  };

  const showForm = editingCourse !== null;

  const formatSchedule = (s: Schedule) => {
    const dayDisplay = s.class_day_from && s.class_day_to 
      ? `${s.class_day_from} - ${s.class_day_to}` 
      : s.class_day || 'N/A';
    const teacherDisplay = s.teacher_name || 'Main';
    const timeDisplay = s.start_time && s.end_time ? `${s.start_time.substring(0, 5)}-${s.end_time.substring(0, 5)}` : 'N/A';
    return `${dayDisplay} ${timeDisplay} (${teacherDisplay})`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-10 text-slate-900">
      {orderConflict && (
        <OrderConflictDialog
          conflict={orderConflict}
          onResolve={handleResolveConflict}
          onCancel={() => {
            setOrderConflict(null);
            setPendingFormData(null);
          }}
        />
      )}

      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 mb-6 md:mb-10">
        <div className="container mx-auto px-4 sm:px-6 py-6 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-left">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Courses Console</h1>
              <p className="text-slate-500 text-sm md:text-base mt-1">Manage all courses, teachers, and schedules.</p>
            </div>
            {!showForm && (
              <button
                onClick={() => {
                  setEditingCourse({ course_name: '', level: 'Advanced', price: null } as Course);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" />
                </svg>
                Add Course
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6">
        {error && <Alert message={error} type="error" onClose={() => setError('')} />}
        {message && <Alert message={message} type="success" onClose={() => setMessage('')} />}

        {showForm ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-10 w-full max-w-4xl mx-auto">
            <CourseForm course={editingCourse} onSubmit={handleFormSubmit} onCancel={() => setEditingCourse(null)} isSaving={isSaving} teachers={teachers} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-16 text-center">
                <div className="inline-block">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                </div>
                <p className="mt-4 text-slate-600">Syncing records...</p>
              </div>
            ) : courses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Image</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Course Title, Level & Price</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Teacher</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Order</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Class Schedules</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {courses.map((course) => (
                      <tr key={course.course_id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-5">
                          {course.image_url ? (
                            <img src={`${API_BASE_URL}${course.image_url}`} alt={course.course_name} className="w-14 h-14 rounded-lg object-cover shadow-md border border-gray-200" />
                          ) : (
                            <div className="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center text-xs text-gray-500 text-center leading-none p-2 font-semibold border-2 border-dashed border-gray-400">No Image</div>
                          )}
                        </td>
                        <td className="px-6 py-5 text-sm font-bold text-slate-800">
                          {course.course_name}
                          <span
                            className={`block text-xs font-medium mt-1 p-1 px-2 rounded-full w-fit ${
                              course.level === 'Advanced' ? 'bg-orange-100 text-orange-800 border border-orange-200' : 'bg-green-100 text-green-800 border border-green-200'
                            }`}
                          >
                            {course.level}
                          </span>
                          <span className="block text-xs font-semibold mt-2 text-emerald-700">
                            {course.price !== null && course.price !== undefined ? `NPR ${Number(course.price).toLocaleString()}` : 'Price on request'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-700 font-medium">{course.teacher_name || 'N/A'}</td>
                        <td className="px-6 py-5 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">{course.display_order || '—'}</span>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-500">
                          {course.schedules && course.schedules.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {course.schedules.map((s, i) => (
                                <span key={i} className="bg-indigo-100 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full shadow-sm border border-indigo-200">
                                  {formatSchedule(s)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs font-semibold text-red-600 bg-red-100 p-1 px-2 rounded-full border border-red-300">No Schedules Set</span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingCourse(course);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button onClick={() => handleDelete(course.course_id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-16 md:p-24 text-center">
                <div className="text-5xl md:text-6xl mb-4 grayscale opacity-50">📚</div>
                <h3 className="text-lg md:text-xl font-bold text-slate-800">No Courses</h3>
                <p className="text-slate-400 text-sm mt-1">No courses found in the database.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
