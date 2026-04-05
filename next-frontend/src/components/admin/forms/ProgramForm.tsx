'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import RichTextEditor from './RichTextEditor';
import { formatDateForInput } from '@/utils/helpers';

interface Program {
  id?: number;
  program_id?: number;
  title?: string;
  program_name?: string;
  rich_content?: string;
  program_date?: string;
  image_url?: string;
  display_order?: number;
  slug?: string;
  seo_title?: string;
  seo_description?: string;
}

interface ProgramResource {
  resource_id?: number;
  resource_type: 'image' | 'youtube';
  resource_url: string;
  caption?: string;
  sort_order?: number;
}

interface ProgramFormProps {
  program?: Program;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

interface FormData {
  title: string;
  rich_content: string;
  program_date: string;
  seo_title: string;
  seo_description: string;
  slug: string;
  display_order: number;
}

export default function ProgramForm({ program, onSubmit, onCancel, isSaving }: ProgramFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState('');
  const [extraImages, setExtraImages] = useState<File[]>([]);
  const [extraImagePreviews, setExtraImagePreviews] = useState<string[]>([]);
  const [youtubeLinks, setYoutubeLinks] = useState<string[]>(['']);
  const [existingResources, setExistingResources] = useState<ProgramResource[]>([]);
  const [existingYoutubeUrls, setExistingYoutubeUrls] = useState<Set<string>>(new Set());

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!API_BASE_URL) {
    throw new Error('API_BASE_URL environment variable is not configured');
  }

  const [formData, setFormData] = useState<FormData>({
    title: program?.title || program?.program_name || '',
    rich_content: program?.rich_content || '',
    program_date: formatDateForInput(program?.program_date),
    seo_title: program?.seo_title || '',
    seo_description: program?.seo_description || '',
    slug: program?.slug || '',
    display_order: program?.display_order || 0,
  });

  // Fetch resources when editing program
  useEffect(() => {
    if (program?.id || program?.program_id) {
      const programId = program.id || program.program_id;
      fetchResources(programId as number);
    }
    
    if (program?.image_url) {
      setMainImagePreview(program.image_url.startsWith('http') ? program.image_url : `${API_BASE_URL}${program.image_url}`);
    }
  }, [program]);

