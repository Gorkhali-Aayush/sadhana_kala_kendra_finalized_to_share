const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface Artist {
  artist_id?: number;
  id?: number;
  full_name: string;
  name?: string;
  slug?: string;
  bio?: string;
  description?: string;
  profile_image?: string;
  stage_name?: string;
  display_order?: number;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

export async function getArtists() {
  const res = await fetch(`${API_BASE}/api/artists`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch artists');
  return res.json();
}

export async function getArtistBySlug(slug: string) {
  const res = await fetch(`${API_BASE}/api/artists/${slug}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch artist');
  return res.json();
}

// Admin CRUD operations
export const artistsService = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/artists/`, { 
        credentials: 'include',
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch artists');
      return await response.json();
    } catch (error) {
      console.error('Error fetching artists:', error);
      throw error;
    }
  },

  getById: async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/artists/${id}`, { 
        credentials: 'include',
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch artist');
      return await response.json();
    } catch (error) {
      console.error('Error fetching artist:', error);
      throw error;
    }
  },

  create: async (data: FormData | Partial<Artist>) => {
    try {
      const isFormData = data instanceof FormData;
      const response = await fetch(`${API_BASE}/api/artists/`, {
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
      console.error('Error creating artist:', error);
      throw error;
    }
  },

  update: async (id: number, data: FormData | Partial<Artist>) => {
    try {
      const isFormData = data instanceof FormData;
      const response = await fetch(`${API_BASE}/api/artists/${id}`, {
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
      console.error('Error updating artist:', error);
      throw error;
    }
  },

  delete: async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/artists/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting artist:', error);
      throw error;
    }
  },
};
