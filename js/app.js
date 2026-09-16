/**
 * LUKIE FX — Bootstrap
 * Loads the TradingView ticker with the correct theme,
 * then initializes every module in the correct order.
 */
(function(){

  /* ============================================================
     Theme-aware TradingView ticker
     Reloads whenever the user switches between dark / light
  ============================================================ */
  function loadTicker(theme){
    const container = document.getElementById('tickerContainer');
    if (!container) return;

    // Wipe any previous widget so we don't stack duplicates
    container.innerHTML = '<div class="tradingview-widget-container__widget"></div>';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: 'FX:EURUSD',       title: 'EUR/USD' },
        { proName: 'FX:GBPUSD',       title: 'GBP/USD' },
        { proName: 'FX:USDJPY',       title: 'USD/JPY' },
        { proName: 'FX:AUDUSD',       title: 'AUD/USD' },
        { proName: 'OANDA:XAUUSD',    title: 'XAU/USD' },
        { proName: 'BINANCE:BTCUSDT', title: 'BTC/USD' }
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: 'adaptive',
      colorTheme: theme === 'light' ? 'light' : 'dark',
      locale: 'en'
    });
    container.appendChild(script);
  }

  /* ============================================================
     Boot sequence
  ============================================================ */
  function boot(){
    const LFX = window.LFX || {};

    try {
      // Read the currently-applied theme (set by theme.js before paint)
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      loadTicker(currentTheme);

      // Reload ticker whenever the theme changes
      window.addEventListener('lfx:themechange', (e) => {
        loadTicker(e.detail.theme);
      });

      // Initialize modules (order matters)
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
