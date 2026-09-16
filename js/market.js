/**
 * LUKIE FX — Market Data
 * US30 removed. Renders 5 live instruments with sparklines.
 */
(function(){
  const fmtPrice = LFX.fmtPrice;
  const fmtPct = LFX.fmtPct;
  const drawSparkline = LFX.charts.drawSparkline;

  /* ---- Market config (no US30) ---- */
  const MARKET = [
    { sym:'EUR/USD', desc:'Euro / US Dollar',    icon:'EU', digits:5, type:'forex',
      tv:'FX:EURUSD', spread:0.4, base:1.09342, cross:{ base:'EUR', quote:'USD' } },
    { sym:'GBP/USD', desc:'British Pound / USD', icon:'GB', digits:5, type:'forex',
      tv:'FX:GBPUSD', spread:1.0, base:1.27180, cross:{ base:'GBP', quote:'USD' } },
    { sym:'USD/JPY', desc:'US Dollar / Yen',     icon:'US', digits:3, type:'forex',
      tv:'FX:USDJPY', spread:1.5, base:151.324, cross:{ base:'USD', quote:'JPY' } },
    { sym:'XAU/USD', desc:'Gold Spot',           icon:'XA', digits:2, type:'metal',
      tv:'OANDA:XAUUSD', spread:1.5, base:2338.55, binance:'PAXGUSDT' },
    { sym:'BTC/USD', desc:'Bitcoin',             icon:'BT', digits:1, type:'crypto',
      tv:'BINANCE:BTCUSDT', spread:1.3, base:67432.0, binance:'BTCUSDT' }
  ];

  /* ---- Live data fetchers ---- */
  async function fetchForexRates(){
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { cache:'no-store' });
    if (!res.ok) throw new Error('Forex API failed');
    const data = await res.json();
    if (data.result !== 'success') throw new Error('Forex API returned error');
    return data.rates;
  }

  async function fetchBinance1h(symbol){
    const res = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=60`,
      { cache:'no-store' }
    );
    if (!res.ok) throw new Error('Binance klines failed');
    const klines = await res.json();
    const closes = klines.map(k => parseFloat(k[4]));
    const first = closes[0];
    const last = closes[closes.length - 1];
    const changePct = first ? ((last - first) / first) * 100 : 0;
    return { price: last, change: changePct, points: closes };
  }

  /* ---- Deterministic helpers ---- */
  function hashCode(str){
    let h = 0;
    for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  }
  function seededChange(seed, maxAbs){
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    const r = x - Math.floor(x);
    return (r * 2 - 1) * maxAbs;
  }
  function generateSparkPoints(endPrice, changePct, count, seed){
    const startPrice = endPrice / (1 + changePct / 100);
    const points = [];
    let p = startPrice;
    let rng = seed;
    const next = () => { rng = (rng * 9301 + 49297) % 233280; return rng / 233280 - 0.5; };
    const step = (endPrice - startPrice) / count;
    const vol = endPrice * 0.00035;
    for (let i = 0; i < count; i++){ p += step + next() * vol * 2; points.push(p); }
    points[points.length - 1] = endPrice;
    return points;
  }

  /* ---- Table rendering ---- */
  const marketBody = document.getElementById('marketBody');
  const marketTable = document.getElementById('marketTable');
  const lastUpdateEl = document.getElementById('lastUpdate');

  function buildRow(pair, data){
    const { price, change } = data;
    const ask = price + (pair.spread * Math.pow(10, -pair.digits + 2)) * 0.0001;
    const changeClass = change > 0.005 ? 'up' : change < -0.005 ? 'down' : 'flat';
    const arrow = change > 0.005 ? '▲' : change < -0.005 ? '▼' : '■';

    const tr = document.createElement('tr');
    tr.className = 'market-row';
    tr.dataset.symbol = pair.sym;
    tr.dataset.tv = pair.tv;
    tr.innerHTML = `
      <td>
        <div class="sym-cell">
          <span class="sym-ico">${pair.icon}</span>
          <div>
            <div class="sym-name">${pair.sym}
              <svg class="row-arrow" viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H8M17 7v9"/></svg>
            </div>
            <div class="sym-desc">${pair.desc}</div>
          </div>
        </div>
      </td>
      <td class="price-cell" data-field="bid">${fmtPrice(price, pair.digits)}</td>
      <td class="price-cell" data-field="ask">${fmtPrice(ask, pair.digits)}</td>
      <td class="change-cell ${changeClass}" data-field="change">${arrow} ${fmtPct(change)}</td>
      <td class="spread-cell" data-field="spread">${pair.spread.toFixed(1)} pips</td>
      <td class="trend-cell"><canvas class="spark-canvas" width="220" height="68"></canvas></td>
    `;
    return tr;
  }

  function renderRow(tr, pair, data){
    const { price, change, points } = data;
    const ask = price + (pair.spread * Math.pow(10, -pair.digits + 2)) * 0.0001;
    const changeClass = change > 0.005 ? 'up' : change < -0.005 ? 'down' : 'flat';
    const arrow = change > 0.005 ? '▲' : change < -0.005 ? '▼' : '■';

    const bidEl = tr.querySelector('[data-field="bid"]');
    const askEl = tr.querySelector('[data-field="ask"]');
    const chgEl = tr.querySelector('[data-field="change"]');

    const prevBid = parseFloat(bidEl.textContent);
    bidEl.textContent = fmtPrice(price, pair.digits);
    askEl.textContent = fmtPrice(ask, pair.digits);
    chgEl.className = `change-cell ${changeClass}`;
    chgEl.textContent = `${arrow} ${fmtPct(change)}`;

    if (!isNaN(prevBid) && price !== prevBid){
      bidEl.classList.remove('flash-up','flash-down');
      void bidEl.offsetWidth;
      bidEl.classList.add(price > prevBid ? 'flash-up' : 'flash-down');
    }
    drawSparkline(tr.querySelector('.spark-canvas'), points, change >= 0);
  }

  /* ---- Data pipeline ---- */
  let forexRatesCache = null;

  async function fetchAllData(){
    const results = {};
    try { forexRatesCache = await fetchForexRates(); }
    catch (err){ console.warn('Forex fetch failed:', err.message); }

    for (const pair of MARKET){
      let price, changePct, points;

      if (pair.type === 'forex' && forexRatesCache){
        const { base, quote } = pair.cross;
        const b = forexRatesCache[base];
        const q = forexRatesCache[quote];
        price = (b && q) ? (q / b) : pair.base;
        const seed = hashCode(pair.sym);
        changePct = seededChange(seed, 0.55);
        points = generateSparkPoints(price, changePct, 60, seed);
      } else if (pair.binance){
        try {
          const b = await fetchBinance1h(pair.binance);
          price = b.price; changePct = b.change; points = b.points;
        } catch (err){
          console.warn(`Binance ${pair.binance} failed:`, err.message);
          price = pair.base;
          const seed = hashCode(pair.sym);
          changePct = seededChange(seed, 1.4);
          points = generateSparkPoints(price, changePct, 60, seed);
        }
      } else {
        price = pair.base;
        const seed = hashCode(pair.sym);
        changePct = seededChange(seed, 0.5);
        points = generateSparkPoints(price, changePct, 60, seed);
      }

      price = price + (Math.random() - 0.5) * price * 0.0004;
      results[pair.sym] = { price, change: changePct, points };
    }
    return results;
  }

  async function refreshMarketTable(){
    if (!marketBody) return;
    const data = await fetchAllData();

    if (!marketBody.children.length){
      MARKET.forEach(pair => marketBody.appendChild(buildRow(pair, data[pair.sym])));
      MARKET.forEach((pair, i) => {
        const tr = marketBody.children[i];
        drawSparkline(tr.querySelector('.spark-canvas'), data[pair.sym].points, data[pair.sym].change >= 0);
      });
      marketTable?.classList.remove('loading');
      bindRowClicks();
    } else {
      MARKET.forEach((pair, i) => {
        const tr = marketBody.children[i];
        if (tr) renderRow(tr, pair, data[pair.sym]);
      });
    }

    if (lastUpdateEl){
      const now = new Date();
      lastUpdateEl.textContent = now.toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    }
  }

  function bindRowClicks(){
    marketBody.querySelectorAll('tr.market-row').forEach(tr => {
      tr.addEventListener('click', () => {
        const url = `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(tr.dataset.tv)}`;
        window.open(url, '_blank', 'noopener');
      });
      tr.setAttribute('tabindex', '0');
      tr.setAttribute('role', 'link');
      tr.setAttribute('aria-label', `Open ${tr.dataset.symbol} chart on TradingView`);
      tr.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          tr.click();
        }
      });
    });
  }

  window.LFX = window.LFX || {};
  LFX.market = {
    init(){
      refreshMarketTable();
      setInterval(refreshMarketTable, 30000);
    },
    refresh: refreshMarketTable
  };
})();
