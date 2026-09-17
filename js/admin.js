/**
 * LUKIE FX — Admin Panel
 * Route-aware: opens on #admin, closes via back button or X.
 */
(function(){
  const ADMIN_PASSWORD = 'Lukiefxcx5';
  const STORAGE_SUBS     = 'lfx_submissions';
  const STORAGE_CONTENT  = 'lfx_content_overrides';
  const STORAGE_AUTH     = 'lfx_admin_auth';
  const MAX_SUBMISSIONS  = 500;

  /* ============================================================
     STORAGE HELPERS
  ============================================================ */
  function getSubmissions(){
    try { return JSON.parse(localStorage.getItem(STORAGE_SUBS) || '[]'); }
    catch(e){ return []; }
  }
  function saveSubmission(entry){
    const list = getSubmissions();
    list.unshift(entry);
    if (list.length > MAX_SUBMISSIONS) list.length = MAX_SUBMISSIONS;
    try { localStorage.setItem(STORAGE_SUBS, JSON.stringify(list)); } catch(e){}
  }
  function clearSubmissions(){
    try { localStorage.removeItem(STORAGE_SUBS); } catch(e){}
  }
  function getOverrides(){
    try { return JSON.parse(localStorage.getItem(STORAGE_CONTENT) || '{}'); }
    catch(e){ return {}; }
  }
  function setOverride(key, value){
    const all = getOverrides();
    if (value === '' || value == null) delete all[key];
    else all[key] = value;
    try { localStorage.setItem(STORAGE_CONTENT, JSON.stringify(all)); } catch(e){}
  }
  function clearOverrides(){
    try { localStorage.removeItem(STORAGE_CONTENT); } catch(e){}
  }

  /* ============================================================
     APPLY CONTENT OVERRIDES ON PAGE LOAD
  ============================================================ */
  function applyContentOverrides(){
    const overrides = getOverrides();
    if (!Object.keys(overrides).length) return;
    document.querySelectorAll('[data-edit]').forEach(el => {
      const key = el.getAttribute('data-edit');
      if (overrides[key] !== undefined) el.innerHTML = overrides[key];
    });
    if (overrides['site.title']) document.title = overrides['site.title'];
  }

  /* ============================================================
     AUTH
  ============================================================ */
  function isLoggedIn(){
    try { return sessionStorage.getItem(STORAGE_AUTH) === 'yes'; }
    catch(e){ return false; }
  }
  function login(password){
    if (password === ADMIN_PASSWORD){
      try { sessionStorage.setItem(STORAGE_AUTH, 'yes'); } catch(e){}
      return true;
    }
    return false;
  }
  function logout(){
    try { sessionStorage.removeItem(STORAGE_AUTH); } catch(e){}
    if (LFX.router) LFX.router.navigate({ page: 'home' }, '');
    else closeAdminVisual();
  }

  /* ============================================================
     FORM INTERCEPTION
  ============================================================ */
  function interceptForms(){
    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (!form || form.tagName !== 'FORM') return;
      setTimeout(() => {
        try {
          const data = {};
          new FormData(form).forEach((value, key) => {
            if (data[key] === undefined) data[key] = value;
            else {
              if (!Array.isArray(data[key])) data[key] = [data[key]];
              data[key].push(value);
            }
          });

          let type = 'Unknown Form';
          const id = form.id || '';
          if (id === 'onbForm') type = 'Account Management';
          else if (id === 'registerForm') type = 'Account Registration';
          else if (id === 'loginForm') type = 'Login Attempt';
          else if (id === 'contactForm') type = 'Contact Form';
          else if (form.closest('[data-service]')) type = 'Service: ' + form.closest('[data-service]').dataset.service;
          else if (id) type = id;

          saveSubmission({ type, timestamp: new Date().toISOString(), data });
        } catch(err){ console.warn('Submission capture error:', err); }
      }, 100);
    }, true);
  }

  /* ============================================================
     UI — ADMIN OVERLAY
  ============================================================ */
  let adminOverlay = null;
  let currentTab = 'submissions';

  function ensureOverlay(){
    if (adminOverlay) return adminOverlay;
    adminOverlay = document.createElement('div');
    adminOverlay.className = 'admin-overlay';
    adminOverlay.id = 'adminOverlay';
    adminOverlay.setAttribute('role', 'dialog');
    adminOverlay.setAttribute('aria-modal', 'true');
    adminOverlay.innerHTML = '<div class="admin-inner" id="adminInner"></div>';
    document.body.appendChild(adminOverlay);
    return adminOverlay;
  }

  function openAdmin(){
    ensureOverlay();
    adminOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (isLoggedIn()) renderDashboard();
    else renderLogin();
  }

  function closeAdminVisual(){
    if (!adminOverlay) return;
    adminOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ---------- LOGIN VIEW ---------- */
  function renderLogin(){
    const inner = document.getElementById('adminInner');
    inner.innerHTML = `
      <button class="admin-close" aria-label="Close">×</button>
      <div class="admin-login">
        <div class="admin-login-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        </div>
        <h1>Admin Login</h1>
        <p>Enter the admin password to access the dashboard</p>
        <form id="adminLoginForm" autocomplete="off">
          <input type="password" id="adminPass" placeholder="Password" autofocus required />
          <div class="admin-login-error" id="adminLoginError">Wrong password. Try again.</div>
          <button type="submit" class="admin-btn admin-btn-primary">Sign In</button>
        </form>
      </div>
    `;
    inner.querySelector('.admin-close').onclick = () => {
      if (LFX.router) LFX.router.navigate({ page: 'home' }, '');
      else closeAdminVisual();
    };
    const form = inner.querySelector('#adminLoginForm');
    const errorEl = inner.querySelector('#adminLoginError');
    const passInput = inner.querySelector('#adminPass');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (login(passInput.value)){
        errorEl.classList.remove('show');
        renderDashboard();
      } else {
        errorEl.classList.add('show');
        passInput.value = '';
        passInput.focus();
      }
    });
  }

  /* ---------- DASHBOARD VIEW ---------- */
  function renderDashboard(){
    const inner = document.getElementById('adminInner');
    const subs = getSubmissions();

    inner.innerHTML = `
      <header class="admin-header">
        <div class="admin-brand">
          <span class="admin-brand-mark">⚡</span>
          <div>
            <strong>LUKIE FX Admin</strong>
            <small>Content &amp; Submission Manager</small>
          </div>
        </div>
        <div class="admin-header-actions">
          <button class="admin-btn admin-btn-ghost" id="adminLogoutBtn">Logout</button>
          <button class="admin-close" aria-label="Close">×</button>
        </div>
      </header>
      <nav class="admin-tabs">
        <button class="admin-tab ${currentTab === 'submissions' ? 'active' : ''}" data-tab="submissions">
          Submissions <span class="admin-badge">${subs.length}</span>
        </button>
        <button class="admin-tab ${currentTab === 'content' ? 'active' : ''}" data-tab="content">Site Content</button>
        <button class="admin-tab ${currentTab === 'settings' ? 'active' : ''}" data-tab="settings">Settings</button>
      </nav>
      <div class="admin-body" id="adminBody"></div>
    `;

    inner.querySelector('.admin-close').onclick = () => {
      if (LFX.router) LFX.router.navigate({ page: 'home' }, '');
      else closeAdminVisual();
    };
    inner.querySelector('#adminLogoutBtn').onclick = logout;
    inner.querySelectorAll('.admin-tab').forEach(tab => {
      tab.onclick = () => { currentTab = tab.dataset.tab; renderDashboard(); };
    });
    renderTabContent();
  }

  function renderTabContent(){
    const body = document.getElementById('adminBody');
    if (!body) return;
    if (currentTab === 'submissions') renderSubmissionsTab(body);
    else if (currentTab === 'content') renderContentTab(body);
    else if (currentTab === 'settings') renderSettingsTab(body);
  }

  function renderSubmissionsTab(container){
    const subs = getSubmissions();
    if (!subs.length){
      container.innerHTML = `
        <div class="admin-empty">
          <div class="admin-empty-icon">📭</div>
          <h2>No submissions yet</h2>
          <p>When someone fills in the Account Management form, registers, or submits any form on the site, their data will appear here.</p>
        </div>`;
      return;
    }
    const rows = subs.map(sub => {
      const date = new Date(sub.timestamp);
      const dateStr = date.toLocaleDateString() + ' · ' + date.toLocaleTimeString();
      const fields = Object.entries(sub.data).map(([k, v]) => {
        const label = k.replace(/^onb_|^reg_|^mg_/, '').replace(/_/g, ' ');
        return `<div class="admin-field"><span class="admin-field-key">${escapeHtml(label)}</span><span class="admin-field-val">${escapeHtml(String(v))}</span></div>`;
      }).join('');
      return `
        <div class="admin-sub-card">
          <div class="admin-sub-head">
            <span class="admin-sub-type">${escapeHtml(sub.type)}</span>
            <span class="admin-sub-time">${dateStr}</span>
          </div>
          <div class="admin-sub-body">${fields}</div>
        </div>`;
    }).join('');

    container.innerHTML = `
      <div class="admin-sub-toolbar">
        <span><strong>${subs.length}</strong> submission${subs.length === 1 ? '' : 's'} captured</span>
        <div class="admin-sub-toolbar-actions">
          <button class="admin-btn admin-btn-ghost" id="exportSubsBtn">⬇ Export as JSON</button>
          <button class="admin-btn admin-btn-danger" id="clearSubsBtn">Clear All</button>
        </div>
      </div>
      <div class="admin-subs-list">${rows}</div>`;

    const exportBtn = container.querySelector('#exportSubsBtn');
    if (exportBtn){
      exportBtn.onclick = () => {
        const blob = new Blob([JSON.stringify(subs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lukiefx-submissions-' + new Date().toISOString().slice(0,10) + '.json';
        a.click();
        URL.revokeObjectURL(url);
      };
    }
    const clearBtn = container.querySelector('#clearSubsBtn');
    if (clearBtn){
      clearBtn.onclick = () => {
        if (confirm('Delete all captured submissions? This cannot be undone.')){
          clearSubmissions();
          renderDashboard();
        }
      };
    }
  }

  function renderContentTab(container){
    const editable = [];
    document.querySelectorAll('[data-edit]').forEach(el => {
      editable.push({
        key: el.getAttribute('data-edit'),
        label: el.getAttribute('data-edit-label') || el.getAttribute('data-edit'),
        value: el.innerHTML.trim(),
        tag: el.tagName.toLowerCase()
      });
    });

    if (!editable.length){
      container.innerHTML = `
        <div class="admin-empty">
          <div class="admin-empty-icon">📝</div>
          <h2>No editable fields found</h2>
          <p>Add <code>data-edit="unique.key"</code> to any HTML element to make it editable here.</p>
        </div>`;
      return;
    }

    const overrides = getOverrides();
    const fields = editable.map(f => {
      const isOverridden = overrides[f.key] !== undefined;
      const isMulti = f.value.includes('\n') || f.value.length > 80 || ['p','h1','h2','div'].includes(f.tag);
      const input = isMulti
        ? `<textarea data-key="${f.key}" rows="3">${escapeHtml(f.value)}</textarea>`
        : `<input type="text" data-key="${f.key}" value="${escapeHtml(f.value)}" />`;
      return `
        <div class="admin-edit-row">
          <div class="admin-edit-head">
            <label>${escapeHtml(f.label)}</label>
            ${isOverridden ? '<span class="admin-edit-dot" title="Customised"></span>' : ''}
          </div>
          ${input}
          <div class="admin-edit-actions">
            <button class="admin-btn admin-btn-sm" data-save="${f.key}">Save</button>
            <button class="admin-btn admin-btn-sm admin-btn-ghost" data-reset="${f.key}" ${isOverridden ? '' : 'disabled'}>Reset</button>
          </div>
        </div>`;
    }).join('');

    container.innerHTML = `
      <div class="admin-info-banner">
        <strong>ℹ️ How this works:</strong> Edit any field below and click <em>Save</em>. The change is stored in this browser and applied on top of the site immediately. Click <em>Reset</em> to revert to the original HTML.
      </div>
      <div class="admin-edit-list">${fields}</div>
      <div class="admin-edit-footer">
        <button class="admin-btn admin-btn-danger" id="resetAllContent">Reset all edits</button>
      </div>`;

    container.querySelectorAll('[data-save]').forEach(btn => {
      btn.onclick = () => {
        const key = btn.dataset.save;
        const input = container.querySelector(`[data-key="${key}"]`);
        if (!input) return;
        setOverride(key, input.value);
        flash(btn, '✓ Saved');
        setTimeout(() => renderDashboard(), 600);
      };
    });
    container.querySelectorAll('[data-reset]').forEach(btn => {
      btn.onclick = () => {
        setOverride(btn.dataset.reset, '');
        flash(btn, '✓ Reset');
        setTimeout(() => renderDashboard(), 400);
      };
    });
    const resetAll = container.querySelector('#resetAllContent');
    if (resetAll){
      resetAll.onclick = () => {
        if (confirm('Reset all content edits back to the original HTML?')){
          clearOverrides();
          renderDashboard();
        }
      };
    }
  }

  function renderSettingsTab(container){
    const config = (window.LFX && window.LFX.CONFIG) || {};
    container.innerHTML = `
      <div class="admin-info-banner">
        <strong>ℹ️ About settings:</strong> These values are read from <code>js/config.js</code>. To change them permanently, edit that file.
      </div>
      <div class="admin-settings">
        <div class="admin-edit-row"><label>WhatsApp Number</label><input type="text" value="${escapeHtml(config.WHATSAPP_NUMBER || '')}" readonly /></div>
        <div class="admin-edit-row"><label>Telegram Link</label><input type="text" value="${escapeHtml(config.TELEGRAM_LINK || '')}" readonly /></div>
        <div class="admin-edit-row"><label>Email</label><input type="text" value="${escapeHtml(config.EMAIL || '')}" readonly /></div>
        <div class="admin-edit-row"><label>Phone</label><input type="text" value="${escapeHtml(config.PHONE_DISPLAY || '')}" readonly /></div>
        <div class="admin-edit-row"><label>Payment Methods</label><input type="text" value="${escapeHtml(config.PAYMENT_METHODS || '')}" readonly /></div>
        <div class="admin-edit-row"><label>Minimum Deposit</label><input type="text" value="${escapeHtml(config.MIN_DEPOSIT || '')}" readonly /></div>
      </div>
      <div class="admin-danger-zone">
        <h3>⚠️ Danger Zone</h3>
        <p>These actions affect data stored in this browser only.</p>
        <button class="admin-btn admin-btn-danger" id="clearAllData">Clear all admin data</button>
      </div>`;

    const clearAll = container.querySelector('#clearAllData');
    if (clearAll){
      clearAll.onclick = () => {
        if (confirm('Delete ALL submissions and content edits? This cannot be undone.')){
          clearSubmissions();
          clearOverrides();
          alert('All admin data cleared.');
          renderDashboard();
        }
      };
    }
  }

  /* ============================================================
     UTILITIES
  ============================================================ */
  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }
  function flash(btn, text){
    const original = btn.textContent;
    btn.textContent = text;
    btn.disabled = true;
    setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 900);
  }

  /* ============================================================
     INIT
  ============================================================ */
  function init(){
    applyContentOverrides();
    interceptForms();

    if (LFX.router){
      LFX.router.register('admin', () => { openAdmin(); });
    }

    document.querySelectorAll('[data-admin-open]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        if (LFX.router){
          LFX.router.navigate({ page: 'admin' }, 'admin');
        } else {
          openAdmin();
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && adminOverlay && adminOverlay.classList.contains('open')){
        if (LFX.router) LFX.router.navigate({ page: 'home' }, '');
        else closeAdminVisual();
      }
    });
  }

  window.LFX = window.LFX || {};
  LFX.admin = {
    init,
    open: () => {
      if (LFX.router) LFX.router.navigate({ page: 'admin' }, 'admin');
      else openAdmin();
    },
    close: closeAdminVisual
  };
})();
