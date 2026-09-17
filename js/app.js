/* =============================================================
   LUKIE FX — app.js
   Preloader, nav, theme, form submissions, tool calculators.
   ============================================================= */

/* -----------------------------------------------------------
   1. FORM SUBMISSION INTERCEPTOR
   Stops ALL [data-lfx-form] forms from redirecting to WhatsApp.
   ----------------------------------------------------------- */
document.addEventListener('submit', (e) => {
  const form = e.target.closest('[data-lfx-form]');
  if (!form) return;

  e.preventDefault();
  e.stopPropagation();

  const type = form.dataset.lfxForm;
  const data = Object.fromEntries(new FormData(form).entries());

  // drop empty fields
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

/* -----------------------------------------------------------
   2. PRELOADER
   ----------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;
  setTimeout(() => {
    preloader.classList.add('hidden');
    setTimeout(() => preloader.remove(), 500);
  }, 700);
});

/* -----------------------------------------------------------
   3. MOBILE NAV
   ----------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const nav    = document.getElementById('mainNav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    toggle.classList.toggle('open');
  });

  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.classList.remove('open');
    });
  });
});

/* -----------------------------------------------------------
   4. THEME TOGGLE
   ----------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const btn   = document.getElementById('themeToggle');
  const saved = localStorage.getItem('lfx_theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);

  if (!btn) return;
  btn.addEventListener('click', () => {
    const cur  = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('lfx_theme', next);
  });
});

/* -----------------------------------------------------------
   5. SMOOTH SCROLL FOR ANCHOR LINKS
   ----------------------------------------------------------- */
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const id = link.getAttribute('href');
  if (!id || id === '#' || id.length < 2) return;
  const target = document.querySelector(id);
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

/* -----------------------------------------------------------
   6. ADMIN OPEN BUTTON (footer)
   ----------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('adminOpenBtn');
  if (!btn || !window.LFXAdmin) return;
  btn.addEventListener('click', () => {
    if (sessionStorage.getItem(window.LFXAdmin.SESSION_KEY)) {
      window.LFXAdmin.openAdmin();
    } else {
      window.LFXAdmin.showLogin();
    }
  });
});

/* -----------------------------------------------------------
   7. FOOTER YEAR
   ----------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
});

/* -----------------------------------------------------------
   8. TRADING TOOLS — Position Size / Risk-Reward / Compound
   ----------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  /* --- Position Size --- */
  const psBalance = document.getElementById('psBalance');
  const psRisk    = document.getElementById('psRisk');
  const psSl      = document.getElementById('psSl');
  const psResult  = document.getElementById('psResult');

  function calcPosition() {
    if (!psBalance || !psResult) return;
    const bal  = parseFloat(psBalance.value) || 0;
    const risk = parseFloat(psRisk.value)    || 0;
    const sl   = parseFloat(psSl.value)      || 0;
    if (sl <= 0) { psResult.textContent = '0.00'; return; }
    const riskAmount = bal * (risk / 100);
    const lots = riskAmount / (sl * 10); // 10 = $10 per pip per std lot
    psResult.textContent = lots.toFixed(2);
  }
  [psBalance, psRisk, psSl].forEach(el => el && el.addEventListener('input', calcPosition));
  calcPosition();

  /* --- Risk-Reward --- */
  const rrEntry  = document.getElementById('rrEntry');
  const rrSl     = document.getElementById('rrSl');
  const rrTp     = document.getElementById('rrTp');
  const rrResult = document.getElementById('rrResult');

  function calcRR() {
    if (!rrEntry || !rrResult) return;
    const entry = parseFloat(rrEntry.value) || 0;
    const sl    = parseFloat(rrSl.value)    || 0;
    const tp    = parseFloat(rrTp.value)    || 0;
    const risk  = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    if (risk === 0) { rrResult.textContent = '1 : 0.00'; return; }
    rrResult.textContent = '1 : ' + (reward / risk).toFixed(2);
  }
  [rrEntry, rrSl, rrTp].forEach(el => el && el.addEventListener('input', calcRR));
  calcRR();

  /* --- Compound Growth --- */
  const cgStart  = document.getElementById('cgStart');
  const cgRate   = document.getElementById('cgRate');
  const cgMonths = document.getElementById('cgMonths');
  const cgResult = document.getElementById('cgResult');

  function calcCompound() {
    if (!cgStart || !cgResult) return;
    const start  = parseFloat(cgStart.value)  || 0;
    const rate   = parseFloat(cgRate.value)   || 0;
    const months = parseInt(cgMonths.value, 10) || 0;
    let value = start;
    for (let i = 0; i < months; i++) value *= (1 + rate / 100);
    cgResult.textContent = '$' + value.toLocaleString(undefined, {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    });
  }
  [cgStart, cgRate, cgMonths].forEach(el => el && el.addEventListener('input', calcCompound));
  calcCompound();
});
