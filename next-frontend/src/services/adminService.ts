const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface AdminResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// Generic CRUD operations
export const adminAPI = {
  // Fetch all items
  getAll: async <T,>(endpoint: string): Promise<AdminResponse<T[]>> => {
    try {
      const response = await fetch(`${API_BASE}/api/server/${endpoint}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('Failed to fetch');
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  },

  // Fetch single item
  getById: async <T,>(endpoint: string, id: string): Promise<AdminResponse<T>> => {
    try {
      const response = await fetch(`${API_BASE}/api/server/${endpoint}/${id}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('Failed to fetch');
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}/${id}:`, error);
      throw error;
    }
  },

  // Create new item (supports both JSON and FormData)
  create: async <T,>(
    endpoint: string,
    data: Record<string, any> | FormData
  ): Promise<AdminResponse<T>> => {
    try {
      const isFormData = data instanceof FormData;
      const response = await fetch(`${API_BASE}/api/server/${endpoint}`, {
        method: 'POST',
        ...(isFormData ? {} : { headers: { 'Content-Type': 'application/json' } }),
        credentials: 'include',
        body: isFormData ? data : JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create');
      return await response.json();
    } catch (error) {
      console.error(`Error creating ${endpoint}:`, error);
      throw error;
    }
  },

  // Update item (supports both JSON and FormData)
  update: async <T,>(
    endpoint: string,
    id: string,
    data: Record<string, any> | FormData
  ): Promise<AdminResponse<T>> => {
    try {
      const isFormData = data instanceof FormData;
      const response = await fetch(`${API_BASE}/api/server/${endpoint}/${id}`, {
        method: 'PUT',
        ...(isFormData ? {} : { headers: { 'Content-Type': 'application/json' } }),
        credentials: 'include',
        body: isFormData ? data : JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update');
      return await response.json();
    } catch (error) {
      console.error(`Error updating ${endpoint}/${id}:`, error);
      throw error;
    }
  },

  // Delete item
  delete: async (endpoint: string, id: string): Promise<AdminResponse<null>> => {
    try {
      const response = await fetch(`${API_BASE}/api/server/${endpoint}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete');
      return await response.json();
    } catch (error) {
      console.error(`Error deleting ${endpoint}/${id}:`, error);
      throw error;
    }
  },

  // Logout
  logout: async (): Promise<AdminResponse<null>> => {
    try {
      const response = await fetch(`${API_BASE}/api/server/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to logout');
      return await response.json();
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },
};
