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

  const config: RequestInit = {
    ...options,
    headers: isFormData ? {} : {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
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
      user_id: number;
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
      user_id?: number;
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

    import: (file: File, user_id: number): Promise<{
      message: string;
      imported: number;
      failed: number;
      errors: { id: string; reason: string }[];
      orders: { id: string; order_id: number }[];
    }> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', String(user_id));

      return fetchApi('/orders/import', {
        method: 'POST',
        body: formData,
        headers: {},
      });
    },
  },
};
