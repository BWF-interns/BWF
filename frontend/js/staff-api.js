/* ═══════════════════════════════════════════════════
   BWF Staff Portal — Shared API Client & Auth Guards
   ═══════════════════════════════════════════════════ */

// ── Token Manager ──────────────────────────────────
const StaffTokenManager = {
    get: () => localStorage.getItem('bwf_token'),
    set: (t) => localStorage.setItem('bwf_token', t),
    clear: () => localStorage.removeItem('bwf_token'),
    getUser: () => { try { return JSON.parse(localStorage.getItem('bwf_user')); } catch { return null; } },
    setUser: (u) => localStorage.setItem('bwf_user', JSON.stringify(u)),
    clearUser: () => localStorage.removeItem('bwf_user'),
};

// ── API Base ────────────────────────────────────────
async function staffFetch(url, options = {}) {
    const token = StaffTokenManager.get();
    const res = await fetch(url, {
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

// ── Auth Guards ─────────────────────────────────────
function requireHousemother() {
    const token = StaffTokenManager.get();
    const user = StaffTokenManager.getUser();
    if (!token || !user) { window.location.href = '/'; return false; }
    if (!['housemother', 'admin', 'dean', 'founder'].includes(user.role)) {
        StaffTokenManager.clear(); StaffTokenManager.clearUser();
        window.location.href = '/'; return false;
    }
    return true;
}
function requireDean() {
    const token = StaffTokenManager.get();
    const user = StaffTokenManager.getUser();
    if (!token || !user) { window.location.href = '/'; return false; }
    if (!['admin', 'dean', 'founder'].includes(user.role)) {
        StaffTokenManager.clear(); StaffTokenManager.clearUser();
        window.location.href = '/'; return false;
    }
    return true;
}

// ── Sidebar Init ────────────────────────────────────
function initStaffSidebar() {
    const user = StaffTokenManager.getUser();
    if (!user) return;
    const nameEl = document.getElementById('sb-staff-name');
    const roleEl = document.getElementById('sb-staff-role');
    const avatarEl = document.getElementById('sb-staff-avatar');
    const roleLabels = { housemother: 'Housemother', dean: 'Warden / Dean', admin: 'Administrator', founder: 'Founder' };
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = roleLabels[user.role] || user.role;
    if (avatarEl) avatarEl.textContent = user.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

    // Mobile hamburger
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('open');
        });
        overlay?.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
        });
    }
}

function staffLogout() {
    StaffTokenManager.clear();
    StaffTokenManager.clearUser();
    window.location.href = '/';
}

// ── Toast Notifications ─────────────────────────────
function showStaffToast(title, message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    toast.innerHTML = `<span style="font-size:18px">${icons[type] || '📢'}</span><div><div style="font-size:14px;font-weight:600;color:#f1f5f9">${title}</div><div style="font-size:12px;color:#94a3b8;margin-top:2px">${message}</div></div>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function getInitialsStaff(name = '') {
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

// ── Staff API ────────────────────────────────────────
const StaffAPI = {
    stats: () => staffFetch('/api/staff/stats'),
    analytics: () => staffFetch('/api/staff/analytics'),
    notify: (body) => staffFetch('/api/staff/notify', { method: 'POST', body: JSON.stringify(body) }),
};

const StaffStudentsAPI = {
    list: (params = {}) => staffFetch('/api/students?' + new URLSearchParams(params)),
    get: (id) => staffFetch(`/api/students/${id}`),
    update: (id, data) => staffFetch(`/api/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    add: (data) => staffFetch('/api/students', { method: 'POST', body: JSON.stringify(data) }),
};

const StaffRequestsAPI = {
    all: (params = {}) => staffFetch('/api/requests?' + new URLSearchParams(params)),
    updateStatus: (id, status, adminNotes = '') => staffFetch(`/api/requests/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, adminNotes }) }),
};

const StaffPostsAPI = {
    pending: () => staffFetch('/api/posts/pending'),
    review: (id, action, hallOfFame = false, reviewNote = '') => staffFetch(`/api/posts/${id}/review`, { method: 'PUT', body: JSON.stringify({ action, hallOfFame, reviewNote }) }),
    approved: () => staffFetch('/api/posts?status=approved'),
};

const StaffNotificationsAPI = {
    sendToStudent: (studentId, title, message, icon = '📢') =>
        StaffAPI.notify({ studentId, title, message, icon }),
    broadcast: (title, message, icon = '📢', homeGroup = '') =>
        StaffAPI.notify({ broadcast: true, title, message, icon, homeGroup }),
};

// ── Urgency helpers ──────────────────────────────────
function urgencyBadge(u) {
    const map = { urgent: 'badge-urgent', high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };
    return `<span class="badge ${map[u] || 'badge-gray'}">${u?.toUpperCase() || '?'}</span>`;
}
function statusBadge(s) {
    const map = {
        pending: 'badge-orange', seen: 'badge-blue', in_progress: 'badge-purple',
        fulfilled: 'badge-green', rejected: 'badge-red'
    };
    const labels = { pending: '⏳ Pending', seen: '👁 Seen', in_progress: '🔄 In Progress', fulfilled: '✅ Fulfilled', rejected: '❌ Rejected' };
    return `<span class="badge ${map[s] || 'badge-gray'}">${labels[s] || s}</span>`;
}
function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24);
    if (d > 0) return `${d}d ago`; if (h > 0) return `${h}h ago`; if (m > 0) return `${m}m ago`; return 'Just now';
}

// ── Admin Auth Guard ─────────────────────────────────
function requireAdmin() {
    const token = StaffTokenManager.get();
    const user = StaffTokenManager.getUser();
    if (!token || !user) { window.location.href = '/'; return false; }
    if (!['admin', 'founder'].includes(user.role)) {
        StaffTokenManager.clear(); StaffTokenManager.clearUser();
        window.location.href = '/'; return false;
    }
    return true;
}

// ── Admin API ────────────────────────────────────────
const AdminAPI = {
    overview:    ()        => staffFetch('/api/admin/overview'),
    welfare:     ()        => staffFetch('/api/admin/welfare'),
    compliance:  ()        => staffFetch('/api/admin/compliance'),
    risk:        ()        => staffFetch('/api/admin/risk'),
    finance:     ()        => staffFetch('/api/admin/finance'),
    staff:       ()        => staffFetch('/api/admin/staff'),
    donors:      ()        => staffFetch('/api/admin/donors'),
    recordConsent: (studentId, method) =>
        staffFetch(`/api/admin/compliance/${studentId}`, { method: 'PUT', body: JSON.stringify({ verificationMethod: method, action: 'Consent verified by admin' }) }),
    addExpense:  (data)    => staffFetch('/api/admin/expenses', { method: 'POST', body: JSON.stringify(data) }),
    approveExpense: (id, status) =>
        staffFetch(`/api/admin/expenses/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
    addDonor: (data)       => staffFetch('/api/admin/donors', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Currency helper ──────────────────────────────────
function formatINR(n) {
    if (!n) return '₹0';
    return '₹' + Number(n).toLocaleString('en-IN');
}
