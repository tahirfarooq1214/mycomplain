const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

let authToken: string | null = null;

export function setToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('cms_token', token);
  } else {
    localStorage.removeItem('cms_token');
  }
}

export function getToken(): string | null {
  if (authToken) return authToken;
  if (typeof window !== 'undefined') {
    authToken = localStorage.getItem('cms_token');
  }
  return authToken;
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.error || 'Request failed' };
    return json;
  } catch {
    return { success: false, error: 'Network error' };
  }
}

// ── AUTH ──────────────────────────────────────────────────
export const auth = {
  login: (email: string, password: string) =>
    request<{ token: string; user?: any; provider?: any; type: string }>(
      '/auth/cms-login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    ),
};

// ── ADMIN / OPS DASHBOARD ────────────────────────────────
export const admin = {
  getDashboard: () => request<any>('/admin/dashboard'),

  getComplaints: (params?: Record<string, string>) => {
    const q = new URLSearchParams(params).toString();
    return request<any>(`/admin/complaints?${q}`);
  },

  getComplaint: (id: string) => request<any>(`/admin/complaints/${id}`),

  getQueue: () => request<any[]>('/admin/queue'),

  updateStatus: (id: string, status: string, notes?: string) =>
    request(`/admin/complaints/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    }),

  assignProvider: (complaintId: string, providerId: string, notes?: string) =>
    request(`/admin/complaints/${complaintId}/assign-provider`, {
      method: 'POST',
      body: JSON.stringify({ providerId, notes }),
    }),

  recordCallOutcome: (id: string, data: any) =>
    request(`/admin/complaints/${id}/call-outcome`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProviders: () => request<any[]>('/admin/providers'),

  updateProvider: (id: string, data: any) =>
    request(`/admin/providers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getBrands: () => request<any[]>('/brands'),

  updateBrand: (id: string, data: any) =>
    request(`/admin/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getAnalytics: () => request<any>('/admin/analytics'),
};

// ── SERVICE PROVIDER ─────────────────────────────────────
export const provider = {
  getComplaints: () => request<any[]>('/provider/complaints'),

  updateStatus: (id: string, status: string, notes?: string) =>
    request(`/provider/complaints/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    }),
};
