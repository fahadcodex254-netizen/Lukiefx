/**
 * LUKIE FX — Free Trading Tools
 * ============================================================
 * - Lot Size Calculator
 * - Currency Strength Meter
 */
(function(){
  const $ = LFX.$;

  /* ============================================================
     LOT SIZE CALCULATOR
  ============================================================ */
  const PIP_VALUES = {
    'EURUSD': 10,
    'GBPUSD': 10,
    'AUDUSD': 10,
    'NZDUSD': 10,
    'USDJPY': 6.6,
    'USDCAD': 7.35,
    'USDCHF': 11.1,
    'XAUUSD': 10
  };

  function initCalculator(){
    const balanceInput = $('#calcBalance');
    const riskInput    = $('#calcRisk');
    const slInput      = $('#calcSL');
    const pairSelect   = $('#calcPair');
    const submitBtn    = $('#calcSubmit');
    const resultBox    = $('#calcResult');
    const resultLots   = $('#resultLots');
    const resultMini   = $('#resultMini');
    const resultMicro  = $('#resultMicro');
    const resultRisk   = $('#resultRisk');
    const presets      = document.querySelectorAll('#riskPresets [data-risk]');

    if (!balanceInput) return;

    function calculate(){
      const balance   = parseFloat(balanceInput.value) || 0;
      const riskPct   = parseFloat(riskInput.value) || 0;
      const slPips    = parseFloat(slInput.value) || 0;
      const pipValue  = PIP_VALUES[pairSelect.value] || 10;

      if (balance <= 0 || riskPct <= 0 || slPips <= 0){
        resultBox.classList.remove('show');
        return;
      }

      const riskAmount = balance * (riskPct / 100);
      const lotSize    = riskAmount / (slPips * pipValue);

      resultLots.textContent  = lotSize.toFixed(2);
      resultMini.textContent  = (lotSize * 10).toFixed(1);
      resultMicro.textContent = Math.round(lotSize * 100);
      resultRisk.textContent  = '$' + riskAmount.toFixed(2);

      resultBox.classList.add('show');
    }

    // Preset buttons
    presets.forEach(btn => {
      btn.addEventListener('click', () => {
        presets.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        riskInput.value = btn.dataset.risk;
        calculate();
      });
    });

    // Live recalculation
    [balanceInput, riskInput, slInput].forEach(el => {
      el.addEventListener('input', calculate);
    });
    pairSelect.addEventListener('change', calculate);
    submitBtn.addEventListener('click', calculate);

    // Kick off initial calc
    calculate();
  }

  /* ============================================================
     CURRENCY STRENGTH METER
  ============================================================ */
  const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];

  // Approximate mid-market baselines — used to calculate
  // how much each currency has moved relative to USD.
  const BASELINE = {
    EUR: 0.92,
    GBP: 0.79,
    JPY: 151.0,
    AUD: 1.52,
    CAD: 1.36,
    CHF: 0.90,
    NZD: 1.65
  };

  const FLAGS = {
    USD: 'US',
    EUR: 'EU',
    GBP: 'GB',
    JPY: 'JP',
    AUD: 'AU',
    CAD: 'CA',
    CHF: 'CH',
    NZD: 'NZ'
  };

  async function fetchRates(){
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { cache: 'no-store' });
    if (!res.ok) throw new Error('API failed');
    const data = await res.json();
    if (data.result !== 'success') throw new Error('API error');
    return data.rates;
  }

  function computeStrength(rates){
    const scores = {};
    let sum = 0, count = 0;

    // Each currency X: baseline vs current — positive means stronger
    for (const cur of CURRENCIES){
      if (cur === 'USD') continue;
      if (!rates[cur]) continue;
      const baseline = BASELINE[cur];
      const current  = rates[cur];
      const deviation = ((baseline - current) / baseline) * 100;
      scores[cur] = deviation;
      sum += deviation;
      count++;
    }

    // USD is the inverse of the average of the rest
    scores.USD = count > 0 ? -(sum / count) : 0;
    return scores;
  }

  function renderStrength(scores){
    const container = document.getElementById('strengthList');
    if (!container) return;

    // Sort by score descending
    const sorted = CURRENCIES
      .map(code => ({ code, score: scores[code] || 0 }))
      .sort((a, b) => b.score - a.score);

    // Find max abs score so bars are proportional
    const maxAbs = Math.max(...sorted.map(s => Math.abs(s.score)), 1);

    container.innerHTML = sorted.map(({ code, score }) => {
      const pct = (Math.abs(score) / maxAbs) * 100;
      const barWidth = Math.min(100, pct);
      const isPositive = score >= 0;
      const sign = isPositive ? '+' : '';
      const color = isPositive ? 'var(--green)' : 'var(--red)';
      const dir = isPositive ? 'up' : 'down';

      return `
        <div class="strength-row">
          <div class="strength-flag">${FLAGS[code]}</div>
          <div class="strength-info">
            <div class="strength-top">
              <span class="strength-code">${code}</span>
              <span class="strength-score" style="color:${color}">${sign}${score.toFixed(2)}%</span>
            </div>
            <div class="strength-bar-track">
              <div class="strength-bar-fill ${dir}" style="width:${barWidth}%"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  async function loadStrength(){
    const container = document.getElementById('strengthList');
    if (!container) return;

    try {
      const rates = await fetchRates();
      const scores = computeStrength(rates);
      renderStrength(scores);
    } catch (err){
      console.warn('Strength meter failed:', err.message);
      container.innerHTML = `
        <div style="text-align:center;padding:24px 0;color:var(--muted);font-size:.9rem">
          Unable to load live data. Refresh to try again.
        </div>
      `;
    }
  }

  /* ============================================================
     INIT
  ============================================================ */
  window.LFX = window.LFX || {};
  LFX.tools = {
    init(){
      initCalculator();
      loadStrength();
      // Refresh strength every 60 seconds
      setInterval(loadStrength, 60000);
    }
  };
})();
