/**
 * LUKIE FX — Bootstrap
 */
(function(){
  function boot(){
    const LFX = window.LFX || {};
    try {
      LFX.nav?.init?.();
      LFX.charts?.init?.();
      LFX.market?.init?.();
      LFX.ui?.init?.();
      LFX.pages?.init?.();

      console.log('%cLUKIE FX', 'color:#3b82f6;font-size:22px;font-weight:900;letter-spacing:2px');
      console.log('%c🌓 Theme toggle · 📱 Fully responsive', 'color:#f5b301;font-size:12px;font-weight:700');
      console.log('%c⚙️ Edit js/config.js to fill in your real details.', 'color:#8aa3cc;font-size:12px');
    } catch(err){
      console.error('LUKIE FX boot error:', err);
    }
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
