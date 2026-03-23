/* BWF Admin — API Client for Next.js
   Uses relative /api/* paths — Next.js rewrites proxy to Express on port 5000 */

const BASE = '';

// ── Token Manager (localStorage) ──────────────────────
export const TokenManager = {
  get: () => typeof window !== 'undefined' ? localStorage.getItem('bwf_token') : null,
  set: (t) => localStorage.setItem('bwf_token', t),
  clear: () => localStorage.removeItem('bwf_token'),
  getUser: () => {
    if (typeof window === 'undefined') return null;
    try { return JSON.parse(localStorage.getItem('bwf_user')); } catch { return null; }
  },
  setUser: (u) => localStorage.setItem('bwf_user', JSON.stringify(u)),
  clearUser: () => localStorage.removeItem('bwf_user'),
  clearAll: () => { TokenManager.clear(); TokenManager.clearUser(); }
};

// ── Base fetch ─────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = TokenManager.get();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ── Auth ───────────────────────────────────────────────
export const AuthAPI = {
  login: (email, password) =>
    apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
};

// ── Admin API ──────────────────────────────────────────
export const AdminAPI = {
  overview:   () => apiFetch('/api/admin/overview'),
  welfare:    () => apiFetch('/api/admin/welfare'),
  compliance: () => apiFetch('/api/admin/compliance'),
  risk:       () => apiFetch('/api/admin/risk'),
  finance:    () => apiFetch('/api/admin/finance'),
  staff:      () => apiFetch('/api/admin/staff'),
  donors:     () => apiFetch('/api/admin/donors'),
  recordConsent: (studentId, method) =>
    apiFetch(`/api/admin/compliance/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify({ verificationMethod: method, action: 'Consent verified by admin' })
    }),
  addExpense: (data) =>
    apiFetch('/api/admin/expenses', { method: 'POST', body: JSON.stringify(data) }),
  approveExpense: (id, status) =>
    apiFetch(`/api/admin/expenses/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
  addDonor: (data) =>
    apiFetch('/api/admin/donors', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Posts (for media page) ─────────────────────────────
export const PostsAPI = {
  pending: () => apiFetch('/api/posts/pending'),
  approved: () => apiFetch('/api/posts?status=approved'),
  review: (id, action, hallOfFame = false, reviewNote = '') =>
    apiFetch(`/api/posts/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify({ action, hallOfFame, reviewNote })
    }),
};

// ── Helpers ────────────────────────────────────────────
export function formatINR(n) {
  if (!n) return '₹0';
  return '₹' + Number(n).toLocaleString('en-IN');
}

export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'Just now';
}
