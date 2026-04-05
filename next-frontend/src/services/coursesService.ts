const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface Course {
  id?: number;
  course_id?: number;
  title?: string;
  course_name: string;
  slug?: string;
  description: string;
  level: string;
  price: number;
  course_image?: string;
  image_url?: string;
  teacher_id?: number;
  teacher_name?: string;
  display_order?: number;
  duration_weeks?: number;
  max_students?: number;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

export async function getCourses() {
  const res = await fetch(`${API_BASE}/api/courses`, { 
    cache: 'no-store' // Always fetch fresh course data with offers
  });
  if (!res.ok) throw new Error('Failed to fetch courses');
  return res.json();
}

export async function getCourseBySlug(slug: string) {
  const res = await fetch(`${API_BASE}/api/courses/${slug}`, { 
    cache: 'no-store' // Always fetch fresh offers data
  });
  if (!res.ok) throw new Error('Failed to fetch course');
  return res.json();
}

// Admin CRUD operations
export const coursesService = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/courses`, { 
        credentials: 'include',
        cache: 'no-store' // Always fetch fresh data for admin panel
      });
      if (!response.ok) throw new Error('Failed to fetch courses');
      return await response.json();
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  getById: async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/courses/${id}`, { 
        credentials: 'include',
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch course');
      return await response.json();
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  },

  create: async (data: FormData | Partial<Course>) => {
    try {
      const isFormData = data instanceof FormData;
      const response = await fetch(`${API_BASE}/api/courses`, {
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
      console.error('Error creating course:', error);
      throw error;
    }
  },

  update: async (id: number, data: FormData | Partial<Course>) => {
    try {
      const isFormData = data instanceof FormData;
      const response = await fetch(`${API_BASE}/api/courses/${id}`, {
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
      console.error('Error updating course:', error);
      throw error;
    }
  },

  delete: async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/courses/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  },
};
