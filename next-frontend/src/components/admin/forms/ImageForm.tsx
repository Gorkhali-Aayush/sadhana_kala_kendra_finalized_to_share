'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { SERVER_ROOT_URL } from '@/services/api';
import { type GalleryImage } from '@/services/galleryService';

export interface ImageFormData {
  image_file: File | null;
  display_order: string | number;
}

interface ImageFormProps {
  image: GalleryImage | null;
  onSubmit: (data: ImageFormData) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export const ImageForm: React.FC<ImageFormProps> = ({ image, onSubmit, onCancel, isSaving }) => {
  const [formData, setFormData] = useState<ImageFormData>({
    image_file: null,
    display_order: image?.display_order || '',
  });
  const [imagePreview, setImagePreview] = useState(
    image?.image_url ? `${SERVER_ROOT_URL}${image.image_url}` : ''
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData(prev => ({ ...prev, image_file: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6 max-w-2xl">
      <h2 className="text-2xl font-black text-slate-800">
        {image ? 'Edit Image' : 'Add Image to Collection'}
      </h2>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Display Order</label>
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
        <label className="block text-sm font-semibold text-slate-700 mb-3">Image File *</label>
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50">
          <div className="w-40 h-40 rounded-lg overflow-hidden mb-4 border-4 border-white shadow-md bg-slate-200">
            {imagePreview ? (
              <img src={imagePreview} className="w-full h-full object-cover" alt="Image Preview" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Image</div>
            )}
          </div>
          <label className="cursor-pointer bg-white px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition shadow-sm">
            {image ? 'Change Image' : 'Upload Image'}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              required={!image}
            />
          </label>
          <p className="text-[10px] text-slate-400 mt-3 uppercase tracking-tighter">JPG, PNG or WebP</p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-300">
          Cancel
        </button>
        <button disabled={isSaving} className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold disabled:opacity-60">
          {isSaving ? 'Saving...' : image ? 'Update Image' : 'Add Image'}
        </button>
      </div>
    </form>
  );
};
