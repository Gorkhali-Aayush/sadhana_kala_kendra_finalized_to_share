'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { SERVER_ROOT_URL } from '@/services/api';
import { type Gallery } from '@/services/galleryService';

export interface CollectionFormData {
  title: string;
  description: string;
  thumbnail_file: File | null;
  existing_thumbnail: string;
  display_order: string | number;
}

interface CollectionFormProps {
  gallery: Gallery | null;
  onSubmit: (data: CollectionFormData) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export const CollectionForm: React.FC<CollectionFormProps> = ({ gallery, onSubmit, onCancel, isSaving }) => {
  const [formData, setFormData] = useState<CollectionFormData>({
    title: gallery?.title || '',
    description: gallery?.description || '',
    thumbnail_file: null,
    existing_thumbnail: gallery?.thumbnail_image_url || '',
    display_order: gallery?.display_order || '',
  });
  const [thumbnailPreview, setThumbnailPreview] = useState(
    gallery?.thumbnail_image_url ? `${SERVER_ROOT_URL}${gallery.thumbnail_image_url}` : ''
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData(prev => ({ ...prev, thumbnail_file: file }));
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
      <h2 className="text-2xl font-black text-slate-800">
        {gallery ? 'Edit Gallery Collection' : 'Create Gallery Collection'}
      </h2>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full border border-slate-300 rounded-lg px-3 py-2"
          placeholder="Enter collection title"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full border border-slate-300 rounded-lg px-3 py-2"
          placeholder="Enter collection description"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Display Order <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <input
          type="number"
          name="display_order"
          value={formData.display_order}
          onChange={handleChange}
          min="1"
          className="w-full border border-slate-300 rounded-lg px-3 py-2"
          placeholder="Enter order number"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">Collection Thumbnail *</label>
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50">
          <div className="w-32 h-32 rounded-lg overflow-hidden mb-4 border-4 border-white shadow-md bg-slate-200">
            {thumbnailPreview ? (
              <img src={thumbnailPreview} className="w-full h-full object-cover" alt="Thumbnail Preview" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Thumbnail</div>
            )}
          </div>
          <label className="cursor-pointer bg-white px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition shadow-sm">
            {gallery ? 'Change Thumbnail' : 'Upload Thumbnail'}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              required={!gallery && !formData.existing_thumbnail}
            />
          </label>
          <p className="text-[10px] text-slate-400 mt-3 uppercase tracking-tighter">JPG, PNG or WebP</p>

          {formData.existing_thumbnail && !formData.thumbnail_file ? (
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, existing_thumbnail: '', thumbnail_file: null }));
                setThumbnailPreview('');
              }}
              className="text-sm text-red-600 underline mt-3"
            >
              Remove current thumbnail
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-300">
          Cancel
        </button>
        <button disabled={isSaving} className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold disabled:opacity-60">
          {isSaving ? 'Saving...' : gallery ? 'Update Collection' : 'Create Collection'}
        </button>
      </div>
    </form>
  );
};
