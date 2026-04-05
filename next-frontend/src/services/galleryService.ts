const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface GalleryImage {
  image_id?: number;
  gallery_id?: number;
  image_url: string;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Gallery {
  gallery_id?: number;
  id?: number;
  title: string;
  slug?: string;
  description?: string;
  thumbnail_image_url?: string;
  display_order?: number;
  image_count?: number;
  images?: GalleryImage[];
  created_at?: string;
  updated_at?: string;
}

// Get all gallery collections with their images
export async function getAllGalleryItems() {
  try {
    console.log('[Gallery Service] Fetching galleries from:', `${API_BASE}/api/gallery`);
    const res = await fetch(`${API_BASE}/api/gallery`, { next: { revalidate: 3600 } });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch gallery: ${res.status} ${res.statusText}`);
    }
    
    const galleries: Gallery[] = await res.json();
    console.log('[Gallery Service] Fetched', galleries.length, 'galleries');
    
    // Fetch images for each gallery
    const galleriesWithImages = await Promise.all(
      galleries.map(async (gallery) => {
        try {
          const imageRes = await fetch(`${API_BASE}/api/gallery/${gallery.gallery_id}/images`, {
            next: { revalidate: 3600 }
          });
          if (imageRes.ok) {
            const images = await imageRes.json();
            console.log(`[Gallery Service] Fetched ${images.length} images for gallery ${gallery.gallery_id}`);
            return { ...gallery, images };
          }
          return gallery;
        } catch (err) {
          console.error(`Failed to fetch images for gallery ${gallery.gallery_id}:`, err);
          return gallery;
        }
      })
    );
    
    console.log('[Gallery Service] Returning galleries with images');
    return galleriesWithImages;
  } catch (error) {
    console.error('[Gallery Service] Error fetching galleries:', error);
    throw error;
  }
}

// Get gallery collection by ID with all images
export async function getGalleryItemBySlug(idOrSlug: string) {
  const res = await fetch(`${API_BASE}/api/gallery/${idOrSlug}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch gallery');
  return res.json();
}

// Admin CRUD operations
export const galleryService = {
  // Gallery Collections
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/gallery/`, { 
        credentials: 'include',
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch galleries');
      return await response.json();
    } catch (error) {
      console.error('Error fetching galleries:', error);
      throw error;
    }
  },

  getById: async (id: number) => {
    try {
      const url = `${API_BASE}/api/gallery/${id}`;
      console.log('[Gallery Service] Fetching gallery by ID from:', url);
      const response = await fetch(url, { 
        credentials: 'include',
        cache: 'no-store'
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Gallery Service] Failed to fetch gallery - Status: ${response.status}, Response: ${errorText}`);
        throw new Error(`Failed to fetch gallery (Status: ${response.status})`);
      }
      const data = await response.json();
      console.log('[Gallery Service] Successfully fetched gallery:', data);
      return data;
    } catch (error) {
      console.error('[Gallery Service] Error fetching gallery:', error);
      throw error;
    }
  },

  create: async (data: FormData | Partial<Gallery>) => {
    try {
      const isFormData = data instanceof FormData;
      const response = await fetch(`${API_BASE}/api/gallery`, {
        method: 'POST',
        ...(isFormData ? {} : { headers: { 'Content-Type': 'application/json' } }),
        credentials: 'include',
        body: isFormData ? data : JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating gallery:', error);
      throw error;
    }
  },

  update: async (id: number, data: FormData | Partial<Gallery>) => {
    try {
      const isFormData = data instanceof FormData;
      const response = await fetch(`${API_BASE}/api/gallery/${id}`, {
        method: 'PUT',
        ...(isFormData ? {} : { headers: { 'Content-Type': 'application/json' } }),
        credentials: 'include',
        body: isFormData ? data : JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating gallery:', error);
      throw error;
    }
  },

  delete: async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/gallery/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete gallery');
      return await response.json();
    } catch (error) {
      console.error('Error deleting gallery:', error);
      throw error;
    }
  },

  // Gallery Images
  addImage: async (galleryId: number, data: FormData) => {
    try {
      const response = await fetch(`${API_BASE}/api/gallery/${galleryId}/images`, {
        method: 'POST',
        credentials: 'include',
        body: data,
      });
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      return await response.json();
    } catch (error) {
      console.error('Error adding image to gallery:', error);
      throw error;
    }
  },

  getGalleryImages: async (galleryId: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/gallery/${galleryId}/images`, {
        credentials: 'include',
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch gallery images');
      return await response.json();
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      throw error;
    }
  },

  updateImage: async (imageId: number, data: FormData | Partial<GalleryImage>) => {
    try {
      const isFormData = data instanceof FormData;
      const response = await fetch(`${API_BASE}/api/gallery/images/${imageId}`, {
        method: 'PUT',
        ...(isFormData ? {} : { headers: { 'Content-Type': 'application/json' } }),
        credentials: 'include',
        body: isFormData ? data : JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating image:', error);
      throw error;
    }
  },

  deleteImage: async (imageId: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/gallery/images/${imageId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete image');
      return await response.json();
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  },
};
