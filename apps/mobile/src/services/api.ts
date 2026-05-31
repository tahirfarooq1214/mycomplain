import { Platform } from 'react-native';

const getApiBase = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000/api';
  }
  // For native dev, use your local IP
  return 'http://192.168.1.100:3000/api';
};

const API_BASE = getApiBase();

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await response.json();

    if (!response.ok) {
      return { success: false, error: json.error || 'Request failed' };
    }

    return json;
  } catch (error) {
    return { success: false, error: 'Network error. Please check your connection.' };
  }
}

// ── AUTH ────────────────────────────────────────────────────────

export const auth = {
  sendOtp: (phone: string) =>
    request('/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) }),

  verifyOtp: (phone: string, otp: string) =>
    request<{ token: string; user: any; isNewUser: boolean }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    }),
};

// ── USER ────────────────────────────────────────────────────────

export const users = {
  getProfile: () => request<any>('/users/profile'),

  updateProfile: (data: any) =>
    request<any>('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),

  updateFcmToken: (token: string) =>
    request('/users/fcm-token', { method: 'PUT', body: JSON.stringify({ token }) }),
};

// ── BRANDS ──────────────────────────────────────────────────────

export const brands = {
  getAll: () => request<any[]>('/brands'),
  getById: (id: string) => request<any>(`/brands/${id}`),
  search: (query: string) => request<any[]>(`/brands/search/${query}`),
};

// ── CATEGORIES ──────────────────────────────────────────────────

export const categories = {
  getAll: () => request<any[]>('/categories'),
  getBrands: (categoryId: string) => request<any[]>(`/categories/${categoryId}/brands`),
};

// ── APPLIANCES ──────────────────────────────────────────────────

export const appliances = {
  getAll: () => request<any[]>('/appliances'),
  create: (data: any) =>
    request<any>('/appliances', { method: 'POST', body: JSON.stringify(data) }),
  remove: (id: string) => request(`/appliances/${id}`, { method: 'DELETE' }),
};

// ── COMPLAINTS ──────────────────────────────────────────────────

export const complaints = {
  create: (data: any) =>
    request<any>('/complaints', { method: 'POST', body: JSON.stringify(data) }),

  getAll: (params?: { status?: string; serviceType?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.serviceType) query.set('serviceType', params.serviceType);
    if (params?.page) query.set('page', params.page.toString());
    return request<any[]>(`/complaints?${query.toString()}`);
  },

  getById: (id: string) => request<any>(`/complaints/${id}`),

  rate: (id: string, rating: number, review?: string) =>
    request(`/complaints/${id}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, review }),
    }),

  escalate: (id: string) =>
    request(`/complaints/${id}/escalate`, { method: 'POST' }),

  approveQuote: (id: string, approved: boolean) =>
    request(`/complaints/${id}/approve-quote`, {
      method: 'POST',
      body: JSON.stringify({ approved }),
    }),

  uploadMedia: async (
    complaintId: string,
    files: { uri: string; name: string; type: string }[]
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);
    });

    try {
      const response = await fetch(`${API_BASE}/upload/complaint/${complaintId}/media`, {
        method: 'POST',
        headers: {
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: formData,
      });
      return await response.json();
    } catch {
      return { success: false, error: 'Failed to upload images' };
    }
  },
};

// ── DIRECTORY ────────────────────────────────────────────────────

export const directory = {
  getAll: () => request<any[]>('/directory'),
};

// ── MEDIA URL HELPER ─────────────────────────────────────────────

export function getMediaUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const base = Platform.OS === 'web' ? 'http://localhost:3000' : 'http://192.168.1.100:3000';
  return `${base}${path}`;
}
