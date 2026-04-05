'use client';

import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import { activitiesService } from '@/services/activitiesService';
import AlertMessage from '@/components/admin/AlertMessage';
import OrderConflictDialog from '@/components/admin/OrderConflictDialog';
import PageLoader from '@/components/PageLoader';

interface Activity {
  activity_id?: number;
  id?: number;
  title?: string;
  activity_name?: string;
  description?: string;
  video_url?: string;
  slug?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  display_order?: number;
  created_at?: string;
}

interface ActivityFormData {
  title: string;
  description: string;
  video_url: string;
  slug?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  display_order: string | number;
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

const ActivityForm: React.FC<{
  activity: Activity | null;
  onSubmit: (data: ActivityFormData) => void;
  onCancel: () => void;
  isSaving: boolean;
}> = ({ activity, onSubmit, onCancel, isSaving }) => {
  const [formData, setFormData] = useState<ActivityFormData>({
    title: activity?.title || activity?.activity_name || '',
    description: activity?.description || '',
    video_url: activity?.video_url || '',
    slug: activity?.slug || '',
    seo_title: activity?.seo_title || '',
    seo_description: activity?.seo_description || '',
    seo_keywords: activity?.seo_keywords || '',
    display_order: activity?.display_order || 0,
  });

  const isNew = !activity || !activity.activity_id;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-10 transition-all">
      <div className="bg-slate-50 border-b border-slate-200 px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-800">
          {isNew ? '✨ Post New Activity' : '📝 Edit Activity Details'}
        </h3>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Step 1 of 1</span>
      </div>

      <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Activity Title</label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Annual Musical Gala 2026"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Video URL (YouTube/Facebook)</label>
            <input
              type="url"
              name="video_url"
              placeholder="https://youtube.com/watch?v=..."
              value={formData.video_url}
              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
          <textarea
            name="description"
            placeholder="Provide context about this activity..."
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm"
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
            min="0"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm"
          />
          <p className="text-xs text-slate-400 mt-2">Determines the order in which this item appears.</p>
        </div>

        {/* SEO SECTION */}
        <div className="col-span-1 sm:col-span-2 border-t border-slate-200 pt-6 mt-6">
          <h4 className="text-sm font-bold text-slate-700 uppercase mb-4">Search Engine Optimization (SEO)</h4>
        </div>

        <div className="col-span-1 sm:col-span-2">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">URL Slug</label>
          <input
            type="text"
            name="slug"
            placeholder="e.g. annual-musical-gala-2026"
            value={formData.slug}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm"
          />
          <p className="text-xs text-slate-400 mt-2">URL-friendly identifier (auto-generated from title if blank)</p>
        </div>

        <div className="col-span-1 sm:col-span-2">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">SEO Title</label>
          <input
            type="text"
            name="seo_title"
            placeholder="e.g. Annual Musical Gala 2026 - Classical Music Event"
            value={formData.seo_title}
            onChange={handleChange}
            maxLength={60}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm"
          />
          <p className="text-xs text-slate-400 mt-2">Search result title (50-60 characters recommended)</p>
        </div>

        <div className="col-span-1 sm:col-span-2">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">SEO Description</label>
          <textarea
            name="seo_description"
            placeholder="e.g. Join us for the Annual Musical Gala showcasing classical music performances from talented artists."
            value={formData.seo_description}
            onChange={handleChange}
            maxLength={160}
            rows={3}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm"
          />
          <p className="text-xs text-slate-400 mt-2">Meta description (150-160 characters recommended)</p>
        </div>

        <div className="col-span-1 sm:col-span-2">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Keywords</label>
          <input
            type="text"
            name="seo_keywords"
            placeholder="e.g. classical music, gala event, musical performance, Indian arts"
            value={formData.seo_keywords}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm"
          />
          <p className="text-xs text-slate-400 mt-2">Comma-separated keywords (5-7 terms)</p>
        </div>
      </div>

      <div className="bg-slate-50 px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
        <button type="button" onClick={onCancel} className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition text-sm">
          Discard
        </button>
        <button type="submit" disabled={isSaving} className="px-6 sm:px-8 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-lg sm:rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 text-sm">
          {isSaving ? 'Processing...' : isNew ? 'Publish Activity' : 'Update Activity'}
        </button>
      </div>
    </form>
  );
};

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [orderConflict, setOrderConflict] = useState<OrderConflict | null>(null);
  const [pendingFormData, setPendingFormData] = useState<ActivityFormData | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await activitiesService.getAll();
      setActivities(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to synchronize activities with server.');
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

  const handleFormSubmit = async (formData: ActivityFormData) => {
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        video_url: formData.video_url,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        seo_title: formData.seo_title || formData.title,
        seo_description: formData.seo_description || formData.description,
        seo_keywords: formData.seo_keywords || '',
        display_order: formData.display_order ? parseInt(String(formData.display_order)) : 0,
      };
      if (editingActivity && editingActivity.activity_id) {
        await activitiesService.update(editingActivity.activity_id, payload);
        setMessage('Activity updated successfully.');
      } else {
        await activitiesService.create(payload);
        setMessage('New activity published.');
      }
      setEditingActivity(null);
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
      setError(err?.message || 'Operation failed. Please check your connection.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResolveConflict = async (newOrder: number | string) => {
    if (!pendingFormData) return;
    setIsSaving(true);
    setOrderConflict(null);
    try {
      const payload = {
        title: pendingFormData.title,
        description: pendingFormData.description,
        video_url: pendingFormData.video_url,
        slug: pendingFormData.slug || pendingFormData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        seo_title: pendingFormData.seo_title || pendingFormData.title,
        seo_description: pendingFormData.seo_description || pendingFormData.description,
        seo_keywords: pendingFormData.seo_keywords || '',
        display_order: parseInt(String(newOrder)),
      };
      if (editingActivity && editingActivity.activity_id) {
        await activitiesService.update(editingActivity.activity_id, payload);
        setMessage('Activity updated successfully.');
      } else {
        await activitiesService.create(payload);
        setMessage('New activity published.');
      }
      setEditingActivity(null);
      setPendingFormData(null);
      await fetchData();
    } catch (err: any) {
      setError(err?.message || 'Operation failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Confirm Deletion? This will remove this activity entry.')) return;
    try {
      await activitiesService.delete(id);
      setMessage('Activity removed.');
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

      <div className="bg-white border-b border-slate-200 mb-6 sm:mb-8">
        <div className="mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Activity Management</h1>
              <p className="text-slate-500 mt-1 text-sm">Manage event highlights and video performances.</p>
            </div>
            {!editingActivity && (
              <button
                onClick={() => setEditingActivity({} as Activity)}
                className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white font-bold rounded-lg sm:rounded-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-[1.02] text-sm sm:text-base whitespace-nowrap"
              >
                <LucideIcon><path d="M12 5v14M5 12h14" /></LucideIcon>
                Add New Activity
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6 md:mt-8">
            <div className="bg-slate-50 p-3 sm:p-4 rounded-lg sm:rounded-2xl border border-slate-100">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Total Posts</span>
              <p className="text-xl sm:text-2xl font-black text-slate-800 mt-1">{activities.length}</p>
            </div>
            <div className="bg-slate-50 p-3 sm:p-4 rounded-lg sm:rounded-2xl border border-slate-100">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Status</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-500 underline decoration-emerald-200 mt-1">Live</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {error && <AlertMessage message={error} type="error" onClose={() => setError(null)} />}
        {message && <AlertMessage message={message} type="success" onClose={() => setMessage(null)} />}

        {editingActivity ? (
          <ActivityForm 
            activity={editingActivity} 
            onSubmit={handleFormSubmit} 
            onCancel={() => setEditingActivity(null)} 
            isSaving={isSaving} 
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <PageLoader message="Fetching activities..." />
            ) : activities.length > 0 ? (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Activity Title</th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">Video Link</th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Order</th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activities.map(a => (
                    <tr key={a.activity_id || a.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                        <div className="flex flex-col">
                          <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors text-sm">{a.title || a.activity_name}</p>
                          <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">{a.description || 'No description provided.'}</p>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 hidden md:table-cell">
                        <a href={a.video_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 underline truncate max-w-50 block">
                          {a.video_url}
                        </a>
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
                          {a.display_order || '—'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-right">
                        <div className="flex justify-end gap-1 sm:gap-2">
                          <button onClick={() => setEditingActivity(a)} className="p-1.5 sm:p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                            <LucideIcon><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></LucideIcon>
                          </button>
                          <button onClick={() => handleDelete(a.activity_id || a.id || 0)} className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <LucideIcon><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></LucideIcon>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 sm:p-12 md:p-20 text-center">
                <div className="text-4xl sm:text-5xl mb-4">🎬</div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800">No activities recorded</h3>
                <p className="text-slate-500 text-sm">Your gallery is empty. Share your first video highlight.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
