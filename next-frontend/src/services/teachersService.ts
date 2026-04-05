const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// Helper function to generate slug from full name
export function generateTeacherSlug(fullName: string): string {
  return fullName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export interface Teacher {
  teacher_id?: number;
  full_name: string;
  specialization: string;
  description?: string;
  profile_image?: string;
  display_order?: number;
}

export async function getTeachers() {
  const res = await fetch(`${API_BASE}/api/teachers`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch teachers');
  return res.json();
}

export async function getTeacherBySlug(slug: string) {
  const res = await fetch(`${API_BASE}/api/teachers/${slug}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch teacher');
  return res.json();
}

// Admin CRUD operations
export const teachersService = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/teachers`, { 
        credentials: 'include',
        cache: 'no-store' // Always fetch fresh data for admin panel
      });
      if (!response.ok) throw new Error('Failed to fetch teachers');
      return await response.json();
    } catch (error) {
      console.error('Error fetching teachers:', error);
      throw error;
    }
  },

  getById: async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/teachers/${id}`, { 
        credentials: 'include',
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch teacher');
      return await response.json();
    } catch (error) {
      console.error('Error fetching teacher:', error);
      throw error;
    }
  },

  create: async (data: FormData | Partial<Teacher>) => {
    try {
      const isFormData = data instanceof FormData;
      const response = await fetch(`${API_BASE}/api/teachers`, {
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
      console.error('Error creating teacher:', error);
      throw error;
    }
  },

  update: async (id: number, data: FormData | Partial<Teacher>) => {
    try {
      const isFormData = data instanceof FormData;
      const response = await fetch(`${API_BASE}/api/teachers/${id}`, {
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
      console.error('Error updating teacher:', error);
      throw error;
    }
  },

  delete: async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/teachers/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      throw error;
    }
  },
};
