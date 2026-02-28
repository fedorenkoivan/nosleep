const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  status: number;
  details?: any;
  
  constructor(
    message: string,
    status: number,
    details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const isFormData = options.body instanceof FormData;

  // Get token from localStorage
  const token = localStorage.getItem('authToken');

  const headers: HeadersInit = isFormData ? {} : {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // If 401, clear token and redirect to login
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        // Only redirect if not already on auth pages
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
      }

      throw new ApiError(
        data.error || 'Something went wrong',
        response.status,
        data.details
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error', 0, error);
  }
}

export const api = {
  // Authentication
  auth: {
    register: (data: {
      name: string;
      email: string;
      password: string;
    }): Promise<{
      message: string;
      user: { id: number; name: string; email: string };
      token: string;
    }> =>
      fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    login: (data: {
      email: string;
      password: string;
    }): Promise<{
      message: string;
      user: { id: number; name: string; email: string };
      token: string;
    }> =>
      fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    me: (): Promise<{
      user: { id: number; name: string; email: string; created_at: string };
    }> =>
      fetchApi('/auth/me'),

    logout: () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    },
  },

  // Tax calculation
  calculateTax: (data: {
    subtotal: number;
    longitude: number;
    latitude: number;
  }) =>
    fetchApi('/calculate-tax', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Location
  getLocation: (longitude: number, latitude: number) =>
    fetchApi(`/location?longitude=${longitude}&latitude=${latitude}`),

  // Orders
  orders: {
    create: (data: {
      subtotal: number;
      longitude: number;
      latitude: number;
    }) =>
      fetchApi('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    list: (params?: {
      page?: number;
      limit?: number;
      status?: string;
      from_date?: string;
      to_date?: string;
    }) => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }
      const queryString = queryParams.toString();
      return fetchApi(`/orders${queryString ? `?${queryString}` : ''}`);
    },

    import: (file: File): Promise<{
      message: string;
      imported: number;
      failed: number;
      errors: { id: string; reason: string }[];
      orders: { id: string; order_id: number }[];
    }> => {
      // Get user_id from localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        return Promise.reject(new Error('User not authenticated. Please log in.'));
      }
      
      const user = JSON.parse(userStr);
      if (!user.id) {
        return Promise.reject(new Error('User ID not found. Please log in again.'));
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', user.id.toString());

      return fetchApi('/orders/import', {
        method: 'POST',
        body: formData,
      });
    },
  },
};
