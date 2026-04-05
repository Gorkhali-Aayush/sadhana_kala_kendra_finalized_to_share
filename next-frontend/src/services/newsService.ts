const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface News {
  news_id?: number;
  id?: number;
  title: string;
  slug?: string;
  rich_content?: string;
  description?: string;
  image_url?: string;
  feature_image?: string;
  news_date?: string;
  date?: string;
  display_order?: number;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

export async function getAllNews() {
  const res = await fetch(`${API_URL}/api/news`);
  if (!res.ok) throw new Error('Failed to fetch news');
  return res.json();
}

export async function getNewsBySlug(slug: string) {
  if (!slug) throw new Error('Slug is required');
  const res = await fetch(`${API_URL}/api/news/${slug}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch news');
  return res.json();
}

export async function getNewsResources(newsId: string) {
  if (!newsId) throw new Error('News ID is required');
  const res = await fetch(`${API_URL}/api/news/${newsId}/resources`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch news resources');
  return res.json();
}

// Admin CRUD operations
export const newsService = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/api/news/`, { 
        credentials: 'include',
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch news');
      return await response.json();
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  },

  getById: async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/api/news/${id}`, { 
        credentials: 'include',
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch news');
      return await response.json();
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  },

  create: async (data: FormData | Partial<News>) => {
    try {
      const isFormData = data instanceof FormData;
      const response = await fetch(`${API_URL}/api/news/`, {
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
      console.error('Error creating news:', error);
      throw error;
    }
  },

  update: async (id: number, data: FormData | Partial<News>) => {
    try {
      const isFormData = data instanceof FormData;
      const response = await fetch(`${API_URL}/api/news/${id}`, {
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
      console.error('Error updating news:', error);
      throw error;
    }
  },

  delete: async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/api/news/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting news:', error);
      throw error;
    }
  },
};
