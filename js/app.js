/* =============================================================
   LUKIE FX — app.js
   Handles: preloader, navigation, theme, form submission.
   ============================================================= */

/* ---------- 1. FORM SUBMISSION (no WhatsApp redirect) ---------- */
document.addEventListener('submit', (e) => {
  const form = e.target.closest('[data-lfx-form]');
  if (!form) return;

  e.preventDefault();
  e.stopPropagation();

  const type = form.dataset.lfxForm;
  const data = Object.fromEntries(new FormData(form).entries());

  Object.keys(data).forEach(k => {
    if (String(data[k]).trim() === '') delete data[k];
  });

  if (window.LFXStore) window.LFXStore.add(type, data);

  const msg = form.querySelector('.lfx-form-msg');
  if (msg) {
    msg.hidden = false;
    msg.textContent = '✅ Details received. Our team will contact you shortly.';
    msg.className = 'lfx-form-msg lfx-form-msg--ok';
  }

  form.reset();
  setTimeout(() => { if (msg) msg.hidden = true; }, 6000);
}, true);

/* ---------- 2. PRELOADER ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add('hidden');
      setTimeout(() => preloader.remove(), 500);
    }, 800);
  }
});

/* ---------- 3. MOBILE NAV TOGGLE ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const nav    = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      toggle.classList.toggle('open');
    });
    nav.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.classList.remove('open');
      })
    );
  }
});

/* ---------- 4. THEME TOGGLE (dark / light) ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('themeToggle');
  const saved = localStorage.getItem('lfx_theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);

  if (btn) {
    btn.addEventListener('click', () => {
      const cur  = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('lfx_theme', next);
    });
  }
});

/* ---------- 5. SMOOTH SCROLL FOR ANCHOR LINKS ---------- */
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const id = link.getAttribute('href');
  if (id === '#' || id.length < 2) return;
  const target = document.querySelector(id);
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});
