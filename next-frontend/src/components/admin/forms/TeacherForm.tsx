'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { teachersService } from '@/services/teachersService';
import { 
  parseFormErrors, 
  clearFieldError,
  generateCorrelationId,
  logErrorWithContext,
  parsedErrorToFormErrors 
} from '@/utils/errorHandler';
import { retryWithBackoff } from '@/utils/retryUtils';

interface TeacherFormData {
  full_name: string;
  specialization: string;
  description: string;
  display_order: number | '';
  profile_image_file?: File;
  previous_image_url?: string;
}

interface TeacherFormProps {
  initialData?: any;
  teacherId?: number;
  isEdit?: boolean;
}

export default function TeacherForm({ initialData, teacherId, isEdit = false }: TeacherFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<TeacherFormData>({
    ...(initialData || {
      full_name: '',
      specialization: '',
      description: '',
      display_order: '',
    }),
    previous_image_url: initialData?.profile_image || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorSuggestion, setErrorSuggestion] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [correlationId, setCorrelationId] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (initialData?.profile_image) {
      setImagePreview(initialData.profile_image);
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'display_order' ? (value === '' ? '' : Number(value)) : value,
    });
    
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
        profile_image_file: file,
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setErrorSuggestion('');
    setFieldErrors({});

    // Generate correlation ID for tracking
    const requestId = generateCorrelationId();
    setCorrelationId(requestId);

    try {
      const submitData = new FormData();
      submitData.append('full_name', formData.full_name);
      submitData.append('specialization', formData.specialization);
      submitData.append('description', formData.description);
      if (formData.display_order !== '') {
        submitData.append('display_order', formData.display_order.toString());
      }

      if (formData.profile_image_file) {
        submitData.append('profile_image', formData.profile_image_file);
      } else if (formData.previous_image_url && !imagePreview) {
        // Image was intentionally removed - send clear_image flag
        submitData.append('clear_image', 'true');
      }

      // Retry logic for transient failures
      await retryWithBackoff(
        async () => {
          if (isEdit && teacherId) {
            return await teachersService.update(teacherId, submitData);
          } else {
            return await teachersService.create(submitData);
          }
        },
        {
          maxRetries: 2,
          baseDelay: 500,
          shouldRetry: (error) => {
            return !error?.response || error.response?.status >= 500;
          }
        }
      );

      router.push('/admin/teachers');
    } catch (err: any) {
      // Parse error using structured error handler
      const parsed = parseFormErrors(err, requestId);
      
      // Log error with context
      logErrorWithContext(parsed, {
        action: isEdit ? 'update_teacher' : 'create_teacher',
        teacherId: isEdit ? teacherId : undefined,
        teacherName: formData.full_name,
      });

      // Convert parsed error to form errors
      const formErrors = parsedErrorToFormErrors(parsed);

      // Display errors
      if (formErrors.submit) {
        setError(formErrors.submit);
        setErrorSuggestion(parsed.suggestion || '');
      } else {
        setFieldErrors(formErrors);
        if (Object.keys(formErrors).length === 0) {
          setError('Failed to save teacher. Please check your input and try again.');
        }
      }

      if (parsed.category) {
        console.error(`[${parsed.correlationId}] ${parsed.category}:`, formErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span>{error}</span>
            <button type="button" onClick={() => {setError(''); setErrorSuggestion('');}} className="text-xl leading-none">×</button>
          </div>
          {errorSuggestion && (
            <p className="text-sm text-red-600 border-t border-red-200 pt-2">
              💡 {errorSuggestion}
            </p>
          )}
          {correlationId && (
            <p className="text-xs text-red-500 border-t border-red-200 pt-2">
              Error ID: {correlationId}
            </p>
          )}
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>

        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              required
              disabled={loading}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition ${
                fieldErrors.full_name
                  ? 'border-red-500 focus:ring-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-indigo-500'
              }`}
              placeholder="e.g., Dr. Ravi Shankar"
            />
            {fieldErrors.full_name && (
              <p className="mt-1 text-sm text-red-600 font-medium">🔴 {fieldErrors.full_name}</p>
            )}
          </div>

          {/* Specialization */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              disabled={loading}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition ${
                fieldErrors.specialization
                  ? 'border-red-500 focus:ring-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-indigo-500'
              }`}
              placeholder="e.g., Sitar, Vocal, Tabla"
            />
            {fieldErrors.specialization && (
              <p className="mt-1 text-sm text-red-600 font-medium">🔴 {fieldErrors.specialization}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={loading}
              rows={5}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition ${
                fieldErrors.description
                  ? 'border-red-500 focus:ring-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-indigo-500'
              }`}
              placeholder="Write a detailed biography or description about the teacher. This will appear on their profile page."
            />
            {fieldErrors.description && (
              <p className="mt-1 text-sm text-red-600 font-medium">🔴 {fieldErrors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Max 5000 characters</p>
          </div>

          {/* Display Order */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
            <input
              type="number"
              name="display_order"
              value={formData.display_order}
              onChange={handleInputChange}
              min="0"
              disabled={loading}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition ${
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

      {/* Profile Image */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Image</h2>

        <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
          {imagePreview ? (
            <div className="space-y-4">
              <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setFormData({ ...formData, profile_image_file: undefined });
                }}
                className="text-red-600 font-semibold hover:text-red-800"
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
                id="profile-image"
              />
              <label htmlFor="profile-image" className="cursor-pointer">
                <div className="text-4xl mb-2">📷</div>
                <p className="font-semibold text-gray-700">Click to upload profile image</p>
                <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 rounded-lg font-semibold text-gray-600 bg-gray-200 hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Teacher' : 'Create Teacher'}
        </button>
      </div>
    </form>
  );
}
