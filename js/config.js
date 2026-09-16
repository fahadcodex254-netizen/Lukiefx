/**
 * TRADE WITH LUKIE — Configuration & Shared Utilities
 */

window.LFX = window.LFX || {};

LFX.CONFIG = {
  /* Contact */
  WHATSAPP_NUMBER:    '254114319611',          /* 0114319611 in international format */
  WHATSAPP_DISPLAY:   '0114319611',
  TELEGRAM_LINK:      '[YOUR_TELEGRAM_LINK]',
  EMAIL:              '[YOUR_EMAIL_ADDRESS]',
  PHONE_DISPLAY:      '0114319611',

  /* Company */
  COMPANY_NAME:       'TRADE WITH LUKIE',
  COMPANY_SHORT:      'TWL',
  COMPANY_ADDRESS:    '[YOUR_REGISTERED_ADDRESS]',
  REGULATORY_LICENSE: '[YOUR_REGULATORY_LICENSE_NUMBER]',
  SUPPORT_HOURS:      'Monday – Friday · 24 hours',
  EFFECTIVE_DATE:     '[EFFECTIVE_DATE]',

  /* Payments */
  PAYMENT_METHODS:    '[YOUR_ACCEPTED_PAYMENT_METHODS]',
  MIN_DEPOSIT:        '[MINIMUM_DEPOSIT]'
};

LFX.$  = (sel, ctx = document) => ctx.querySelector(sel);
LFX.$$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

LFX.phoneSafe = () => LFX.CONFIG.WHATSAPP_NUMBER.replace(/[^\d]/g, '');

LFX.cssVar = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

LFX.fmtPrice = (v, d) => Number(v).toFixed(d);
LFX.fmtPct = (v) => (v >= 0 ? '+' : '') + v.toFixed(2) + '%';

LFX.escapeHTML = (str) => String(str).replace(/[&<>"']/g, c => ({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[c]));

LFX.bus = (() => {
  const listeners = {};
  return {
    on(evt, fn){
      (listeners[evt] = listeners[evt] || []).push(fn);
    },
    emit(evt, detail){
      (listeners[evt] || []).forEach(fn => {
        try { fn(detail); } catch(e){ console.warn('bus handler error:', e); }
      });
    }
  };
})();
