/**
 * api.js — Centralized fetch wrapper + token management.
 * All backend requests go through this module.
 */

const API_BASE = '/api';

// ─── Token Storage ───────────────────────────────────────
const Auth = {
  getToken: () => localStorage.getItem('sets_token'),
  setToken: (t) => localStorage.setItem('sets_token', t),
  getUser: () => {
    const raw = localStorage.getItem('sets_user');
    return raw ? JSON.parse(raw) : null;
  },
  setUser: (u) => localStorage.setItem('sets_user', JSON.stringify(u)),
  clear: () => {
    localStorage.removeItem('sets_token');
    localStorage.removeItem('sets_user');
  },
  isLoggedIn: () => !!localStorage.getItem('sets_token'),
};

// ─── HTTP Client ─────────────────────────────────────────
async function request(path, options = {}) {
  const token = Auth.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}`);
  }

  return data;
}

const get = (path) => request(path, { method: 'GET' });
const post = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) });
const put = (path, body = {}) => request(path, { method: 'PUT', body: JSON.stringify(body) });
const del = (path) => request(path, { method: 'DELETE' });

// ─── Toast System ────────────────────────────────────────
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container') || (() => {
    const el = document.createElement('div');
    el.id = 'toast-container';
    el.className = 'toast-container';
    document.body.appendChild(el);
    return el;
  })();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

// ─── Route Guard ─────────────────────────────────────────
function requireAuth() {
  if (!Auth.isLoggedIn()) {
    window.location.href = '/index.html';
    return false;
  }
  return true;
}

function requireRole(...roles) {
  const user = Auth.getUser();
  if (!user || !roles.includes(user.role)) {
    showToast('Access denied for your role.', 'error');
    return false;
  }
  return true;
}

// ─── Date Formatting ─────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function isSlaBreached(slaDeadline) {
  return new Date() > new Date(slaDeadline);
}
