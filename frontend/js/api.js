// BWF API Client — centralized fetch helper with JWT support

const API_BASE = '/api';

// ---- Token Management ----
const TokenManager = {
    get: () => localStorage.getItem('bwf_token'),
    set: (t) => localStorage.setItem('bwf_token', t),
    clear: () => localStorage.removeItem('bwf_token'),
    getUser: () => {
        try { return JSON.parse(localStorage.getItem('bwf_user') || 'null'); } catch { return null; }
    },
    setUser: (u) => localStorage.setItem('bwf_user', JSON.stringify(u)),
    clearUser: () => localStorage.removeItem('bwf_user'),
    getStudentId: () => localStorage.getItem('bwf_student_id'),
    setStudentId: (id) => localStorage.setItem('bwf_student_id', id),
};

// ---- Core Fetch ----
async function apiFetch(endpoint, options = {}) {
    const token = TokenManager.get();
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // Handle FormData (file uploads) — don't set Content-Type
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Request failed');
    }
    return data;
}

// ---- Auth API ----
const AuthAPI = {
    login: (email, password) => apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    }),
    me: () => apiFetch('/auth/me'),
    logout: () => {
        TokenManager.clear(); TokenManager.clearUser(); TokenManager.clearUser();
        window.location.href = '/';
    }
};

// ---- Students API ----
const StudentsAPI = {
    me: () => apiFetch('/students/me'),
    update: (data) => apiFetch('/students/me', { method: 'PUT', body: JSON.stringify(data) }),
};

// ---- Topics / Learning API ----
const TopicsAPI = {
    list: (category) => apiFetch(`/topics${category ? '?category=' + category : ''}`),
    get: (id) => apiFetch(`/topics/${id}`),
    getQuestions: (id) => apiFetch(`/topics/${id}/questions`),
    submitQuiz: (id, answers) => apiFetch(`/topics/${id}/submit`, {
        method: 'POST', body: JSON.stringify({ answers })
    }),
};

// ---- Leaderboard API ----
const LeaderboardAPI = {
    get: (limit = 20) => apiFetch(`/leaderboard?limit=${limit}`),
};

// ---- Requests API ----
const RequestsAPI = {
    create: (data) => apiFetch('/requests', { method: 'POST', body: JSON.stringify(data) }),
    mine: () => apiFetch('/requests/me'),
};

// ---- Tasks API ----
const TasksAPI = {
    today: () => apiFetch('/tasks'),
    complete: (id) => apiFetch(`/tasks/${id}/complete`, { method: 'POST' }),
};

// ---- Roadmap API ----
const RoadmapAPI = {
    me: () => apiFetch('/roadmap/me'),
    update: (data) => apiFetch('/roadmap/me', { method: 'PUT', body: JSON.stringify(data) }),
    toggleMilestone: (milestoneId) => apiFetch(`/roadmap/me/milestone/${milestoneId}/toggle`, { method: 'PUT' }),
};

// ---- Posts API ----
const PostsAPI = {
    create: (formData) => apiFetch('/posts', { method: 'POST', body: formData }),
    all: (page = 1, hallOfFame = false) => apiFetch(`/posts?page=${page}&isHallOfFame=${hallOfFame}`),
    mine: () => apiFetch('/posts/me'),
    like: (id) => apiFetch(`/posts/${id}/like`, { method: 'POST' }),
};

// ---- Notifications API ----
const NotificationsAPI = {
    mine: () => apiFetch('/notifications'),
    readAll: () => apiFetch('/notifications/read-all', { method: 'PUT' }),
};

// ---- Auth Guard ----
function requireAuth() {
    const token = TokenManager.get();
    const user = TokenManager.getUser();
    if (!token || !user) {
        window.location.href = '/';
        return false;
    }
    return true;
}

function requireStudent() {
    if (!requireAuth()) return false;
    const user = TokenManager.getUser();
    if (user?.role !== 'student') {
        window.location.href = '/';
        return false;
    }
    return true;
}

// ---- Toast Notifications ----
function showToast(title, message = '', type = 'info', duration = 4000) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <div>
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-msg">${message}</div>` : ''}
    </div>
  `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.4s ease reverse';
        setTimeout(() => toast.remove(), 400);
    }, duration);
}

// ---- Avatar Initials Helper ----
function getInitials(name) {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
}

// ---- Level from Points ----
function getLevel(points) {
    if (points < 100) return 1;
    if (points < 250) return 2;
    if (points < 500) return 3;
    if (points < 800) return 4;
    if (points < 1200) return 5;
    if (points < 1700) return 6;
    if (points < 2300) return 7;
    if (points < 3000) return 8;
    if (points < 4000) return 9;
    return 10;
}

function getNextLevelPoints(points) {
    const thresholds = [100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000, 5000];
    for (const t of thresholds) if (points < t) return t;
    return points + 1000;
}

// ---- Load Sidebar Active State ----
function setActiveSidebarLink() {
    const path = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === path) link.classList.add('active');
    });
}

// ---- Sidebar Mobile Toggle ----
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const hamburger = document.getElementById('hamburger');

    if (!sidebar) return;

    hamburger?.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('show');
    });
    overlay?.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    });

    setActiveSidebarLink();
}

// Expose globally
window.TokenManager = TokenManager;
window.AuthAPI = AuthAPI;
window.StudentsAPI = StudentsAPI;
window.TopicsAPI = TopicsAPI;
window.LeaderboardAPI = LeaderboardAPI;
window.RequestsAPI = RequestsAPI;
window.TasksAPI = TasksAPI;
window.RoadmapAPI = RoadmapAPI;
window.PostsAPI = PostsAPI;
window.NotificationsAPI = NotificationsAPI;
window.showToast = showToast;
window.requireAuth = requireAuth;
window.requireStudent = requireStudent;
window.getInitials = getInitials;
window.getLevel = getLevel;
window.getNextLevelPoints = getNextLevelPoints;
window.initSidebar = initSidebar;
