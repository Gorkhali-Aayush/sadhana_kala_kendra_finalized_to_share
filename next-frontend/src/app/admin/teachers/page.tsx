'use client';

import React, { useState, useEffect, useCallback } from "react";
import {
  teachersService,
} from "@/services/teachersService";
import { SERVER_ROOT_URL } from "@/services/api";
import { getImageUrl, getImagePlaceholder } from "@/utils/helpers";
import PageLoader from "@/components/PageLoader";

// Reusable Icon Components for a cleaner look
const LucideIcon = ({ children }: { children: React.ReactNode }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
    {children}
  </svg>
);

const Alert = ({ message, type, onClose }: { message: string; type: "error" | "success"; onClose: () => void }) => (
  <div className={`flex items-center justify-between p-4 mb-6 rounded-xl border animate-in fade-in slide-in-from-top-4 duration-300 ${
    type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"
  }`}>
    <div className="flex items-center font-medium">
      {type === "error" ? "⚠️" : "✅"} <span className="ml-3">{message}</span>
    </div>
    <button onClick={onClose} className="hover:opacity-70 transition-opacity text-xl">&times;</button>
  </div>
);

/** * COMPONENT: OrderConflictDialog
 * Handles display order conflicts with user-friendly options
 */
interface OrderConflictData {
  warning: string;
  suggestion: string;
  nextAvailable: number;
}

