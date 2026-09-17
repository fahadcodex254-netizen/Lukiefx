/**
 * LUKIE FX — Configuration & Shared Utilities
 */
window.LFX = window.LFX || {};

LFX.CONFIG = {
  /* === CONTACT === */
  WHATSAPP_NUMBER:    '254114319611',
  TELEGRAM_LINK:      'https://t.me/tradewithlukie',
  EMAIL:              'Lukiefx@gmail.com',
  PHONE_DISPLAY:      '+254 114 319 611',

  /* === COMPANY === */
  COMPANY_NAME:       'LUKIE FX',
  COMPANY_ADDRESS:    'Nairobi, Kenya',
  REGULATORY_LICENSE: 'LFX-KE-2026-001',   /* ⚠️ Replace with your real license number when issued */
  SUPPORT_HOURS:      'Monday – Friday · 24 hours',
  EFFECTIVE_DATE:     'September 17, 2026',

  /* === PAYMENTS === */
  PAYMENT_METHODS:    'M-Pesa, TRC Wallet, Bank Transfer',
  MIN_DEPOSIT:        '$200',

  /* === SOCIAL LINKS === */
  FACEBOOK_URL:       'https://www.facebook.com/share/1AqEen1Lkt/',
  TELEGRAM_URL:       'https://t.me/tradewithlukie',
  INSTAGRAM_URL:      'https://www.instagram.com/l.ukie._?stkn=MWd3eGowM3NjYWhocQ==',
  TIKTOK_URL:         'https://www.tiktok.com/@_lukie_glc?_r=1&_t=ZS-99mXXSnFdZY'
};

/* Small DOM helpers */
LFX.$  = (sel, ctx = document) => ctx.querySelector(sel);
LFX.$$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* Strip non-digits for wa.me link */
LFX.phoneSafe = () => LFX.CONFIG.WHATSAPP_NUMBER.replace(/[^\d]/g, '');

/* Read a CSS custom property */
LFX.cssVar = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/* Formatting */
LFX.fmtPrice = (v, d) => Number(v).toFixed(d);
LFX.fmtPct = (v) => (v >= 0 ? '+' : '') + v.toFixed(2) + '%';

/* Escape HTML */
LFX.escapeHTML = (str) => String(str).replace(/[&<>"']/g, c => ({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[c]));

/* Tiny pub/sub */
LFX.bus = (() => {
  const listeners = {};
  return {
    on(evt, fn){ (listeners[evt] = listeners[evt] || []).push(fn); },
    emit(evt, detail){
      (listeners[evt] || []).forEach(fn => {
        try { fn(detail); } catch(e){ console.warn('bus handler error:', e); }
      });
    }
  };
})();
