const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface Offer {
  offer_id?: number;
  id?: number;
  course_id?: number;
  title: string;
  slug?: string;
  subtitle?: string;
  description: string;
  discount_percentage?: number;
  discount_type?: 'percentage' | 'fixed';
  image_url?: string;
  image?: string;
  valid_from?: string;
  valid_to?: string;
  valid_until?: string;
  display_order?: number;
  is_active?: number;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

export async function getPublicOffers() {
  const res = await fetch(`${API_BASE}/api/offers`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch offers');
  return res.json();
}

export async function getOfferBySlug(slug: string) {
  const res = await fetch(`${API_BASE}/api/offers/${slug}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch offer');
  return res.json();
}

export async function getOffersByCourse(courseId: number) {
  const res = await fetch(`${API_BASE}/api/offers/course/${courseId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch course offers');
  return res.json();
}

// Admin CRUD operations
export const offersService = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/offers/admin/all`, { 
        credentials: 'include',
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch offers');
      return await response.json();
    } catch (error) {
      console.error('Error fetching offers:', error);
      throw error;
    }
  },

  getById: async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/offers/${id}`, { 
        credentials: 'include',
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch offer');
      return await response.json();
    } catch (error) {
      console.error('Error fetching offer:', error);
      throw error;
    }
  },

  create: async (data: FormData | Partial<Offer>) => {
    try {
      const isFormData = data instanceof FormData;
      const response = await fetch(`${API_BASE}/api/offers/`, {
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
      console.error('Error creating offer:', error);
      throw error;
    }
  },

  update: async (id: number, data: FormData | Partial<Offer>) => {
    try {
      const isFormData = data instanceof FormData;
      const response = await fetch(`${API_BASE}/api/offers/${id}`, {
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
      console.error('Error updating offer:', error);
      throw error;
    }
  },

  delete: async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/offers/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting offer:', error);
      throw error;
    }
  },
};