  const fetchResources = async (programId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/programs/${programId}/resources`);
      if (response.ok) {
        const resources = await response.json();
        setExistingResources(resources);
        
        // Track existing YouTube URLs to prevent duplication when submitting
        const youtubeUrls = new Set<string>();
        resources.forEach((r: ProgramResource) => {
          if (r.resource_type === 'youtube') {
            youtubeUrls.add(r.resource_url);
          }
        });
        setExistingYoutubeUrls(youtubeUrls);
        
        // Always keep youtubeLinks empty for new input - existing videos are shown separately
        setYoutubeLinks(['']);
      }
    } catch (err) {
      // Error fetching resources - keep default empty state
      setYoutubeLinks(['']);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'display_order' ? parseInt(value) : value,
    }));
  };

  const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleExtraImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setExtraImages(prev => [...prev, ...files]);
    files.forEach(file => {
      setExtraImagePreviews(prev => [...prev, URL.createObjectURL(file)]);
    });
  };

  const removeExtraImage = (index: number) => {
    setExtraImages(prev => prev.filter((_, i) => i !== index));
    setExtraImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (resourceId: number | undefined) => {
    if (resourceId) {
      setExistingResources(prev => prev.filter(r => r.resource_id !== resourceId));
    }
  };

  const handleYoutubeChange = (index: number, value: string) => {
    const newLinks = [...youtubeLinks];
    newLinks[index] = value;
    setYoutubeLinks(newLinks);
  };

  const addYoutubeField = () => {
    setYoutubeLinks(prev => [...prev, '']);
  };

  const removeYoutubeField = (index: number) => {
    setYoutubeLinks(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingYoutube = (resourceId: number | undefined) => {
    if (resourceId) {
      setExistingResources(prev => prev.filter(r => r.resource_id !== resourceId));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataObj = new FormData();
      
      // Add form fields
      formDataObj.append('title', formData.title);
      formDataObj.append('rich_content', formData.rich_content);
      formDataObj.append('program_date', formData.program_date);
      formDataObj.append('display_order', String(formData.display_order));
      formDataObj.append('slug', formData.slug);
      formDataObj.append('seo_title', formData.seo_title);
      formDataObj.append('seo_description', formData.seo_description);

      // Add main image
      if (mainImage) {
        formDataObj.append('image_url', mainImage);
      }

      // Add extra images
      extraImages.forEach((file) => {
        formDataObj.append('extraImages', file);
      });

      // Combine existing resources (minus removed) with new ones for the resources field
      const existingImagesToKeep = existingResources
        .filter(r => r.resource_type === 'image')
        .map(r => ({
          resource_type: 'image' as const,
          resource_url: r.resource_url,
          caption: r.caption || null,
          sort_order: r.sort_order || 0,
        }));

      const existingVideosToKeep = existingResources
        .filter(r => r.resource_type === 'youtube')
        .map(r => ({
          resource_type: 'youtube' as const,
          resource_url: r.resource_url,
          caption: r.caption || null,
          sort_order: r.sort_order || 0,
        }));

      // Combine all resources
      const allResources = [
        ...existingImagesToKeep,
        ...existingVideosToKeep,
        ...youtubeLinks
          .filter(link => link.trim() && !existingYoutubeUrls.has(link.trim())) // Exclude existing URLs
          .map((link, idx) => ({
            resource_type: 'youtube' as const,
            resource_url: link,
            caption: null,
            sort_order: existingImagesToKeep.length + existingVideosToKeep.length + idx + 1,
          }))
      ];

      if (allResources.length > 0) {
        formDataObj.append('resources', JSON.stringify(allResources));
      }

      await onSubmit(formDataObj as any);
    } catch (err: any) {
      setError(err?.message || 'Failed to save program');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
          <input 
            type="text" 
            name="title" 
            value={formData.title} 
            onChange={handleInputChange} 
            required 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cf0408]" 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Program Date</label>
          <input 
            type="date" 
            name="program_date" 
            value={formData.program_date} 
            onChange={handleInputChange} 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cf0408]" 
          />
        </div>
      </div>

      <div>
        <RichTextEditor
          label="Program Content *"
          value={formData.rich_content}
          onChange={(value) => setFormData(prev => ({ ...prev, rich_content: value }))}
          placeholder="Write your program details with rich formatting..."
          height={400}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Featured Image Upload - Left Side */}
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50">
          <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-white shadow-md bg-slate-200">
            {mainImagePreview ? (
              <img src={mainImagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Photo</div>
            )}
          </div>
          <label className="cursor-pointer bg-white px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition shadow-sm">
            {mainImagePreview ? "Change Photo" : "Upload Photo"}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleMainImageChange}
              className="hidden"
            />
          </label>
          <p className="text-[10px] text-slate-400 mt-3 uppercase tracking-tighter">JPG, PNG or WebP</p>
        </div>

        {/* Display Order - Right Side */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
          <input 
            type="number" 
            name="display_order" 
            value={formData.display_order} 
            onChange={handleInputChange} 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cf0408]" 
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Resources</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Gallery Images (Optional)</label>
            
            {/* Existing Images */}
            {existingResources.filter(r => r.resource_type === 'image').length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-600 mb-3 uppercase">Existing Gallery Images</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {existingResources
                    .filter(r => r.resource_type === 'image')
                    .map((resource) => (
                      <div key={resource.resource_id} className="relative group">
                        <img 
                          src={resource.resource_url.startsWith('http') ? resource.resource_url : `${API_BASE_URL}${resource.resource_url}`} 
                          alt="Gallery" 
                          className="h-24 w-full object-cover rounded-lg border-2 border-slate-200" 
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(resource.resource_id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-lg hover:bg-red-700 transition shadow-md opacity-0 group-hover:opacity-100"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* New Upload Area */}
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 bg-slate-50/50 mb-6">
              <label className="cursor-pointer flex flex-col items-center justify-center w-full">
                <div className="text-center">
                  <div className="text-4xl mb-3">📸</div>
                  <p className="text-sm font-semibold text-gray-700">Add Gallery Images</p>
                  <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-tighter">Click to select or drag images here</p>
                  <p className="text-[10px] text-slate-400 mt-1">JPG, PNG or WebP (Max 10 images)</p>
                </div>
                <input 
                  type="file" 
                  multiple
                  accept="image/*" 
                  onChange={handleExtraImagesChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* New Uploads Preview Grid */}
            {extraImagePreviews.length > 0 && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {extraImagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative group">
                    <img src={preview} alt={`Gallery ${idx}`} className="h-24 w-full object-cover rounded-lg border-2 border-slate-200" />
                    <button
                      type="button"
                      onClick={() => removeExtraImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-lg hover:bg-red-700 transition shadow-md opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">YouTube Videos (Optional)</label>
            
            {/* Existing YouTube Links */}
            {existingResources.filter(r => r.resource_type === 'youtube').length > 0 && (
              <div className="mb-6 p-4 bg-linear-to-r from-slate-50 to-blue-50/30 border border-slate-200 rounded-2xl">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">Existing Videos</p>
                <div className="space-y-2">
                  {existingResources
                    .filter(r => r.resource_type === 'youtube')
                    .map((resource) => (
                      <div key={resource.resource_id} className="group flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100 hover:border-slate-200 hover:shadow-sm transition">
                        <a 
                          href={resource.resource_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 text-sm text-blue-600 hover:text-blue-700 hover:underline truncate font-medium"
                        >
                          {resource.resource_url}
                        </a>
                        <button
                          type="button"
                          onClick={() => removeExistingYoutube(resource.resource_id)}
                          className="ml-3 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* New YouTube Links - Professional Bordered Container */}
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50 mb-4">
              <div className="flex flex-col gap-3">
                <div className="text-center mb-2">
                  <p className="text-sm font-semibold text-gray-700">Add YouTube Video Links</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase">Paste URL or Video ID</p>
                </div>
                {youtubeLinks.map((link, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input 
                      type="url" 
                      value={link} 
                      onChange={(e) => handleYoutubeChange(idx, e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white text-sm transition"
                    />
                    {youtubeLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeYoutubeField(idx)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium transition"
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addYoutubeField}
                  className="mt-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-semibold transition shadow-sm"
                >
                  + Add Video Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="text-lg">⚙️</span> Additional Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">URL Slug (Optional)</label>
            <input 
              type="text" 
              name="slug" 
              value={formData.slug} 
              onChange={handleInputChange} 
              className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:shadow-sm transition text-sm"
              placeholder="e.g. program-slug-name"
            />
            <p className="text-xs text-slate-400 mt-1.5">Auto-generated from title if left blank</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="text-lg">🔍</span> SEO & Metadata
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">SEO Title</label>
            <input 
              type="text" 
              name="seo_title" 
              value={formData.seo_title} 
              onChange={handleInputChange} 
              maxLength={60} 
              className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:shadow-sm transition text-sm"
              placeholder="SEO title (max 60 chars)"
            />
            <p className="text-xs text-slate-400 mt-1.5">Recommended: 50-60 characters</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Meta Description</label>
            <textarea 
              name="seo_description" 
              value={formData.seo_description} 
              onChange={handleInputChange} 
              maxLength={160} 
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:shadow-sm transition text-sm resize-none"
              placeholder="Meta description for search engines (max 160 chars)"
            />
            <p className="text-xs text-slate-400 mt-1.5">Recommended: 150-160 characters</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg">{error}</div>
      )}

      <div className="flex gap-3 justify-end pt-6 border-t">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isSaving || loading}
          className="px-6 py-2 bg-[#cf0408] text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition"
        >
          {isSaving || loading ? 'Saving...' : program?.id || program?.program_id ? 'Update Program' : 'Create Program'}
        </button>
      </div>
    </form>
  );
}
