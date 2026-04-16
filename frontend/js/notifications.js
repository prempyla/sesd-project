/**
 * notifications.js — Notification bell + dropdown management.
 * Polls every 30 seconds for new notifications.
 */

let notifInterval = null;

async function loadNotifications() {
  try {
    const res = await get('/notifications');
    const notifications = res.data;
    const unread = res.unread;

    // Update badge
    const badge = document.getElementById('notif-count');
    if (badge) {
      badge.textContent = unread;
      badge.style.display = unread > 0 ? 'block' : 'none';
    }

    // Also update sidebar badge if present
    const sidebarBadge = document.getElementById('sidebar-notif-badge');
    if (sidebarBadge) {
      sidebarBadge.textContent = unread;
      sidebarBadge.style.display = unread > 0 ? '' : 'none';
    }

    // Populate dropdown
    const list = document.getElementById('notif-list');
    if (!list) return;

    if (notifications.length === 0) {
      list.innerHTML = '<div class="notif-empty">🎉 You\'re all caught up!</div>';
      return;
    }

    list.innerHTML = notifications.map(n => `
      <div class="notif-item ${!n.readStatus ? 'unread' : ''}" onclick="markNotifRead(${n.id})">
        <div>${escapeHtml(n.message)}</div>
        <div style="font-size:0.7rem;color:var(--text-muted);margin-top:4px;">${timeAgo(n.created_at)}</div>
      </div>
    `).join('');
  } catch (err) {
    // silently fail for polling
  }
}

async function markNotifRead(id) {
  try {
    await put(`/notifications/${id}/read`);
    loadNotifications();
  } catch (err) {}
}

async function markAllNotifRead() {
  try {
    await put('/notifications/mark-all-read');
    loadNotifications();
  } catch (err) {}
}

function toggleNotifDropdown() {
  const dd = document.getElementById('notif-dropdown');
  if (dd) dd.classList.toggle('open');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('#notif-btn') && !e.target.closest('#notif-dropdown')) {
    const dd = document.getElementById('notif-dropdown');
    if (dd) dd.classList.remove('open');
  }
});

function initNotifications() {
  loadNotifications();
  notifInterval = setInterval(loadNotifications, 30000);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
