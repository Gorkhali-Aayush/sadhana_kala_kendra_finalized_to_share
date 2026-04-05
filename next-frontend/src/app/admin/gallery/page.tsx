'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { galleryService, type Gallery, type GalleryImage } from '@/services/galleryService';
import { SERVER_ROOT_URL } from '@/services/api';
import { CollectionForm, type CollectionFormData } from '@/components/admin/forms/CollectionForm';
import { ImageForm, type ImageFormData } from '@/components/admin/forms/ImageForm';
import AlertMessage from '@/components/admin/AlertMessage';
import OrderConflictDialog from '@/components/admin/OrderConflictDialog';
import PageLoader from '@/components/PageLoader';

type ViewMode = 'collections' | 'create-collection' | 'edit-collection' | 'manage-images';

interface OrderConflict {
  warning: string;
  suggestion: string;
  nextAvailable: number;
}

// ============== Main Admin Gallery Page ==============
export default function AdminGalleryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('collections');
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [showImageForm, setShowImageForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [orderConflict, setOrderConflict] = useState<OrderConflict | null>(null);
  const [pendingFormData, setPendingFormData] = useState<any>(null);

  // Fetch all galleries
  const fetchGalleries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await galleryService.getAll();
      setGalleries(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load galleries.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch images for selected gallery
  const fetchImages = useCallback(async (galleryId: number) => {
    try {
      const data = await galleryService.getById(galleryId);
      if (data && data.images) {
        setImages(data.images);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load images.');
    }
  }, []);

  useEffect(() => {
    fetchGalleries();
  }, [fetchGalleries]);

  // Auto-dismiss notifications
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

  // Handle collection form submission
  const handleCollectionSubmit = async (formData: CollectionFormData) => {
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      if (formData.display_order) {
        uploadFormData.append('display_order', String(formData.display_order));
      }
      if (formData.thumbnail_file) {
        uploadFormData.append('image_file', formData.thumbnail_file);
      }

      if (selectedGallery && selectedGallery.gallery_id) {
        await galleryService.update(selectedGallery.gallery_id, uploadFormData);
        setMessage('Gallery collection updated successfully.');
      } else {
        await galleryService.create(uploadFormData);
        setMessage('Gallery collection created successfully.');
      }

      setViewMode('collections');
      setSelectedGallery(null);
      setOrderConflict(null);
      setPendingFormData(null);
      await fetchGalleries();
    } catch (err: any) {
      if (err?.response?.status === 409 && err?.response?.data?.warning) {
        setOrderConflict(err.response.data);
        setPendingFormData(formData);
        setIsSaving(false);
        return;
      }
      setError(err?.message || 'Failed to save gallery collection.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle image form submission
  const handleImageSubmit = async (formData: ImageFormData) => {
    if (!selectedGallery || !selectedGallery.gallery_id) return;

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const uploadFormData = new FormData();
      if (formData.display_order) {
        uploadFormData.append('display_order', String(formData.display_order));
      }
      uploadFormData.append('image_file', formData.image_file!);

      if (editingImage && editingImage.image_id) {
        await galleryService.updateImage(editingImage.image_id, uploadFormData);
        setMessage('Image updated successfully.');
      } else {
        await galleryService.addImage(selectedGallery.gallery_id, uploadFormData);
        setMessage('Image added successfully.');
      }

      setEditingImage(null);
      setShowImageForm(false);
      await fetchImages(selectedGallery.gallery_id);
    } catch (err: any) {
      setError(err?.message || 'Failed to save image.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle order conflict resolution
  const handleResolveConflict = async (newOrder: number | string) => {
    if (!pendingFormData) return;

    setIsSaving(true);
    setOrderConflict(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('title', pendingFormData.title);
      uploadFormData.append('description', pendingFormData.description);
      uploadFormData.append('display_order', String(newOrder));
      if (pendingFormData.thumbnail_file) {
        uploadFormData.append('image_file', pendingFormData.thumbnail_file);
      }

      if (selectedGallery && selectedGallery.gallery_id) {
        await galleryService.update(selectedGallery.gallery_id, uploadFormData);
        setMessage('Gallery collection updated successfully.');
      } else {
        await galleryService.create(uploadFormData);
        setMessage('Gallery collection created successfully.');
      }

      setViewMode('collections');
      setSelectedGallery(null);
      setPendingFormData(null);
      await fetchGalleries();
    } catch (err: any) {
      setError(err?.message || 'Operation failed.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete collection
  const handleDeleteCollection = async (galleryId: number) => {
    if (!window.confirm('Delete this gallery collection and all its images?')) return;

    try {
      await galleryService.delete(galleryId);
      setMessage('Gallery collection deleted successfully.');
      await fetchGalleries();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete collection.');
    }
  };

  // Delete image
  const handleDeleteImage = async (imageId: number) => {
    if (!window.confirm('Delete this image?')) return;

    try {
      await galleryService.deleteImage(imageId);
      setMessage('Image deleted successfully.');
      if (selectedGallery && selectedGallery.gallery_id) {
        await fetchImages(selectedGallery.gallery_id);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to delete image.');
    }
  };

  // ============== Collections List View ==============
  if (viewMode === 'collections') {
    return (
      <div className="min-h-screen bg-[#f8fafc] pb-12">
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
          <div className="container mx-auto px-6 py-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Gallery Collections</h1>
              <p className="text-slate-500">Manage gallery collections and images</p>
            </div>
            <button
              onClick={() => {
                setSelectedGallery(null);
                setViewMode('create-collection');
              }}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold"
            >
              Create Collection
            </button>
          </div>
        </div>

        <div className="container mx-auto px-6">
          {error ? <AlertMessage message={error} type="error" onClose={() => setError(null)} /> : null}
          {message ? <AlertMessage message={message} type="success" onClose={() => setMessage(null)} /> : null}

          {loading ? (
            <PageLoader message="Loading galleries..." />
          ) : galleries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">
              No gallery collections yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleries.map(gallery => (
                <div key={gallery.gallery_id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <img
                    src={`${SERVER_ROOT_URL}${gallery.thumbnail_image_url}`}
                    alt={gallery.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="font-bold text-slate-800 flex-1">{gallery.title}</h3>
                      {gallery.display_order && (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs shrink-0">
                          {gallery.display_order}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-2">{gallery.description}</p>
                    <p className="text-xs text-slate-500 font-semibold mb-4">
                      {gallery.image_count || 0} image{gallery.image_count !== 1 ? 's' : ''}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedGallery(gallery);
                          setViewMode('manage-images');
                          if (gallery.gallery_id) fetchImages(gallery.gallery_id);
                        }}
                        className="flex-1 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold"
                      >
                        Manage Images
                      </button>
                      <button
                        onClick={() => {
                          setSelectedGallery(gallery);
                          setViewMode('edit-collection');
                        }}
                        className="px-3 py-2 rounded-lg border border-slate-300 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => gallery.gallery_id && handleDeleteCollection(gallery.gallery_id)}
                        className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============== Create/Edit Collection View ==============
  if (viewMode === 'create-collection' || viewMode === 'edit-collection') {
    return (
      <div className="min-h-screen bg-[#f8fafc] pb-12">
        <div className="bg-white border-b border-slate-200 mb-8">
          <div className="container mx-auto px-6 py-8">
            <button
              onClick={() => {
                setViewMode('collections');
                setSelectedGallery(null);
              }}
              className="text-sm text-indigo-600 font-semibold mb-4"
            >
              ← Back to Collections
            </button>
          </div>
        </div>

        <div className="container mx-auto px-6 max-w-2xl">
          {error ? <AlertMessage message={error} type="error" onClose={() => setError(null)} /> : null}
          {message ? <AlertMessage message={message} type="success" onClose={() => setMessage(null)} /> : null}

          <CollectionForm
            gallery={selectedGallery}
            onSubmit={handleCollectionSubmit}
            onCancel={() => {
              setViewMode('collections');
              setSelectedGallery(null);
            }}
            isSaving={isSaving}
          />
        </div>
      </div>
    );
  }

  // ============== Manage Images View ==============
  if (viewMode === 'manage-images' && selectedGallery) {
    return (
      <div className="min-h-screen bg-[#f8fafc] pb-12">
        <div className="bg-white border-b border-slate-200 mb-8">
          <div className="container mx-auto px-6 py-8 flex items-center justify-between">
            <div>
              <button
                onClick={() => {
                  setViewMode('collections');
                  setSelectedGallery(null);
                  setEditingImage(null);
                  setShowImageForm(false);
                }}
                className="text-sm text-indigo-600 font-semibold mb-2"
              >
                ← Back to Collections
              </button>
              <h1 className="text-3xl font-black text-slate-900">{selectedGallery.title}</h1>
              <p className="text-slate-500">Manage images in this collection</p>
            </div>
            {!showImageForm ? (
              <button
                onClick={() => {
                  setEditingImage(null);
                  setShowImageForm(true);
                }}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold"
              >
                Add Image
              </button>
            ) : null}
          </div>
        </div>

        <div className="container mx-auto px-6">
          {error ? <AlertMessage message={error} type="error" onClose={() => setError(null)} /> : null}
          {message ? <AlertMessage message={message} type="success" onClose={() => setMessage(null)} /> : null}

          {showImageForm ? (
            <div className="max-w-2xl">
              <ImageForm
                image={editingImage}
                onSubmit={handleImageSubmit}
                onCancel={() => {
                  setEditingImage(null);
                  setShowImageForm(false);
                }}
                isSaving={isSaving}
              />
            </div>
          ) : loading ? (
            <PageLoader message="Loading images..." />
          ) : images.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">
              No images in this collection yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map(image => (
                <div key={image.image_id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <img
                    src={`${SERVER_ROOT_URL}${image.image_url}`}
                    alt="Gallery Image"
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-slate-800 line-clamp-2 mb-1">Image #{image.image_id}</h3>
                    {image.display_order && (
                      <p className="text-xs text-slate-500 mb-3">Order: {image.display_order}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingImage(image);
                          setShowImageForm(true);
                        }}
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => image.image_id && handleDeleteImage(image.image_id)}
                        className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