const OrderConflictDialog = ({ conflict, onResolve, onCancel }: { conflict: OrderConflictData; onResolve: (order: string | number) => void; onCancel: () => void }) => {
  const [selectedOrder, setSelectedOrder] = useState<number | string | null>(null);
  const [customOrder, setCustomOrder] = useState("");

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
                  setCustomOrder("");
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
                checked={selectedOrder === "custom"}
                onChange={() => setSelectedOrder("custom")}
                className="w-4 h-4 text-indigo-600"
              />
              <span className="ml-3 flex-1">
                <span className="font-semibold text-slate-900">Enter custom order:</span>
                <input
                  type="number"
                  placeholder="Enter order number"
                  value={customOrder}
                  onChange={(e) => setCustomOrder(e.target.value)}
                  onClick={() => setSelectedOrder("custom")}
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
              if (selectedOrder === "custom") {
                if (!customOrder || Number(customOrder) < 1) {
                  alert("Please enter a valid order number");
                  return;
                }
                onResolve(customOrder);
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

/** * COMPONENT: TeacherForm
 * Professional form with better visual hierarchy
 */
interface TeacherFormProps {
  teacher?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const TeacherForm = ({ teacher, onSubmit, onCancel, isSaving }: TeacherFormProps) => {
  const [formData, setFormData] = useState({
    full_name: teacher?.full_name || "",
    specialization: teacher?.specialization || "",
    description: teacher?.description || "",
    display_order: teacher?.display_order || "",
    slug: teacher?.slug || "",
    seo_title: teacher?.seo_title || "",
    seo_description: teacher?.seo_description || "",
    seo_keywords: teacher?.seo_keywords || "",
    profile_image_file: null as File | null,
    existing_profile_image: teacher?.profile_image || "",
  });
  const [imagePreview, setImagePreview] = useState(getImageUrl(teacher?.profile_image) || getImagePlaceholder('Profile Missing'));

  const isNew = !teacher || !teacher.teacher_id;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, profile_image_file: file, existing_profile_image: "" }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} 
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-10 transition-all">
      <div className="bg-slate-50 border-b border-slate-200 px-8 py-4 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">
          {isNew ? "✨ Register New Faculty" : "📝 Update Faculty Profile"}
        </h3>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Step 1 of 1</span>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Image Upload Preview */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50">
           <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-white shadow-md bg-slate-200">
              <img 
                src={imagePreview} 
                className="w-full h-full object-cover" 
                alt="Preview" 
              />
           </div>
           <label className="cursor-pointer bg-white px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition shadow-sm">
              Change Photo
              <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
           </label>
           <p className="text-[10px] text-slate-400 mt-3 uppercase tracking-tighter">Recommended: 400x400px (JPG/PNG)</p>
        </div>

        {/* Right: Fields */}
        <div className="lg:col-span-8 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Teacher Full Name</label>
            <input
              type="text"
              name="full_name"
              placeholder="e.g. Badri Sharma"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Department / Specialization</label>
            <input
              type="text"
              name="specialization"
              placeholder="e.g. Vocal"
              value={formData.specialization}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Biography / Description</label>
            <textarea
              name="description"
              placeholder="Write a detailed biography or description about the teacher. This will appear on their profile page."
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none resize-none"
            />
            <p className="text-xs text-slate-400 mt-2">{formData.description.length}/5000 characters</p>
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
            <p className="text-xs text-slate-400 mt-2">Determines the order in which this teacher appears in listings.</p>
          </div>
        </div>
      </div>

      {/* SEO Section */}
      <div className="border-t border-slate-200 bg-slate-50/50 px-8 py-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
          🔍 Search Engine Optimization (SEO)
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Slug (URL-friendly identifier)</label>
            <input
              type="text"
              name="slug"
              placeholder="Auto-generated from name if empty"
              value={formData.slug}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm"
            />
            <p className="text-xs text-slate-400 mt-2">Leave blank to auto-generate from name</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">SEO Title (50-60 characters)</label>
            <input
              type="text"
              name="seo_title"
              placeholder={`e.g. "${formData.full_name || 'Teacher Name'} - Classical Music Instructor | SKK"`}
              value={formData.seo_title}
              onChange={handleChange}
              maxLength={60}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm"
            />
            <p className="text-xs text-slate-400 mt-2">{formData.seo_title.length}/60 characters</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">SEO Description (150-160 characters)</label>
            <input
              type="text"
              name="seo_description"
              placeholder="Brief description about this faculty member for search results"
              value={formData.seo_description}
              onChange={handleChange}
              maxLength={160}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm"
            />
            <p className="text-xs text-slate-400 mt-2">{formData.seo_description.length}/160 characters</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">SEO Keywords (5-7 keywords)</label>
            <input
              type="text"
              name="seo_keywords"
              placeholder="e.g. classical music, voice training, vocalist"
              value={formData.seo_keywords}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm"
            />
            <p className="text-xs text-slate-400 mt-2">Comma-separated keywords for search visibility</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 px-8 py-4 flex justify-end gap-3 border-t border-slate-200">
        <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition">
          Discard
        </button>
        <button type="submit" disabled={isSaving} className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50">
          {isSaving ? "Processing..." : isNew ? "Create Profile" : "Save Updates"}
        </button>
      </div>
    </form>
  );
};

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [orderConflict, setOrderConflict] = useState<OrderConflictData | null>(null);
  const [pendingFormData, setPendingFormData] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await teachersService.getAll();
      setTeachers(data);
    } catch (err: any) {
      setError(err?.message || "Failed to synchronize data with server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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

  const handleFormSubmit = async (formData: any) => {
    setIsSaving(true);
    setError(null);
    try {
      // Auto-generate slug from name if not provided
      const slug = formData.slug || formData.full_name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      // Convert to FormData for proper file upload
      const submitData = new FormData();
      submitData.append('full_name', formData.full_name);
      submitData.append('specialization', formData.specialization);
      submitData.append('description', formData.description);
      submitData.append('slug', slug);
      submitData.append('seo_title', formData.seo_title);
      submitData.append('seo_description', formData.seo_description);
      submitData.append('seo_keywords', formData.seo_keywords);
      if (formData.display_order) {
        submitData.append('display_order', formData.display_order.toString());
      }
      if (formData.profile_image_file) {
        submitData.append('profile_image', formData.profile_image_file);
      }

      if (editingTeacher && editingTeacher.teacher_id) {
        await teachersService.update(editingTeacher.teacher_id, submitData);
        setMessage("Faculty record updated successfully.");
      } else {
        await teachersService.create(submitData);
        setMessage("New faculty member added to the directory.");
      }
      setEditingTeacher(null);
      setOrderConflict(null);
      setPendingFormData(null);
      fetchData();
    } catch (err: any) {
      // Check for display order conflict (409)
      if (err?.response?.status === 409 && err?.response?.data?.warning) {
        setOrderConflict(err.response.data);
        setPendingFormData(formData);
        setIsSaving(false);
        return; // Don't set error, show dialog instead
      }
      setError(err?.message || "Operation failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResolveConflict = async (newOrder: string | number) => {
    if (!pendingFormData) return;
    
    setIsSaving(true);
    setOrderConflict(null);
    
    try {
      const updatedFormData = { ...pendingFormData, display_order: newOrder };
      
      // Auto-generate slug if not provided
      const slug = updatedFormData.slug || updatedFormData.full_name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      
      // Convert to FormData for proper file upload
      const submitData = new FormData();
      submitData.append('full_name', updatedFormData.full_name);
      submitData.append('specialization', updatedFormData.specialization);
      submitData.append('description', updatedFormData.description);
      submitData.append('slug', slug);
      submitData.append('seo_title', updatedFormData.seo_title);
      submitData.append('seo_description', updatedFormData.seo_description);
      submitData.append('seo_keywords', updatedFormData.seo_keywords);
      if (updatedFormData.display_order) {
        submitData.append('display_order', updatedFormData.display_order.toString());
      }
      if (updatedFormData.profile_image_file) {
        submitData.append('profile_image', updatedFormData.profile_image_file);
      }
      
      if (editingTeacher && editingTeacher.teacher_id) {
        await teachersService.update(editingTeacher.teacher_id, submitData);
        setMessage("Faculty record updated successfully.");
      } else {
        await teachersService.create(submitData);
        setMessage("New faculty member added to the directory.");
      }
      
      setEditingTeacher(null);
      setPendingFormData(null);
      fetchData();
    } catch (err: any) {
      setError(err?.message || "Operation failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Confirm Deletion? This will permanently remove this teacher.")) return;
    try {
      await teachersService.delete(id);
      setMessage("Record removed.");
      fetchData();
    } catch (err: any) {
      setError(err?.message || "Delete operation failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 text-slate-900">
      {/* Conflict Dialog */}
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

      {/* HEADER SECTION */}
      <div className="bg-white border-b border-slate-200 mb-8">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Faculty Management</h1>
              <p className="text-slate-500 mt-1">Configure and manage your educational institution's teaching staff.</p>
            </div>
            {!editingTeacher && (
              <button 
                onClick={() => setEditingTeacher({})}
                className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-[1.02]"
              >
                <LucideIcon><path d="M12 5v14M5 12h14" /></LucideIcon>
                Add Faculty Member
              </button>
            )}
          </div>
          
          {/* TOP STATS MINI-CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Staff</span>
                <p className="text-2xl font-black text-slate-800">{teachers.length}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                <p className="text-2xl font-black text-emerald-500 underline decoration-emerald-200">Live</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6">
        {error && <Alert message={error} type="error" onClose={() => setError(null)} />}
        {message && <Alert message={message} type="success" onClose={() => setMessage(null)} />}

        {editingTeacher ? (
          <TeacherForm 
            teacher={editingTeacher} 
            onSubmit={handleFormSubmit} 
            onCancel={() => setEditingTeacher(null)} 
            isSaving={isSaving} 
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <PageLoader message="Synchronizing database..." />
            ) : teachers.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Faculty Member</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">Specialization</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest hidden lg:table-cell text-center">Order</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teachers.map((t) => (
                    <tr key={t.teacher_id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img src={getImageUrl(t.profile_image) || getImagePlaceholder('Profile')} className="w-12 h-12 rounded-xl object-cover shadow-sm ring-2 ring-white" alt="" />
                          <div>
                            <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{t.full_name}</p>
                            <p className="text-xs text-slate-400 md:hidden">{t.specialization}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold tracking-tight">
                          {t.specialization}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
                          {t.display_order || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingTeacher(t)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                            <LucideIcon><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></LucideIcon>
                          </button>
                          <button onClick={() => handleDelete(t.teacher_id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
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
                <div className="text-5xl mb-4">🏫</div>
                <h3 className="text-xl font-bold text-slate-800">No faculty members found</h3>
                <p className="text-slate-500">Your directory is currently empty. Start by adding your first teacher.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
    