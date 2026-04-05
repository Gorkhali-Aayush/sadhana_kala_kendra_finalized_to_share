'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from './RichTextEditor';
import {
  generateCorrelationId,
  logErrorWithContext,
  parsedErrorToFormErrors,
  parseFormErrors
} from '@/utils/errorHandler';
import { retryWithBackoff } from '@/utils/retryUtils';

interface BODMember {
  id?: number;
  firstname?: string;
  lastname?: string;
  designation?: string;
  details_content?: string;
  profile_image?: string;
  display_order?: number;
  slug?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

interface BODFormProps {
  member?: BODMember;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export default function BODForm({ member, onSubmit, onCancel, isSaving }: BODFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstname: member?.firstname || '',
    lastname: member?.lastname || '',
    designation: member?.designation || '',
    details_content: member?.details_content || '',
    display_order: member?.display_order || 0,
    slug: member?.slug || '',
    seo_title: member?.seo_title || '',
    seo_description: member?.seo_description || '',
    seo_keywords: member?.seo_keywords || '',
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(member?.profile_image ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${member.profile_image}` : '');
  const [previousImageUrl, setPreviousImageUrl] = useState<string>(member?.profile_image ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${member.profile_image}` : '');
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'display_order' ? Number(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setImagePreview('');
  };

  // Helper function to generate slug from name
  const generateSlug = (firstname: string, lastname: string): string => {
    const fullName = `${firstname} ${lastname}`.trim().toLowerCase();
    const baseSlug = fullName
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    
    // Add random suffix to ensure uniqueness
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return baseSlug ? `${baseSlug}-${randomSuffix}` : randomSuffix;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const submitData = new FormData();
      // Combine firstname and lastname into name for backend
      const fullName = `${formData.firstname} ${formData.lastname}`.trim();
      // Auto-generate slug if not provided
      const slug = formData.slug.trim() || generateSlug(formData.firstname, formData.lastname);

      if (!slug) {
        setError('Please provide a first and last name for slug generation');
        return;
      }

      if (!fullName) {
        setError('Please provide a first and last name');
        return;
      }

      if (!formData.designation) {
        setError('Please provide a designation');
        return;
      }

      submitData.append('name', fullName);
      submitData.append('designation', formData.designation);
      submitData.append('details_content', formData.details_content);
      submitData.append('display_order', String(formData.display_order));
      submitData.append('slug', slug);
      submitData.append('seo_title', formData.seo_title);
      submitData.append('seo_description', formData.seo_description);
      submitData.append('seo_keywords', formData.seo_keywords);

      if (profileImage) {
        submitData.append('profile_image', profileImage);
      } else if (previousImageUrl && !imagePreview) {
        // Image was intentionally removed - send clear_image flag
        submitData.append('clear_image', 'true');
      }

      await onSubmit(submitData);
    } catch (err: any) {
      setError(err?.message || 'Failed to save');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          {member?.id ? 'Edit BOD Member' : 'Add New BOD Member'}
        </h2>
        <p className="text-slate-600 text-sm">Fill in the details below to {member?.id ? 'update' : 'add'} a Board Member.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <span className="text-sm">{error}</span>
          <button type="button" onClick={() => setError('')} className="text-lg leading-none font-bold">×</button>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={handleInputChange}
            placeholder="First Name *"
            required
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleInputChange}
            placeholder="Last Name *"
            required
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <input
          type="text"
          name="designation"
          value={formData.designation}
          onChange={handleInputChange}
          placeholder="Designation (e.g., Chairperson, Founder) *"
          required
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />

        <RichTextEditor
          label="Member Biography & Details"
          value={formData.details_content}
          onChange={(value) => setFormData(prev => ({ ...prev, details_content: value }))}
          placeholder="Enter member biography, achievements, and other details..."
          height={400}
        />

        <input
          type="text"
          name="slug"
          value={formData.slug}
          onChange={handleInputChange}
          placeholder="URL Slug (e.g., john-doe)"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* SEO Fields */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">SEO Settings</h3>
        <input
          type="text"
          name="seo_title"
          value={formData.seo_title}
          onChange={handleInputChange}
          placeholder="SEO Title"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <textarea
          name="seo_description"
          value={formData.seo_description}
          onChange={handleInputChange}
          placeholder="SEO Description"
          rows={3}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <input
          type="text"
          name="seo_keywords"
          value={formData.seo_keywords}
          onChange={handleInputChange}
          placeholder="Comma-separated keywords"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Profile Image */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">Profile Image</h3>
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition">
          {imagePreview ? (
            <div className="space-y-4">
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto border-4 border-white shadow-md">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-red-600 hover:text-red-800 font-semibold text-sm"
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
              <label htmlFor="profile-image" className="cursor-pointer block">
                <div className="text-4xl mb-2">📷</div>
                <p className="font-semibold text-slate-700">Click to upload profile image</p>
                <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF up to 10MB</p>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Display Order */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Display Order</label>
        <input
          type="number"
          name="display_order"
          value={formData.display_order}
          onChange={handleInputChange}
          min="0"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="0"
        />
        <p className="text-xs text-slate-500 mt-1">Determines order on the page (0-based)</p>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-6 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-slate-400"
        >
          {isSaving ? 'Saving...' : member?.id ? 'Update Member' : 'Add Member'}
        </button>
      </div>
    </form>
  );
}
