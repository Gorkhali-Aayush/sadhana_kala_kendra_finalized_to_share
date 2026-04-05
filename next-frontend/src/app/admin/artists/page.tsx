'use client';

import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import { artistsService } from '@/services/artistsService';
import { SERVER_ROOT_URL } from '@/services/api';
import AlertMessage from '@/components/admin/AlertMessage';
import OrderConflictDialog from '@/components/admin/OrderConflictDialog';
import PageLoader from '@/components/PageLoader';

interface Artist {
  artist_id?: number;
  id?: number;
  full_name?: string;
  slug?: string;
  bio?: string;
  profile_image?: string;
  display_order?: number;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

interface ArtistFormData {
  full_name: string;
  slug: string;
  bio: string;
  display_order: string | number;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  profileImageFile: File | null;
}

interface OrderConflict {
  warning: string;
  suggestion: string;
  nextAvailable: number;
}

const LucideIcon = ({ children }: { children: React.ReactNode }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
    {children}
  </svg>
);

const ArtistForm: React.FC<{
  artist: Artist | null;
  onSubmit: (data: ArtistFormData) => void;
  onCancel: () => void;
  isSaving: boolean;
}> = ({ artist, onSubmit, onCancel, isSaving }) => {
  const [formData, setFormData] = useState<ArtistFormData>({
    full_name: artist?.full_name || '',
    slug: artist?.slug || '',
    bio: artist?.bio || '',
    display_order: artist?.display_order || 0,
    seo_title: artist?.seo_title || '',
    seo_description: artist?.seo_description || '',
    seo_keywords: artist?.seo_keywords || '',
    profileImageFile: null,
  });

  const [imagePreviewUrl, setImagePreviewUrl] = useState(
    artist?.profile_image ? `${SERVER_ROOT_URL}${artist.profile_image}` : ''
  );

  const isNew = !artist || !artist.artist_id;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, profileImageFile: file }));
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-10 transition-all">
      <div className="bg-slate-50 border-b border-slate-200 px-8 py-4 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">
          {isNew ? '✨ Register New Artist' : '📝 Edit Artist Profile'}
        </h3>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Step 1 of 1</span>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Profile Photo Upload */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50">
          <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-white shadow-md bg-slate-200">
            {imagePreviewUrl ? (
              <img src={imagePreviewUrl} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Photo</div>
            )}
          </div>
          <label className="cursor-pointer bg-white px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition shadow-sm">
            {isNew ? 'Upload Photo' : 'Change Photo'}
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
          </label>
          <p className="text-[10px] text-slate-400 mt-3 uppercase tracking-tighter">JPG, PNG or WebP</p>
        </div>

        {/* Right: Text Fields */}
        <div className="lg:col-span-8 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Artist Full Name</label>
            <input
              type="text"
              name="full_name"
              placeholder="e.g. Ramesh Chen"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Bio / Professional Background</label>
            <textarea
              name="bio"
              placeholder="Describe the artist's style and experience..."
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Slug (Optional)</label>
            <input
              type="text"
              name="slug"
              placeholder="artist-name"
              value={formData.slug}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              Display Order <span className="text-slate-400 font-normal">(Leave blank for auto-assign)</span>
            </label>
            <input
              type="number"
              name="display_order"
              placeholder="e.g. 1, 2, 3..."
              value={formData.display_order}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
            />
            <p className="text-xs text-slate-400 mt-2">Determines the order in which this artist appears in listings.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">SEO Title</label>
            <input
              type="text"
              name="seo_title"
              placeholder="SEO title for artist page"
              value={formData.seo_title}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">SEO Description</label>
            <textarea
              name="seo_description"
              placeholder="Short SEO description"
              value={formData.seo_description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">SEO Keywords</label>
            <input
              type="text"
              name="seo_keywords"
              placeholder="artist, music, performance"
              value={formData.seo_keywords}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-50 px-8 py-4 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition">
          Discard
        </button>
        <button type="submit" disabled={isSaving} className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50">
          {isSaving ? 'Processing...' : isNew ? 'Create Profile' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default function AdminArtistPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [orderConflict, setOrderConflict] = useState<OrderConflict | null>(null);
  const [pendingFormData, setPendingFormData] = useState<ArtistFormData | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await artistsService.getAll();
      setArtists(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to synchronize artist database.');
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
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleFormSubmit = async (formData: ArtistFormData) => {
    setIsSaving(true);
    setError(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('full_name', formData.full_name);
      uploadFormData.append('bio', formData.bio || '');
      uploadFormData.append('slug', formData.slug || '');
      uploadFormData.append('display_order', String(formData.display_order || 0));
      uploadFormData.append('seo_title', formData.seo_title || '');
      uploadFormData.append('seo_description', formData.seo_description || '');
      uploadFormData.append('seo_keywords', formData.seo_keywords || '');

      if (formData.profileImageFile) {
        uploadFormData.append('profile_image', formData.profileImageFile);
      }

      if (editingArtist?.artist_id) {
        await artistsService.update(editingArtist.artist_id, uploadFormData);
        setMessage('Artist profile updated.');
      } else {
        await artistsService.create(uploadFormData);
        setMessage('New artist added successfully.');
      }
      setEditingArtist(null);
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
      setError(err?.message || 'Operation failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResolveConflict = async (newOrder: number | string) => {
    if (!pendingFormData) return;
    setIsSaving(true);
    setOrderConflict(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('full_name', pendingFormData.full_name);
      uploadFormData.append('bio', pendingFormData.bio || '');
      uploadFormData.append('slug', pendingFormData.slug || '');
      uploadFormData.append('display_order', String(newOrder || 0));
      uploadFormData.append('seo_title', pendingFormData.seo_title || '');
      uploadFormData.append('seo_description', pendingFormData.seo_description || '');
      uploadFormData.append('seo_keywords', pendingFormData.seo_keywords || '');

      if (pendingFormData.profileImageFile) {
        uploadFormData.append('profile_image', pendingFormData.profileImageFile);
      }

      if (editingArtist?.artist_id) {
        await artistsService.update(editingArtist.artist_id, uploadFormData);
        setMessage('Artist profile updated.');
      } else {
        await artistsService.create(uploadFormData);
        setMessage('New artist added successfully.');
      }
      setEditingArtist(null);
      setPendingFormData(null);
      await fetchData();
    } catch (err: any) {
      setError(err?.message || 'Operation failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Permanent Deletion? This cannot be undone.')) return;
    try {
      await artistsService.delete(id);
      setMessage('Artist record removed.');
      await fetchData();
    } catch (err: any) {
      setError(err?.message || 'Delete operation failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 text-slate-900">
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

      <div className="bg-white border-b border-slate-200 mb-8">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Artist Directory</h1>
              <p className="text-slate-500 mt-1">Manage and curate the roster of featured creative talents.</p>
            </div>
            {!editingArtist && (
              <button 
                onClick={() => setEditingArtist({} as Artist)}
                className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-[1.02]"
              >
                <LucideIcon><path d="M12 5v14M5 12h14" /></LucideIcon>
                Register New Artist
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Artists</span>
                <p className="text-2xl font-black text-slate-800">{artists.length}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                <p className="text-2xl font-black text-emerald-500 underline decoration-emerald-200">Live</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6">
        {error && <AlertMessage message={error} type="error" onClose={() => setError(null)} />}
        {message && <AlertMessage message={message} type="success" onClose={() => setMessage(null)} />}

        {editingArtist ? (
          <ArtistForm 
            artist={editingArtist.artist_id ? editingArtist : null} 
            onSubmit={handleFormSubmit} 
            onCancel={() => setEditingArtist(null)} 
            isSaving={isSaving} 
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <PageLoader message="Synchronizing artist data..." />
            ) : artists.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Professional</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">Biography Snippet</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Order</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {artists.map(a => (
                    <tr key={a.artist_id || a.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={a.profile_image ? `${SERVER_ROOT_URL}${a.profile_image}` : 'https://via.placeholder.com/150'} 
                            className="w-12 h-12 rounded-xl object-cover shadow-sm ring-2 ring-white" 
                            alt="" 
                          />
                          <div>
                            <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{a.full_name}</p>
                            <p className="text-xs text-slate-400 md:hidden line-clamp-1">{a.bio || 'No bio'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <p className="text-sm text-slate-500 line-clamp-1 max-w-xs italic">
                          {a.bio || 'Not available'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
                          {a.display_order || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingArtist(a)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                            <LucideIcon><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></LucideIcon>
                          </button>
                          <button onClick={() => handleDelete(a.artist_id || a.id || 0)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <LucideIcon><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></LucideIcon>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-20 text-center">
                <div className="text-5xl mb-4">🎨</div>
                <h3 className="text-xl font-bold text-slate-800">No artists found</h3>
                <p className="text-slate-500">Your collection is currently empty.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
