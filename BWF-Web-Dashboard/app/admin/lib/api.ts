// app/admin/lib/api.ts
// Central fetch wrapper for all admin API calls.
// Automatically attaches the JWT access token from localStorage to every request.

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

function getToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('accessToken') || '';
}

export async function adminFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}/admin${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) throw new Error((data as { message?: string }).message || `Request failed: ${res.status}`);
  return data as T;
}

export const adminAPI = {
  // Overview
  getOverview: () => adminFetch<Record<string, unknown>>('/overview'),

  // Students
  getStudents: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return adminFetch<unknown[]>(`/students${q}`);
  },
  addStudent:        (body: unknown) => adminFetch('/students', { method: 'POST', body: JSON.stringify(body) }),
  updateStudent:     (id: string, body: unknown) => adminFetch(`/students/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deactivateStudent: (id: string) => adminFetch(`/students/${id}`, { method: 'DELETE' }),

  // Staff
  getStaff: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return adminFetch<unknown[]>(`/staff${q}`);
  },
  addStaff:        (body: unknown) => adminFetch('/staff', { method: 'POST', body: JSON.stringify(body) }),
  updateStaff:     (id: string, body: unknown) => adminFetch(`/staff/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deactivateStaff: (id: string) => adminFetch(`/staff/${id}`, { method: 'DELETE' }),

  // Expenses
  getExpenses: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return adminFetch<unknown[]>(`/expenses${q}`);
  },
  addExpense:    (body: unknown) => adminFetch('/expenses', { method: 'POST', body: JSON.stringify(body) }),
  updateExpense: (id: string, body: unknown) => adminFetch(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteExpense: (id: string) => adminFetch(`/expenses/${id}`, { method: 'DELETE' }),

  // Finance KPIs
  getKPIs:       (year?: number) => adminFetch<unknown[]>(`/finance/kpis${year ? '?year=' + year : ''}`),
  upsertKPI:     (body: unknown) => adminFetch('/finance/kpis', { method: 'POST', body: JSON.stringify(body) }),

  // Posts
  getPosts: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return adminFetch<unknown[]>(`/posts${q}`);
  },
  addPost:    (body: unknown) => adminFetch('/posts', { method: 'POST', body: JSON.stringify(body) }),
  reviewPost: (id: string, body: unknown) => adminFetch(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deletePost: (id: string) => adminFetch(`/posts/${id}`, { method: 'DELETE' }),

  // Audit Logs
  getAuditLogs: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return adminFetch<{ logs: unknown[]; total: number }>(`/audit-logs${q}`);
  },
};
