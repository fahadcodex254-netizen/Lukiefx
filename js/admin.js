/* =============================================================
   LUKIE FX — admin.js
   Handles: login, submissions viewer, close button, logout.
   ============================================================= */
(function () {
  const ADMIN_PASSWORD = 'Lukiefxcx5';
  const SESSION_KEY    = 'lfx_admin_session';

  const $   = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g,
    c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  const prettyKey = (k) => k
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, c => c.toUpperCase());

  const TYPE_LABELS = {
    account_management: 'Account Management',
    contact:            'Contact',
    registration:       'Registration',
    login:              'Login attempt'
  };

  /* ---------- submissions rendering ---------- */
  function renderSubmissions() {
    const wrap  = $('lfxSubmissions');
    const badge = $('lfxUnreadBadge');
    if (!wrap || !window.LFXStore) return;

    const list = LFXStore.readAll();

    if (badge) {
      const n = LFXStore.unreadCount();
      badge.textContent = n;
      badge.hidden = n === 0;
    }

    if (!list.length) {
      wrap.innerHTML = '<p class="lfx-empty">No submissions yet.</p>';
      return;
    }

    wrap.innerHTML = list.map(item => `
      <article class="lfx-sub" data-id="${item.id}">
        <header>
          <strong>${esc(TYPE_LABELS[item.type] || item.type)}</strong>
          <time>${new Date(item.createdAt).toLocaleString()}</time>
          <button type="button" class="lfx-sub-del" data-del="${item.id}"
                  aria-label="Delete submission">×</button>
        </header>
        <dl>
          ${Object.entries(item.data).map(([k, v]) =>
            `<dt>${esc(prettyKey(k))}</dt><dd>${esc(v)}</dd>`).join('')}
        </dl>
        <footer>
          <select data-status="${item.id}">
            ${['new','contacted','done'].map(s =>
              `<option value="${s}" ${item.status === s ? 'selected' : ''}>${s}</option>`
            ).join('')}
          </select>
        </footer>
      </article>
    `).join('');
  }

  /* ---------- panel open / close / logout ---------- */
  function openAdmin() {
    const panel = $('adminPanel');
    if (!panel) return;
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lfx-admin-open');
    document.body.style.overflow = 'hidden';

    const loginV = $('adminLoginView');
    const panelV = $('adminPanelView');
    if (loginV) loginV.hidden = true;
    if (panelV) panelV.hidden = false;

    renderSubmissions();
    if (window.LFXStore) LFXStore.markAllRead();
  }

  function closeAdmin() {
    const panel = $('adminPanel');
    if (!panel) return;
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lfx-admin-open');
    document.body.style.overflow = '';
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);

    const panel  = $('adminPanel');
    const loginV = $('adminLoginView');
    const panelV = $('adminPanelView');
    const form   = $('adminLoginForm');

    if (panel) {
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('lfx-admin-open');
    document.body.style.overflow = '';

    if (panelV) panelV.hidden = true;
    if (loginV) loginV.hidden = false;

    if (form) {
      form.reset();
      form.querySelectorAll('input').forEach(i => i.value = '');
    }

    const err = $('adminLoginError');
    if (err) err.hidden = true;
  }

  window.LFXAdmin = { openAdmin, closeAdmin, logout, renderSubmissions, SESSION_KEY };

  /* ---------- login handling ---------- */
  document.addEventListener('submit', (e) => {
    if (e.target.id !== 'adminLoginForm') return;
    e.preventDefault();

    const input = e.target.querySelector('input[type="password"]');
    const err   = $('adminLoginError');

    if (input && input.value === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      if (err) err.hidden = true;
      openAdmin();
    } else {
      if (err) {
        err.hidden = false;
        err.textContent = 'Incorrect password. Try again.';
      }
      if (input) input.value = '';
    }
  }, true);

  /* ---------- delegated UI events ---------- */
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-admin-close]')) {
      e.preventDefault();
      closeAdmin();
      return;
    }
    if (e.target.closest('[data-admin-logout]')) {
      e.preventDefault();
      logout();
      return;
    }
    const del = e.target.closest('[data-del]');
    if (del && window.LFXStore) LFXStore.remove(del.dataset.del);
  });

  document.addEventListener('change', (e) => {
    const sel = e.target.closest('[data-status]');
    if (sel && window.LFXStore) LFXStore.setStatus(sel.dataset.status, sel.value);
  });

  document.addEventListener('keydown', (e) => {
    const panel = $('adminPanel');
    if (e.key === 'Escape' && panel && panel.classList.contains('is-open')) {
      closeAdmin();
    }
  });

  window.addEventListener('lfx:submissions-changed', renderSubmissions);

  /* ---------- auto-open if session exists ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      openAdmin();
    }
  });
})();
