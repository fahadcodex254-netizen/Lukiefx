/**
 * LUKIE FX — Canvas Charts
 */
(function(){
  const cssVar = LFX.cssVar;

  function createChart(canvasId, opts = {}){
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    const count = opts.count || 42;
    const speed = opts.speed || 1400;
    let W = 0, H = 0, candles = [];
    let intervalId = null;

    function resize(){
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function seed(){
      let price = 100;
      candles = [];
      for (let i = 0; i < count; i++){
        const open = price;
        const close = open + (Math.random() - 0.44) * 3.4;
        const high = Math.max(open, close) + Math.random() * 1.7;
        const low  = Math.min(open, close) - Math.random() * 1.7;
        candles.push({ open, close, high, low });
        price = close;
      }
    }

    function nextCandle(){
      const last = candles[candles.length - 1];
      const open = last.close;
      const close = open + (Math.random() - 0.44) * 3.4;
      const high = Math.max(open, close) + Math.random() * 1.7;
      const low  = Math.min(open, close) - Math.random() * 1.7;
      candles.push({ open, close, high, low });
      if (candles.length > count) candles.shift();
      draw();
    }

    function draw(){
      ctx.clearRect(0, 0, W, H);
      if (!candles.length || !W) return;

      const cBull = cssVar('--green') || '#22c55e';
      const cBear = cssVar('--red') || '#f43f5e';
      const cAccent = cssVar('--gold') || '#3b82f6';
      const cAccent2 = cssVar('--gold-2') || '#7dd3fc';
      const gridColor = cssVar('--chart-grid') || 'rgba(255,255,255,.045)';

      const pad = { t: 14, b: 18, l: 6, r: 6 };
      const cw = (W - pad.l - pad.r) / candles.length;
      const bodyW = Math.max(2, cw * 0.58);

      let min = Infinity, max = -Infinity;
      candles.forEach(c => {
        min = Math.min(min, c.low);
        max = Math.max(max, c.high);
      });
      const range = max - min || 1;
      const y = v => pad.t + (1 - (v - min) / range) * (H - pad.t - pad.b);

      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++){
        const gy = pad.t + (i / 4) * (H - pad.t - pad.b);
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }

      candles.forEach((c, i) => {
        const x = pad.l + i * cw + cw / 2;
        const bull = c.close >= c.open;
        const color = bull ? cBull : cBear;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.moveTo(x, y(c.high)); ctx.lineTo(x, y(c.low));
        ctx.lineWidth = 1.2; ctx.stroke();
        const yo = y(c.open), yc = y(c.close);
        const top = Math.min(yo, yc);
        const hgt = Math.max(1.6, Math.abs(yc - yo));
        ctx.globalAlpha = bull ? 0.95 : 0.9;
        ctx.fillRect(x - bodyW / 2, top, bodyW, hgt);
        ctx.globalAlpha = 1;
      });

      const period = 8, pts = [];
      for (let i = period - 1; i < candles.length; i++){
        let sum = 0;
        for (let k = 0; k < period; k++) sum += candles[i - k].close;
        pts.push([pad.l + i * cw + cw / 2, y(sum / period)]);
      }

      if (pts.length > 1){
        const grad = ctx.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0, cAccent + '33');
        grad.addColorStop(0.5, cAccent);
        grad.addColorStop(1, cAccent2);

        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++){
          const [px, py] = pts[i - 1];
          const [cx, cy] = pts[i];
          const mx = (px + cx) / 2;
          ctx.bezierCurveTo(mx, py, mx, cy, cx, cy);
        }
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.2;
        ctx.shadowColor = cAccent + 'aa';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    seed();
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('lfx:themechange', () => setTimeout(draw, 50));
    intervalId = setInterval(nextCandle, speed);

    return { redraw: draw, resize, destroy(){ clearInterval(intervalId); } };
  }

  function drawSparkline(canvas, points, isUp){
    if (!canvas || !points || points.length < 2) return;
    const dpr = window.devicePixelRatio || 1;
    const W = 110, H = 34;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const pad = 3;
    const stepX = (W - pad * 2) / (points.length - 1);
    const y = v => pad + (1 - (v - min) / range) * (H - pad * 2);

    const path = new Path2D();
    points.forEach((v, i) => {
      const x = pad + i * stepX;
      const yy = y(v);
      if (i === 0) path.moveTo(x, yy);
      else path.lineTo(x, yy);
    });

    const fillPath = new Path2D(path);
    fillPath.lineTo(pad + (points.length - 1) * stepX, H);
    fillPath.lineTo(pad, H);
    fillPath.closePath();

    const color = isUp ? '#22c55e' : '#f43f5e';
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, color + '55');
    grad.addColorStop(1, color + '00');
    ctx.fillStyle = grad;
    ctx.fill(fillPath);

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    ctx.lineJoin = 'round';
    ctx.stroke(path);
  }

  window.LFX = window.LFX || {};
  LFX.charts = {
    createChart,
    drawSparkline,
    init(){
      createChart('heroChart',  { count: 38, speed: 1500 });
      createChart('aboutChart', { count: 46, speed: 1900 });
    }
  };
})();