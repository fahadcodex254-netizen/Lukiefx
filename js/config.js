/* =============================================================
   LUKIE FX — config.js
   Central place for company info. Edit here, updates everywhere.
   ============================================================= */
window.LFX_CONFIG = {
  COMPANY: {
    name: 'LUKIE FX',
    tagline: 'Trusted Forex Trading Partner',
    address: 'Nairobi, Kenya',
    supportHours: 'Mon–Fri, 08:00–20:00 EAT',
    regulatoryLicense: ''  // leave empty unless you hold a real license
  },

  CONTACT: {
    whatsappDisplay: '+254 114 319 611',
    whatsappNumber:  '254114319611',
    telegram:        'lukiefx',
    email:           'support@lukiefx.com',
    phoneDisplay:    '+254 114 319 611'
  },

  SOCIAL: {
    facebook:  'https://facebook.com/lukiefx',
    telegram:  'https://t.me/lukiefx',
    instagram: 'https://instagram.com/lukiefx',
    tiktok:    'https://tiktok.com/@lukiefx'
  },

  PAYMENTS: {
    methods: ['M-Pesa', 'TRC Wallet', 'Bank Transfer'],
    currency: 'USD',
    minDeposit: 200
  },

  ADMIN: {
    // NOTE: client-side password — do not rely on this for real security.
    password: 'Lukiefxcx5',
    sessionKey: 'lfx_admin_session'
  }
};
