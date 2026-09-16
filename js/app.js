/**
 * TRADE WITH LUKIE — Bootstrap
 * - Animated candlestick preloader
 * - Theme-aware TradingView ticker
 * - Module initialization
 */
(function(){

  /* ============================================================
     PRELOADER — Animated candlestick background
  ============================================================ */
  function startPreloaderChart(){
    const canvas = document.getElementById('preloaderChart');
    if (!canvas) return () => {};

    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, dpr = 1;
    let candles = [];
    let animationId = null;
    let running = true;

    const SPACING = 34;
    const MAX_CANDLES = 80;

    function resize(){
      dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function newCandle(prevClose){
      const drift = (Math.random() - 0.47) * 5;
      const open = prevClose;
      const close = open + drift;
      const high = Math.max(open, close) + Math.random() * 4;
      const low  = Math.min(open, close) - Math.random() * 4;
      return { open, close, high, low, x: 0 };
    }

    function seedCandles(){
      candles = [];
      let price = 100;
      for (let i = 0; i < MAX_CANDLES; i++){
        const c = newCandle(price);
        c.x = i * SPACING;
        candles.push(c);
        price = c.close;
      }
    }

    function shiftAndAppend(){
      const step = 0.6;
      candles.forEach(c => { c.x -= step; });

      while (candles.length && candles[0].x < -SPACING * 2){
        candles.shift();
      }

      const last = candles[candles.length - 1];
      const next = newCandle(last ? last.close : 100);
      next.x = (last ? last.x : 0) + SPACING;
      candles.push(next);
    }

    function draw(){
      if (!running) return;
      ctx.clearRect(0, 0, W, H);

      const cssVar = (n) =>
        getComputedStyle(document.documentElement).getPropertyValue(n).trim();
      const cBull   = cssVar('--green') || '#22c55e';
      const cBear   = cssVar('--red') || '#f43f5e';
      const cAccent = cssVar('--gold') || '#3b82f6';
      const cGrid   = 'rgba(255,255,255,.04)';

      let min = Infinity, max = -Infinity;
      candles.forEach(c => {
        min = Math.min(min, c.low);
        max = Math.max(max, c.high);
      });
      const range = max - min || 1;
      const padY = 60;
      const usableH = H - padY * 2;
      const y = v => padY + (1 - (v - min) / range) * usableH;

      ctx.strokeStyle = cGrid;
      ctx.lineWidth = 1;
      const gridRows = 8;
      for (let i = 0; i <= gridRows; i++){
        const gy = padY + (i / gridRows) * usableH;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(W, gy);
        ctx.stroke();
      }
      for (let x = 0; x < W; x += SPACING * 4){
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }

      const bodyW = SPACING * 0.55;
      candles.forEach(c => {
        if (c.x < -SPACING * 3 || c.x > W + SPACING * 3) return;

        const bull = c.close >= c.open;
        const color = bull ? cBull : cBear;

        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.85;

        ctx.beginPath();
        ctx.moveTo(c.x, y(c.high));
        ctx.lineTo(c.x, y(c.low));
        ctx.lineWidth = 1.4;
        ctx.stroke();

        const top = Math.min(y(c.open), y(c.close));
        const hgt = Math.max(2, Math.abs(y(c.close) - y(c.open)));
        ctx.fillRect(c.x - bodyW / 2, top, bodyW, hgt);
      });

      ctx.globalAlpha = 1;
      const grd = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H) * 0.6);
      grd.addColorStop(0, 'rgba(0,0,0,0)');
      grd.addColorStop(1, 'rgba(0,0,0,.55)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = cAccent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, padY - 12);
      ctx.lineTo(W, padY - 12);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    let frameCounter = 0;
    function loop(){
      if (!running) return;
      frameCounter++;
      if (frameCounter % 4 === 0) shiftAndAppend();
      draw();
      animationId = requestAnimationFrame(loop);
    }

    resize();
    seedCandles();
    loop();

    window.addEventListener('resize', resize);
    window.addEventListener('lfx:themechange', () => setTimeout(draw, 40));

    return function stop(){
      running = false;
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }

  /* ============================================================
     TICKER
  ============================================================ */
  function loadTicker(theme){
    const container = document.getElementById('tickerContainer');
    if (!container) return;
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
     Boot
 
