'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { coursesService } from '@/services/coursesService';
import { teachersService } from '@/services/teachersService';
import { 
  parseFormErrors, 
  clearFieldError, 
  ParsedError,
  generateCorrelationId,
  logErrorWithContext,
  parsedErrorToFormErrors 
} from '@/utils/errorHandler';
import { retryWithBackoff } from '@/utils/retryUtils';

interface Teacher {
  teacher_id: number;
  full_name: string;
  specialization?: string;
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

interface CourseFormData {
  course_name: string;
  slug: string;
  description: string;
  level: string;
  price: number | '';
  teacher_name: string;
  display_order: number | '';
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  course_image_file: File | null;
  existing_image_url: string;
  previous_image_url: string;
}

interface CourseFormProps {
  course?: any;
  courseId?: number;
  isEdit?: boolean;
}

export default function CourseForm({ course, courseId, isEdit = false }: CourseFormProps) {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  
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

  const [formData, setFormData] = useState<CourseFormData>({
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
    course_image_file: null,
    existing_image_url: course?.image_url || '',
    previous_image_url: course?.image_url || '',
  });

  const [schedules, setSchedules] = useState<Schedule[]>(transformSchedulesForForm(course?.schedules));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorSuggestion, setErrorSuggestion] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [correlationId, setCorrelationId] = useState('');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await teachersService.getAll();
      if (response && Array.isArray(response)) {
        setTeachers(response);
      }
    } catch (err) {
      // Failed to fetch teachers
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'course_name') {
      setFormData({
        ...formData,
        course_name: value,
        slug: generateSlug(value),
      });
    } else if (name === 'price' || name === 'display_order') {
      setFormData({
        ...formData,
        [name]: value === '' ? '' : Number(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    
    // Clear field error when user starts editing
    if (fieldErrors[name]) {
      setFieldErrors(prev => clearFieldError(prev, name));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        course_image_file: file,
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          existing_image_url: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScheduleChange = (index: number, field: string, value: string) => {
    const newSchedules = [...schedules];
    newSchedules[index] = {
      ...newSchedules[index],
      [field]: value,
    };
    setSchedules(newSchedules);
  };

  const addSchedule = () => {
    setSchedules([
      ...schedules,
      {
        class_day_from: '',
        class_day_to: '',
        start_time: '',
        end_time: '',
        teacher_name: formData.teacher_name,
      },
    ]);
  };

  const removeSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setErrorSuggestion('');
    setFieldErrors({});

    // Generate correlation ID for this request
    const requestId = generateCorrelationId();
    setCorrelationId(requestId);

    try {
      // Transform schedules from form format back to backend format
      const transformedSchedules = schedules.map((s) => {
        const combined_day = s.class_day_from === s.class_day_to 
          ? s.class_day_from 
          : `${s.class_day_from} to ${s.class_day_to}`;
        
        return {
          class_day: combined_day,
          start_time: s.start_time,
          end_time: s.end_time,
          teacher_name: s.teacher_name,
        };
      });

      const submitData = new FormData();
      submitData.append('title', formData.course_name);
      submitData.append('slug', formData.slug);
      submitData.append('description', formData.description);
      submitData.append('level', formData.level);
      submitData.append('price', String(formData.price || 0));
      submitData.append('teacher_name', formData.teacher_name);
      submitData.append('seo_title', formData.seo_title);
      submitData.append('seo_description', formData.seo_description);
      submitData.append('seo_keywords', formData.seo_keywords);
      submitData.append('display_order', String(formData.display_order || 0));
      submitData.append('schedules', JSON.stringify(transformedSchedules));

      if (formData.course_image_file) {
        submitData.append('image', formData.course_image_file);
      } else if (formData.previous_image_url && !formData.existing_image_url) {
        // Image was intentionally removed - send clear_image flag
        submitData.append('clear_image', 'true');
      }

      // Retry logic for transient failures
      await retryWithBackoff(
        async () => {
          if (isEdit && courseId) {
            return await coursesService.update(courseId, submitData);
          } else {
            return await coursesService.create(submitData);
          }
        },
        {
          maxRetries: 2,
          baseDelay: 500,
          shouldRetry: (error) => {
            // Only retry on network/server errors, not validation errors
            return !error?.response || error.response?.status >= 500;
          }
        }
      );

      router.push('/admin/courses');
    } catch (err: any) {
      // Parse error using structured error handler
      const parsed = parseFormErrors(err, requestId);
      
      // Log error with context for debugging
      logErrorWithContext(parsed, {
        action: isEdit ? 'update_course' : 'create_course',
        courseId: isEdit ? courseId : undefined,
        courseTitle: formData.course_name,
      });

      // Convert parsed error to form errors
      const formErrors = parsedErrorToFormErrors(parsed);

      // Display errors in UI
      if (formErrors.submit) {
        setError(formErrors.submit);
        setErrorSuggestion(parsed.suggestion || '');
      } else {
        // Field-specific errors
        setFieldErrors(formErrors);
        // Show general message if no field errors
        if (Object.keys(formErrors).length === 0) {
          setError('Failed to save course. Please check your input and try again.');
        }
      }

      // Show correlation ID for support reference
      if (parsed.category) {
        console.error(`[${parsed.correlationId}] ${parsed.category}:`, formErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg space-y-2">
          <div className="flex justify-between items-start">
            <span className="font-['Inter'] text-sm">{error}</span>
            <button type="button" onClick={() => {setError(''); setErrorSuggestion('');}} className="text-xl leading-none font-bold">×</button>
          </div>
          {errorSuggestion && (
            <p className="text-sm text-red-600 border-t border-red-200 pt-2 mt-2">
              💡 {errorSuggestion}
            </p>
          )}
          {correlationId && (
            <p className="text-xs text-red-500 border-t border-red-200 pt-2 mt-2">
              Error ID: {correlationId}
            </p>
          )}
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-['Roboto'] font-bold text-gray-900 mb-4">Basic Information</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-['Inter'] font-semibold text-gray-700 mb-2">Course Title *</label>
            <input
              type="text"
              name="course_name"
              value={formData.course_name}
              onChange={handleInputChange}
              required
              disabled={loading}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent font-['Inter'] text-sm transition ${
                fieldErrors.title
                  ? 'border-red-500 focus:ring-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-indigo-500'
              }`}
              placeholder="e.g., Classical Indian Music Basics"
            />
            {fieldErrors.title && (
              <p className="mt-1 text-sm text-red-600 font-medium">🔴 {fieldErrors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-['Inter'] font-semibold text-gray-700 mb-2">Slug *</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              required
              disabled={loading}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent font-['Inter'] text-sm transition ${
                fieldErrors.slug
                  ? 'border-red-500 focus:ring-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-indigo-500'
              }`}
              placeholder="auto-generated-from-title"
            />
            {fieldErrors.slug && (
              <p className="mt-1 text-sm text-red-600 font-medium">🔴 {fieldErrors.slug}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-['Inter'] font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              disabled={loading}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent font-['Inter'] text-sm transition ${
                fieldErrors.description
                  ? 'border-red-500 focus:ring-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-indigo-500'
              }`}
              placeholder="Course description..."
            />
            {fieldErrors.description && (
              <p className="mt-1 text-sm text-red-600 font-medium">🔴 {fieldErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-['Inter'] font-semibold text-gray-700 mb-2">Level</label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-['Inter'] text-sm">
                Advanced
              </div>
              <input type="hidden" name="level" value="Advanced" />
              {fieldErrors.level && (
                <p className="mt-1 text-sm text-red-600 font-medium">🔴 {fieldErrors.level}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-['Inter'] font-semibold text-gray-700 mb-2">Price (₹)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                disabled={loading}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent font-['Inter'] text-sm transition ${
                  fieldErrors.price
                    ? 'border-red-500 focus:ring-red-500 bg-red-50'
                    : 'border-gray-300 focus:ring-indigo-500'
                }`}
                placeholder="0.00"
              />
              {fieldErrors.price && (
                <p className="mt-1 text-sm text-red-600 font-medium">🔴 {fieldErrors.price}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-['Inter'] font-semibold text-gray-700 mb-2">Main Teacher</label>
              <select
                name="teacher_name"
                value={formData.teacher_name}
                onChange={(e) => {
                  setFormData({ ...formData, teacher_name: e.target.value });
                  if (fieldErrors.teacher_id) {
                    setFieldErrors(prev => clearFieldError(prev, 'teacher_id'));
                  }
                }}
                disabled={loading}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent font-['Inter'] text-sm transition ${
                  fieldErrors.teacher_id
                    ? 'border-red-500 focus:ring-red-500 bg-red-50'
                    : 'border-gray-300 focus:ring-indigo-500'
                }`}
              >
                <option value="">Select Teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.teacher_id} value={teacher.full_name}>
                    {teacher.full_name}
                  </option>
                ))}
              </select>
              {fieldErrors.teacher_id && (
                <p className="mt-1 text-sm text-red-600 font-medium">🔴 {fieldErrors.teacher_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-['Inter'] font-semibold text-gray-700 mb-2">Display Order</label>
              <input
                type="number"
                name="display_order"
                value={formData.display_order}
                onChange={handleInputChange}
                min="0"
                disabled={loading}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent font-['Inter'] text-sm transition ${
                  fieldErrors.display_order
                    ? 'border-red-500 focus:ring-red-500 bg-red-50'
                    : 'border-gray-300 focus:ring-indigo-500'
                }`}
                placeholder="0"
              />
              {fieldErrors.display_order && (
                <p className="mt-1 text-sm text-red-600 font-medium">🔴 {fieldErrors.display_order}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Image */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-['Roboto'] font-bold text-gray-900 mb-4">Course Image</h2>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition">
          {formData.existing_image_url ? (
            <div className="space-y-4">
              <img src={formData.existing_image_url} alt="Preview" className="h-48 mx-auto rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, existing_image_url: '', course_image_file: null });
                }}
                className="text-red-600 font-['Inter'] font-semibold hover:text-red-800 text-sm"
              >
                Remove Image
              </button>
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="course-image"
              />
              <label htmlFor="course-image" className="cursor-pointer block">
                <div className="text-5xl mb-3">📷</div>
                <p className="font-['Inter'] font-semibold text-gray-700">Click to upload course image</p>
                <p className="text-xs text-gray-500 font-['Inter'] mt-1">PNG, JPG, GIF up to 10MB</p>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Schedules */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-['Roboto'] font-bold text-gray-900">Class Schedules</h2>
          <button
            type="button"
            onClick={addSchedule}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-['Inter'] text-sm font-semibold transition"
          >
            + Add Schedule
          </button>
        </div>

        <div className="space-y-4">
          {schedules.length === 0 ? (
            <p className="text-gray-500 font-['Inter'] text-sm text-center py-8">No schedules added yet</p>
          ) : (
            schedules.map((schedule, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-['Inter'] font-semibold text-gray-700 mb-1">From Day</label>
                    <select
                      value={schedule.class_day_from || ''}
                      onChange={(e) => handleScheduleChange(index, 'class_day_from', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-['Inter'] text-sm"
                    >
                      <option value="">Select Day</option>
                      {days.map((day) => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-['Inter'] font-semibold text-gray-700 mb-1">To Day</label>
                    <select
                      value={schedule.class_day_to || ''}
                      onChange={(e) => handleScheduleChange(index, 'class_day_to', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-['Inter'] text-sm"
                    >
                      <option value="">Select Day</option>
                      {days.map((day) => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-['Inter'] font-semibold text-gray-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={schedule.start_time || ''}
                      onChange={(e) => handleScheduleChange(index, 'start_time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-['Inter'] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-['Inter'] font-semibold text-gray-700 mb-1">End Time</label>
                    <input
                      type="time"
                      value={schedule.end_time || ''}
                      onChange={(e) => handleScheduleChange(index, 'end_time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-['Inter'] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-['Inter'] font-semibold text-gray-700 mb-1">Teacher</label>
                    <input
                      type="text"
                      value={schedule.teacher_name || formData.teacher_name || ''}
                      onChange={(e) => handleScheduleChange(index, 'teacher_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-['Inter'] text-sm"
                      placeholder="Teacher name"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeSchedule(index)}
                    className="text-red-600 hover:text-red-800 font-['Inter'] font-semibold text-sm"
                  >
                    Remove Schedule
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SEO Fields */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-['Roboto'] font-bold text-gray-900 mb-4">SEO Settings</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-['Inter'] font-semibold text-gray-700 mb-2">SEO Title</label>
            <input
              type="text"
              name="seo_title"
              value={formData.seo_title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-['Inter'] text-sm"
              placeholder="SEO title (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-['Inter'] font-semibold text-gray-700 mb-2">SEO Description</label>
            <textarea
              name="seo_description"
              value={formData.seo_description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-['Inter'] text-sm"
              placeholder="SEO description (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-['Inter'] font-semibold text-gray-700 mb-2">SEO Keywords</label>
            <input
              type="text"
              name="seo_keywords"
              value={formData.seo_keywords}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-['Inter'] text-sm"
              placeholder="Comma-separated keywords (optional)"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-['Inter'] font-semibold text-sm transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 font-['Inter'] font-semibold text-sm transition"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Course' : 'Create Course'}
        </button>
      </div>
    </form>
  );
}
