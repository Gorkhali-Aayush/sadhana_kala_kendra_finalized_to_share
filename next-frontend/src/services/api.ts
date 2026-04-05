import { API_CONFIG } from '../config/api';

// Re-export for backward compatibility - derived from validated config
export const API_BASE_URL = API_CONFIG.BASE_URL;
export const SERVER_ROOT_URL = API_CONFIG.BASE_URL;

// API service types and utilities
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_CONFIG.BASE_URL) {
    this.baseURL = baseURL;
  }

  private getHeaders(includeCredentials = true): RequestInit {
    return {
      credentials: includeCredentials ? 'include' : 'omit',
      cache: 'no-store', // Always fetch fresh data for admin operations
    };
  }

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${path}`, this.getHeaders());
    if (!response.ok) {
      throw this.handleError(response);
    }
    return response.json();
  }

  async post<T>(path: string, data?: any): Promise<T> {
    const options: RequestInit = {
      ...this.getHeaders(),
      method: 'POST',
    };

    if (data instanceof FormData) {
      options.body = data;
    } else if (data) {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseURL}${path}`, options);
    if (!response.ok) {
      throw this.handleError(response);
    }
    return response.json();
  }

  async put<T>(path: string, data?: any): Promise<T> {
    const options: RequestInit = {
      ...this.getHeaders(),
      method: 'PUT',
    };

    if (data instanceof FormData) {
      options.body = data;
    } else if (data) {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseURL}${path}`, options);
    if (!response.ok) {
      throw this.handleError(response);
    }
    return response.json();
  }

  async delete<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${path}`, {
      ...this.getHeaders(),
      method: 'DELETE',
    });
    if (!response.ok) {
      throw this.handleError(response);
    }
    return response.json();
  }

  private handleError(response: Response): ApiError {
    const error: ApiError = {
      message: `HTTP ${response.status}: ${response.statusText}`,
      status: response.status,
    };

    if (response.status === 401 || response.status === 403) {
      error.code = 'UNAUTHORIZED';
      error.message = 'You are not authorized. Please login again.';
    }

    return error;
  }
}

export const apiClient = new ApiService();
