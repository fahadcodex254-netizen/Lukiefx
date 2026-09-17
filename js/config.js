/**
 * LUKIE FX — Configuration & Shared Utilities
 */
window.LFX = window.LFX || {};

LFX.CONFIG = {
  /* === CONTACT === */
  WHATSAPP_NUMBER:    '[YOUR_WHATSAPP_NUMBER]',
  TELEGRAM_LINK:      'https://t.me/tradewithlukie',
  EMAIL:              '[YOUR_EMAIL_ADDRESS]',
  PHONE_DISPLAY:      '[YOUR_PHONE_NUMBER]',

  /* === COMPANY === */
  COMPANY_NAME:       'LUKIE FX',
  COMPANY_ADDRESS:    '[YOUR_REGISTERED_ADDRESS]',
  REGULATORY_LICENSE: '[YOUR_REGULATORY_LICENSE_NUMBER]',
  SUPPORT_HOURS:      'Monday – Friday · 24 hours',
  EFFECTIVE_DATE:     '[EFFECTIVE_DATE]',

  /* === PAYMENTS === */
  PAYMENT_METHODS:    '[YOUR_ACCEPTED_PAYMENT_METHODS]',
  MIN_DEPOSIT:        '[MINIMUM_DEPOSIT]',

  /* === SOCIAL LINKS === */
  FACEBOOK_URL:       'https://www.facebook.com/share/1AqEen1Lkt/',
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
