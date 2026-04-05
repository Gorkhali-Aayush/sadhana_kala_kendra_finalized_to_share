'use client';

import React, { useState, useEffect, useRef, Suspense } from "react";
import {
  newsService,
  getNewsResources,
} from "@/services/newsService";
import { SERVER_ROOT_URL } from "@/services/api";
import PageLoader from "@/components/PageLoader";
import RichTextEditor from "@/components/admin/RichTextEditor";

const LucideIcon = ({ children }: { children: React.ReactNode }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">{children}</svg>
);

const Alert = ({ message, type, onClose }: { message: string; type: "error" | "success"; onClose: () => void }) => (
  <div className={`flex items-start md:items-center justify-between p-4 mb-6 rounded-xl border animate-in fade-in slide-in-from-top-4 duration-300 ${type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}> <div className="flex items-center font-medium"><span className="shrink-0">{type === "error" ? "⚠️" : "✅"}</span> <span className="ml-3 text-sm md:text-base">{message}</span></div><button onClick={onClose} className="hover:opacity-70 transition-opacity text-xl leading-none ml-4">&times;</button></div>
);

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

const formatNewsDataForForm = (news: any) => ({
  news_id: news.news_id || null,
  title: news.title || "",
  slug: news.slug || "",
  rich_content: news.rich_content || "",
  news_date: news.news_date ? new Date(news.news_date).toISOString().split("T")[0] : "",
  image_url: news.image_url || "",
  display_order: news.display_order || 0,
  seo_title: news.seo_title || "",
  seo_description: news.seo_description || "",
  seo_keywords: news.seo_keywords || "",
});

interface NewsFormProps {
  news?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const NewsForm = ({ news, onSubmit, onCancel, isSaving }: NewsFormProps) => {
  const [formData, setFormData] = useState(formatNewsDataForForm(news || {}));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(() => {
    if (news?.image_url) {
      return news.image_url.startsWith('http') ? news.image_url : (SERVER_ROOT_URL + news.image_url);
    }
    return "";
  });
  const [extraImages, setExtraImages] = useState<(File | null)[]>([]);
  const [extraImagePreviews, setExtraImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [ytLinks, setYtLinks] = useState<string[]>([""]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRichContentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, rich_content: value }));
  };

  useEffect(() => {
    setFormData(formatNewsDataForForm(news || {}));
    setImageFile(null);
    if (news?.image_url) {
      setImagePreview(news.image_url.startsWith('http') ? news.image_url : (SERVER_ROOT_URL + news.image_url));
    } else {
      setImagePreview("");
    }

    if (news?.resources && Array.isArray(news.resources)) {
      const imageResources = news.resources.filter((r: any) => r.resource_type === 'image');
      const ytResources = news.resources.filter((r: any) => r.resource_type === 'youtube');
      
      // Separate existing images (URLs) from new files
      const existingImageUrls = imageResources.map((r: any) => 
        r.resource_url.startsWith('http') ? r.resource_url : (SERVER_ROOT_URL + r.resource_url)
      );
      setExistingImages(existingImageUrls);
      setExtraImages([]); // No new files yet
      setExtraImagePreviews(existingImageUrls);
      setYtLinks(ytResources.length > 0 ? ytResources.map((r: any) => r.resource_url) : [""]);
    } else {
      setExtraImages([]);
      setExtraImagePreviews([]);
      setExistingImages([]);
      setYtLinks([""]);
    }
  }, [news]);

  const handleExtraImagesChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (file) {
      setExtraImages(prev => {
        const updated = [...prev];
        updated[idx] = file;
        return updated;
      });
      setExtraImagePreviews(prev => {
        const updated = [...prev];
        updated[idx] = URL.createObjectURL(file);
        return updated;
      });
    }
  };

  const addExtraImage = () => {
    setExtraImages(prev => [...prev, null]); // Add null placeholder
    setExtraImagePreviews(prev => [...prev, ""]);
  };

  const removeExtraImage = (idx: number) => {
    // Calculate actual index accounting for existing vs new
    const existingCount = existingImages.length;
    const isExisting = idx < existingCount;
    
    if (isExisting) {
      setExistingImages((prev) => prev.filter((_, i) => i !== idx));
      setExtraImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    } else {
      const newIdx = idx - existingCount;
      setExtraImages((prev) => prev.filter((_, i) => i !== newIdx));
      setExtraImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleYtLinkChange = (idx: number, value: string) => {
    setYtLinks((prev) => prev.map((l, i) => (i === idx ? value : l)));
  };

  const addYtLink = () => setYtLinks((prev) => [...prev, ""]);
  const removeYtLink = (idx: number) => setYtLinks((prev) => prev.filter((_, i) => i !== idx));

  const inputStyle = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-slate-700 text-sm md:text-base";
  const labelStyle = "block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2";

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const submitData = { ...formData } as any;
      if (imageFile) submitData.image = imageFile;
      submitData.extraImagesToUpload = extraImages;
      submitData.existingImagesToKeep = existingImages;
      submitData.ytLinks = ytLinks.filter(l => l.trim());
      onSubmit(submitData);
    }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-10 w-full max-w-6xl mx-auto">
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
        <span className="text-2xl">{news?.news_id ? "📝" : "📰"}</span>
        <h3 className="text-lg font-bold text-slate-800">{news?.news_id ? "Edit News" : "Add News"}</h3>
      </div>
      <div className="p-5 md:p-8 space-y-6">
        {/* Main Image & Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Main Image Upload */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50">
            <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-white shadow-md bg-slate-200">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Photo</div>
              )}
            </div>
            <label className="cursor-pointer bg-white px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition shadow-sm">
              {imagePreview ? "Change Photo" : "Upload Photo"}
              <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            </label>
            <p className="text-[10px] text-slate-400 mt-3 uppercase tracking-tighter">JPG, PNG or WebP</p>
          </div>

          {/* Right: Title, Date, Order */}
          <div className="space-y-4">
            <div>
              <label className={labelStyle}>Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required className={inputStyle} placeholder="e.g. Award Announcement" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelStyle}>Date</label>
                <input type="date" name="news_date" value={formData.news_date} onChange={handleChange} required className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>Order</label>
                <input type="number" name="display_order" placeholder="e.g. 1, 2, 3..." value={formData.display_order} onChange={handleChange} min="1" className={inputStyle} />
              </div>
            </div>
            <div>
              <label className={labelStyle}>Slug (Optional)</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleChange} className={inputStyle} placeholder="award-announcement" />
            </div>
          </div>
        </div>

        {/* Rich Content */}
        <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="text-lg">📄</span> Content
          </h3>
          <div>
            <label className={labelStyle}>Rich Content (Formatted)</label>
            <RichTextEditor
              value={formData.rich_content}
              onChange={handleRichContentChange}
              placeholder="Enter formatted news content with rich formatting..."
            />
            <p className="text-xs text-slate-400 mt-2">Format your content with bold, italic, lists, and links.</p>
          </div>
        </div>

        {/* Gallery Images Section */}
        <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="text-lg">📸</span> Gallery Images
          </h3>
          
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">Existing Images</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {existingImages.map((imgUrl, idx) => (
                  <div key={`existing-${idx}`} className="relative group">
                    <img src={imgUrl} alt="Existing image" className="h-24 w-full object-cover rounded-lg border-2 border-slate-200" />
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
            </div>
          )}

          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 bg-slate-50/50">
            <label className="cursor-pointer flex flex-col items-center justify-center w-full">
              <div className="text-center">
                <div className="text-4xl mb-3">📷</div>
                <p className="text-sm font-semibold text-gray-700">Add Gallery Images</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase">Click to select or drag images here</p>
                <p className="text-[10px] text-slate-400 mt-1">JPG, PNG or WebP</p>
              </div>
              <input type="file" multiple accept="image/*" onChange={e => {
                const files = e.target.files;
                if (files) {
                  for (let i = 0; i < files.length; i++) {
                    if (!extraImages[i]) {
                      setExtraImages(prev => [...prev, files[i]]);
                      setExtraImagePreviews(prev => [...prev, URL.createObjectURL(files[i])]);
                    }
                  }
                }
              }} className="hidden" />
            </label>
          </div>

          {/* New Images Grid */}
          {extraImages.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">New Uploads</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {extraImages.map((file, idx) => (
                  <div key={`new-${idx}`} className="relative group">
                    <img src={extraImagePreviews[existingImages.length + idx]} alt="New image" className="h-24 w-full object-cover rounded-lg border-2 border-slate-200" />
                    <button 
                      type="button" 
                      onClick={() => removeExtraImage(existingImages.length + idx)} 
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-lg hover:bg-red-700 transition shadow-md opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* YouTube Videos Section */}
        <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="text-lg">🎥</span> YouTube Videos
          </h3>

          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50">
            <div className="flex flex-col gap-3">
              <div className="text-center mb-2">
                <p className="text-sm font-semibold text-gray-700">Add YouTube Video Links</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase">Paste URL or Video ID</p>
              </div>
              {ytLinks.map((link, idx) => (
                <div key={idx} className="flex gap-2">
                  <input 
                    type="url" 
                    value={link} 
                    onChange={e => handleYtLinkChange(idx, e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white text-sm transition"
                  />
                  {ytLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeYtLink(idx)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium transition"
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addYtLink}
                className="mt-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-semibold transition shadow-sm"
              >
                + Add Video Link
              </button>
            </div>
          </div>
        </div>

        {/* SEO & Metadata Section */}
        <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="text-lg">🔍</span> SEO & Metadata
          </h3>
          <div className="space-y-4">
            <div>
              <label className={labelStyle}>SEO Title</label>
              <input type="text" name="seo_title" value={formData.seo_title} onChange={handleChange} className={inputStyle} placeholder="SEO title for search engines" maxLength={60} />
              <p className="text-xs text-slate-400 mt-1.5">Recommended: 50-60 characters</p>
            </div>
            <div>
              <label className={labelStyle}>Meta Description</label>
              <textarea name="seo_description" value={formData.seo_description} onChange={handleChange} rows={3} className={inputStyle + " resize-none"} placeholder="Short SEO description" maxLength={160} />
              <p className="text-xs text-slate-400 mt-1.5">Recommended: 150-160 characters</p>
            </div>
            <div>
              <label className={labelStyle}>SEO Keywords</label>
              <input type="text" name="seo_keywords" value={formData.seo_keywords} onChange={handleChange} className={inputStyle} placeholder="music, school, bharatanatyam, workshop" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 px-5 md:px-8 py-4 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="w-full sm:w-auto px-6 py-2 bg-[#cf0408] text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition"
        >
          {isSaving ? "Saving..." : news?.news_id ? "Update News" : "Create News"}
        </button>
      </div>
    </form>
  );
};

export default function AdminNews() {
  const [newsList, setNewsList] = useState<any[]>([]);
  const [editingNews, setEditingNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [orderConflict, setOrderConflict] = useState<OrderConflictData | null>(null);
  const [pendingFormData, setPendingFormData] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await newsService.getAll();
      setNewsList(data);
    } catch (err: any) {
      setError(err?.message || "Failed to sync news records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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

    const {
      news_id,
      image,
      extraImagesToUpload,
      existingImagesToKeep,
      ytLinks,
      ...apiPayload
    } = formData as any;

    const form = new FormData();

    Object.entries(apiPayload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        form.append(key, String(value));
      }
    });

    if (image) {
      form.append("image", image);
    }

    if (Array.isArray(extraImagesToUpload) && extraImagesToUpload.length > 0) {
      extraImagesToUpload.forEach((img, idx) => {
        if (img instanceof File) {
          form.append("extraImages", img);
        }
      });
    }

    if (Array.isArray(existingImagesToKeep) && existingImagesToKeep.length > 0) {
      existingImagesToKeep.forEach((url) => form.append("existingImagesToKeep", url));
    }

    form.append("ytLinks", JSON.stringify(Array.isArray(ytLinks) ? ytLinks : []));

    try {
      if (news_id) {
        await newsService.update(news_id, form);
        setMessage("News successfully updated.");
      } else {
        await newsService.create(form);
        setMessage("News added successfully.");
      }
      setEditingNews(null);
      setOrderConflict(null);
      setPendingFormData(null);
      fetchData();
    } catch (err: any) {
      if (err?.response?.status === 409 && err?.response?.data?.warning) {
        setOrderConflict(err.response.data);
        setPendingFormData(formData);
        setIsSaving(false);
        return;
      }
      setError(err?.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (news: any) => {
    try {
      const resources = await getNewsResources(String(news.news_id));
      setEditingNews({ ...news, resources });
    } catch (err) {
      setEditingNews(news);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Confirm deletion?")) return;
    try {
      await newsService.delete(id);
      setMessage("News record deleted.");
      fetchData();
    } catch (err: any) {
      setError(err?.message || "Failed to delete record.");
    }
  };

  const handleResolveConflict = async (newOrder: string | number) => {
    if (!pendingFormData) return;
    
    setIsSaving(true);
    setOrderConflict(null);
    
    try {
      const {
        news_id,
        image,
        extraImagesToUpload,
        existingImagesToKeep,
        ytLinks,
        ...apiPayload
      } = { ...pendingFormData, display_order: parseInt(String(newOrder)) } as any;

      const form = new FormData();

      Object.entries(apiPayload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          form.append(key, String(value));
        }
      });

      if (image) {
        form.append("image", image);
      }

      if (Array.isArray(extraImagesToUpload) && extraImagesToUpload.length > 0) {
        extraImagesToUpload.forEach((img) => form.append("extraImages", img));
      }

      if (Array.isArray(existingImagesToKeep) && existingImagesToKeep.length > 0) {
        existingImagesToKeep.forEach((url) => form.append("existingImagesToKeep", url));
      }

      form.append("ytLinks", JSON.stringify(Array.isArray(ytLinks) ? ytLinks : []));

      if (news_id) {
        await newsService.update(news_id, form);
        setMessage("News successfully updated.");
      } else {
        await newsService.create(form);
        setMessage("News added successfully.");
      }
      
      setEditingNews(null);
      setPendingFormData(null);
      fetchData();
    } catch (err: any) {
      setError(err?.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-10 text-slate-900">
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

      <div className="bg-white border-b border-slate-200 mb-6 md:mb-10">
        <div className="container mx-auto px-4 sm:px-6 py-6 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-left">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">News Console</h1>
              <p className="text-slate-500 text-sm md:text-base mt-1">Manage all news and announcements.</p>
            </div>
            {!editingNews && (
              <button onClick={() => setEditingNews({})} className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                <LucideIcon><path d="M12 5v14M5 12h14" /></LucideIcon>
                Add News
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 sm:px-6">
        {error && <Alert message={error} type="error" onClose={() => setError(null)} />}
        {message && <Alert message={message} type="success" onClose={() => setMessage(null)} />}
        {editingNews ? (
          <NewsForm
            news={{
              ...editingNews,
              resources: editingNews.resources || editingNews.news_resources || [],
            }}
            onSubmit={handleFormSubmit}
            onCancel={() => setEditingNews(null)}
            isSaving={isSaving}
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <PageLoader message="Syncing records..." />
            ) : newsList.length > 0 ? (
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
                <table className="w-full text-left border-collapse min-w-175">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Title</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Order</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Image</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {newsList.map((news) => (
                      <tr key={news.news_id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-5">
                          <p className="font-bold text-slate-800 text-sm md:text-base group-hover:text-indigo-600 transition-colors">{news.title}</p>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter mt-0.5">{news.news_date}</p>
                        </td>
                        <td className="px-6 py-5">{news.news_date}</td>
                        <td className="px-6 py-5 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
                            {news.display_order || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          {news.image_url ? (
                            <img src={news.image_url.startsWith('http') ? news.image_url : `${SERVER_ROOT_URL}${news.image_url}`} alt="News" className="w-16 h-16 object-cover rounded-lg border border-slate-200" />
                          ) : (
                            <span className="text-slate-400 text-xs">No Image</span>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(news)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Edit">
                              <LucideIcon><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></LucideIcon>
                            </button>
                            <button onClick={() => handleDelete(news.news_id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete">
                              <LucideIcon><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></LucideIcon>
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
                <div className="text-5xl md:text-6xl mb-4 grayscale opacity-50">📰</div>
                <h3 className="text-lg md:text-xl font-bold text-slate-800">No news found</h3>
                <p className="text-slate-400 text-sm mt-1">No news records were found in the database.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
