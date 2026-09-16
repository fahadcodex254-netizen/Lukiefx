/**
 * LUKIE FX — Theme Management
 */
(function(){
  const STORAGE_KEY = 'lukie-theme';
  const root = document.documentElement;

  function applyTheme(theme){
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch(e){}
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f4f7fc' : '#04091a');
    window.dispatchEvent(new CustomEvent('lfx:themechange', { detail: { theme } }));
  }

  function initTheme(){
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark'){
        root.setAttribute('data-theme', saved);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches){
        root.setAttribute('data-theme', 'light');
      }
    } catch(e){}
  }

  function toggleTheme(){
    const current = root.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  initTheme();

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#themeToggle, [data-theme-toggle]');
    if (btn){ e.preventDefault(); toggleTheme(); }
  });

  window.LFX = window.LFX || {};
  LFX.theme = { applyTheme, toggleTheme, init: initTheme };
})();
