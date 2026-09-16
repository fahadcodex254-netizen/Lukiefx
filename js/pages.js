/**
 * Lukie Fx — Page Overlay System
 */
(function(){
  const { CONFIG, $, $$ } = LFX;

  const overlay = $('#pageOverlay');
  const overlayContent = $('#pageOverlayContent');
  let lastScrollY = 0;

  function openPage(html, opts = {}){
    if (!overlay || !overlayContent) return;
    overlayContent.innerHTML = html;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    overlay.scrollTo({ top: 0, behavior: 'auto' });

    overlayContent.querySelectorAll('[data-close-page]').forEach(btn => {
      btn.addEventListener('click', e => { e.preventDefault(); closePage(); });
    });

    if (opts.onReady) opts.onReady(overlayContent);
  }

  function closePage(){
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    window.scrollTo({ top: lastScrollY, behavior: 'auto' });
    LFX.bus.emit('closeMenu');
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay?.classList.contains('open')) closePage();
  });

  function pageHeader(){
    return `
      <button class="page-back" data-close-page type="button">
        <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Home
      </button>
    `;
  }

  const SERVICES = {
    signals: {
      title: 'Premium Trading Signals',
      lead: 'Real-time, expert-verified entries and exits delivered the moment the setup forms — with full risk parameters.',
      icon: '<svg viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 7-7"/><path d="M14 8h7v7"/></svg>',
      body: `
        <p>Our signal desk monitors forex majors, minors, gold, indices and crypto around the clock. Every signal you receive has been validated against our internal risk model before it reaches you — no noise, no guesswork.</p>
        <p>You get the exact entry, stop-loss, take-profit and a short rationale so you understand <em>why</em> the trade was taken.</p>
        <ul style="display:grid;gap:12px;margin-top:22px">
          <li style="display:flex;gap:10px;align-items:flex-start"><span style="color:var(--green);font-weight:900">✓</span><span>10–20 verified signals delivered weekly to Telegram and member dashboard</span></li>
          <li style="display:flex;gap:10px;align-items:flex-start"><span style="color:var(--green);font-weight:900">✓</span><span>Complete trade parameters — entry, SL, TP1, TP2, plus analysis</span></li>
          <li style="display:flex;gap:10px;align-items:flex-start"><span style="color:var(--green);font-weight:900">✓</span><span>Coverage across FX majors &amp; minors, gold, silver, indices and crypto</span></li>
          <li style="display:flex;gap:10px;align-items:flex-start"><span style="color:var(--green);font-weight:900">✓</span><span>Daily pre-session market outlook and weekly recap</span></li>
          <li style="display:flex;gap:10px;align-items:flex-start"><span style="color:var(--green);font-weight:900">✓</span><span>Priority Telegram channel with instant mobile alerts</span></li>
        </ul>
      `,
      pricing: { amount:'$49', period:'/month', note:'Billed monthly · Cancel anytime' },
      ctaLabel: 'Pay & Get Started',
      paymentMessage: 'Hi Lukie Fx, I would like to pay and get started with the Premium Trading Signals subscription ($49/month). Please send me the payment details.'
    },
    copy: {
      title: 'Copy Trading',
      lead: 'Automatically mirror the trades of consistently profitable, verified traders — no chart-watching required.',
      icon: '<svg viewBox="0 0 24 24"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
      body: `
        <p>Copy trading lets you replicate the exact positions of our top-performing traders in your own brokerage account. You stay in control of your risk, they handle the analysis and execution.</p>
        <ul style="display:grid;gap:12px;margin-top:22px">
          <li style="display:flex;gap:10px;align-items:flex-start"><span style="color:var(--green);font-weight:900">✓</span><span>Access to multiple verified strategy providers with public track records</span></li>
          <li style="display:flex;gap:10px;align-items:flex-start"><span style="color:var(--green);font-weight:900">✓</span><span>Adjustable risk multiplier — 0.1× up to 2× the source trade size</span></li>
          <li style="display:flex;gap:10px;align-items:flex-start"><span style="color:var(--green);font-weight:900">✓</span><span>Real-time position mirroring on your own broker account</span></li>
          <li style="display:flex;gap:10px;align-items:flex-start"><span style="color:var(--green);font-weight:900">✓</span><span>Full transparency — open positions, history and drawdown visible</span></li>
          <li style="display:flex;gap:10px;align-items:flex-start"><span style="color:var(--green);font-weight:900">✓</span><span>Works with all major MT4 / MT5 brokerage accounts</span></li>
        </ul>
      `,
      pricing: { amount:'$79', period:'/month', note:'Billed monthly · Cancel anytime' },
      ctaLabel: 'Pay & Get Started',
      paymentMessage: 'Hi Lukie Fx, I would like to pay and get started with Copy Trading ($79/month). Please send me the payment details.'
    },
    management: {
      title: 'Account Management Onboarding',
      lead: 'No linking fee — just share your trading account details so we can link you up.',
      onboarding: true,
      fields: [
        { id:'onb_name',    label:'Full name',                type:'text',     placeholder:'Your full name',              required:true },
        { id:'onb_email',   label:'Email',                    type:'email',    placeholder:'you@example.com',             required:true },
        { id:'onb_phone',   label:'Phone',                    type:'tel',      placeholder:'07XXXXXXXX',                  required:true },
        { id:'onb_country', label:'Country',                  type:'text',     placeholder:'e.g. Kenya',                  required:true },
        { id:'onb_broker',  label:'Broker',                   type:'text',     placeholder:'e.g. Exness, HFM, Deriv',     required:true },
        { id:'onb_account', label:'Account number',           type:'text',     placeholder:'Your MT5 account number',     required:true },
        { id:'onb_server',  label:'MT5 Server',               type:'text',     placeholder:'e.g. Exness-MT5Real8',        required:true },
        { id:'onb_balance', label:'Account balance (USD)',    type:'text',     placeholder:'e.g. 2000',                   required:true },
        { id:'onb_leverage',label:'Preferred leverage',       type:'text',     placeholder:'e.g. 1:500',                  required:false },
        { id:'onb_notes',   label:'Additional notes',         type:'textarea', placeholder:'Anything we should know?',    required:false, optional:true }
      ]
    },
    education: {
      title: 'Education & Mentorship',
      lead: 'Structured courses, live webinars and one-on-one mentorship — from zero to confident, independent trader.',
      icon: '<svg viewBox="0 0 24 24"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/></svg>',
      body: `
        <p>Our education track is designed to turn beginners into confident, self-sufficient traders. You'll learn the same price-action framework and risk model our own desk uses.</p>
        <ul style="display:grid;gap:12px;margin-top:22px">
          <li style="display:flex;gap:10px;align-items:flex-start"><span style="color:var(--green);font-weight:900">✓</span><span>Self-paced video course covering charts, structure, entries and risk</span></li>
          <li style="display:flex;gap:10px;align-items:flex-start"><span style="color:var(--green);font-weight:900">✓</span><span>Weekly live webinars with Q&amp;A and real-time chart walkthroughs</span></li>
          <li style="display:flex;gap:10px;align-items:flex-start"><span style="color:var(--green);font-weight:900">✓</span><span>1-on-1 mentorship calls — scheduled to fit your timezone</span></li>
          <li style="display:flex;gap:10px;align-items:flex-start"><span style="color:var(--green);font-weight:900">✓</span><span>Personal trade journal reviews and feedback</span></li>
          <li style="display:flex;gap:10px;align-items:flex-start"><span style="color:var(--green);font-weight:900">✓</span><span>Private student community with peer accountability</span></li>
        </ul>
      `,
      pricing: { amount:'$99', period:'/month', note:'Billed monthly · Cancel anytime' },
      ctaLabel: 'Pay & Get Started',
      paymentMessage: 'Hi Lukie Fx, I would like to pay and get started with Education & Mentorship ($99/month). Please send me the payment details.'
    },
    funded: {
      title: 'Funded Challenges',
      lead: 'Prove your skill, pass the evaluation, and trade a funded account with profit splits up to 90%.',
      icon: '<svg viewBox="0 0 24 24"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',
      body: `
        <p>Our funded challenge gives skilled traders access to serious capital without risking their own savings. Complete a two-phase evaluation, demonstrate consistency and risk discipline, and we hand you a live funded account.</p>
        <ul style="display:grid;gap:12px;margin-top:22px">
          <li style="display:flex;gap:10px;align-items:flex-start"><span style="color:var(--green);font-weight:900">✓</span><span>Two-phase evaluation with clear, published rules</span></li>
          <li style="display:flex;gap:10px;align-items:flex-start"><span style="color:var(--green);font-weight:900">✓</span><span>Account sizes from $10,000 up to $200,000</span></li>
          <li style="display:flex;gap:10px;align-items:flex-start"><span style="color:var(--green);font-weight:900">✓</span><span>Profit splits up to 90% on funded accounts</span></li>
          <li style="display:flex;gap:10px;align-items:flex-start"><span style="color:var(--green);font-weight:900">✓</span><span>No time limit on the challenge phase</span></li>
          <li style="display:flex;gap:10px;align-items:flex-start"><span style="color:var(--green);font-weight:900">✓</span><span>Fast payout cycles — bi-weekly withdrawals</span></li>
        </ul>
      `,
      pricing: { amount:'$149', period:'one-time', note:'Refundable with your first funded payout' },
      ctaLabel: 'Pay & Get Started',
      paymentMessage: 'Hi Lukie Fx, I would like to pay and start the Funded Challenge ($149 one-time). Please send me the payment details.'
    },
    risk: {
      title: 'Risk Management Tools',
      lead: 'Position sizing, drawdown alerts and portfolio heat maps — everything you need to protect your capital.',
      icon: '<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>',
      body: `
        <p>Most traders don't fail because of bad analysis — they fail because of poor risk management. Our toolkit gives you the numbers you need, at the moment you need them.</p>
        <ul style="display:grid;gap:12px;margin-top:22px">
          <li style="display:flex;gap:10px;align-items:flex-start"><span style="color:var(--green);font-weight:900">✓</span><span>Position-size calculator with automatic pip-value conversion</span></li>
          <li style="display:flex;gap:10px;align-items:flex-start"><span style="color:var(--green);font-weight:900">✓</span><span>Real-time drawdown monitor with configurable alerts</span></li>
          <li style="display:flex;gap:10px;align-items:flex-start"><span style="color:var(--green);font-weight:900">✓</span><span>Portfolio heat map showing exposure across all open positions</span></li>
          <li style="display:flex;gap:10px;align-items:flex-start"><span style="color:var(--green);font-weight:900">✓</span><span>Daily and weekly loss-limit tracking</span></li>
          <li style="display:flex;gap:10px;align-items:flex-start"><span style="color:var(--green);font-weight:900">✓</span><span>Correlation checker to avoid hidden double exposure</span></li>
        </ul>
      `,
      pricing: { amount:'$39', period:'/month', note:'Billed monthly · Cancel anytime' },
      ctaLabel: 'Pay & Get Started',
      paymentMessage: 'Hi Lukie Fx, I would like to pay and get started with the Risk Management Tools ($39/month). Please send me the payment details.'
    }
  };

  function renderServicePage(svc){
    return `
      <div class="page-inner page-inner-wide">
        ${pageHeader()}
        <div style="margin-bottom:48px">
          <div style="width:78px;height:78px;border-radius:20px;display:grid;place-items:center;background:linear-gradient(140deg,rgba(var(--glow-rgb),.22),rgba(var(--glow-rgb),.05));border:1px solid rgba(var(--glow-rgb),.36);color:var(--gold);margin-bottom:26px">
            <div style="width:38px;height:38px">${svc.icon.replace('<svg', '<svg style="width:100%;height:100%;stroke:currentColor;fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round"')}</div>
          </div>
          <h1 style="font-size:clamp(1.7rem,5vw,3.2rem);margin-bottom:16px;color:var(--txt)">${svc.title}</h1>
          <p style="font-size:1.05rem;color:var(--muted);max-width:720px">${svc.lead}</p>
        </div>
        <div class="service-body" style="display:grid;grid-template-columns:1.4fr 1fr;gap:44px;align-items:start">
          <div style="color:var(--muted);font-size:1rem">${svc.body}</div>
          <aside style="position:sticky;top:36px;padding:32px 28px;border-radius:var(--radius);background:var(--card);border:1px solid var(--line)">
            <h4 style="font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);font-weight:800;margin-bottom:14px">Pricing</h4>
            <div style="font-family:'Space Grotesk',sans-serif;font-size:2.6rem;font-weight:700;letter-spacing:-.03em;line-height:1;color:var(--gold);margin-bottom:6px">
              ${svc.pricing.amount}${svc.pricing.period ? `<small style="font-size:.9rem;color:var(--muted);font-weight:500">${svc.pricing.period}</small>` : ''}
            </div>
            <p style="color:var(--muted);font-size:.86rem;margin-bottom:24px">${svc.pricing.note}</p>
            <a href="#" class="btn btn-wa btn-block" style="margin-bottom:12px" data-action="whatsapp" data-message="${svc.paymentMessage}">${svc.ctaLabel}</a>
            <a href="#" class="btn btn-ghost btn-block" data-action="whatsapp" data-message="Hi Lukie Fx, I have a question about ${svc.title}.">Ask a Question</a>
          </aside>
        </div>
      </div>
    `;
  }

  function renderOnboardingPage(svc){
    const fields = svc.fields.map(f => {
      const optional = f.optional ? ' <span class="optional">(optional)</span>' : '';
      if (f.type === 'textarea'){
        return `<div class="form-field"><label for="${f.id}">${f.label}${optional}</label><textarea id="${f.id}" name="${f.id}" placeholder="${f.placeholder}" ${f.required ? 'required' : ''}></textarea></div>`;
      }
      return `<div class="form-field"><label for="${f.id}">${f.label}${optional}</label><input type="${f.type}" id="${f.id}" name="${f.id}" placeholder="${f.placeholder}" ${f.required ? 'required' : ''} /></div>`;
    }).join('');

    return `
      <div class="page-inner">
        ${pageHeader()}
        <div class="form-card">
          <h1>${svc.title}</h1>
          <p class="form-sub">${svc.lead}</p>
          <form id="onbForm" novalidate>
            ${fields}
            <button type="submit" class="form-submit">Submit Details</button>
            <div class="form-success" id="onbSuccess">✅ Thanks! We've received your details. Our team will reach out within 24 hours to link your account.</div>
          </form>
        </div>
      </div>
    `;
  }

  function bindOnboardingForm(container){
    const form = container.querySelector('#onbForm');
    const success = container.querySelector('#onbSuccess');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.checkValidity()){ form.reportValidity(); return; }

      const submitBtn = form.querySelector('.form-submit');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Submitting…';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        form.reset();
        success.classList.add('show');
        setTimeout(() => success.classList.remove('show'), 8000);
      }, 1200);
    });
  }

  function openService(key){
    const svc = SERVICES[key];
    if (!svc) return;
    lastScrollY = window.scrollY;

    if (svc.onboarding){
      openPage(renderOnboardingPage(svc), { onReady: bindOnboardingForm });
    } else {
      openPage(renderServicePage(svc));
    }
  }

  const LEGAL = {
    privacy: {
      title: 'Privacy Policy',
      subtitle: `How ${CONFIG.COMPANY_NAME} collects, uses and protects your personal information.`,
      content: `
        <p><strong>Last updated:</strong> <span class="placeholder">${CONFIG.EFFECTIVE_DATE}</span></p>
        <h2>1. Introduction</h2>
        <p>${CONFIG.COMPANY_NAME} ("we", "our", "us") is committed to protecting the privacy of our users. This Privacy Policy explains how we collect, use, disclose and safeguard your information.</p>
        <h2>2. Information We Collect</h2>
        <h3>Personal Information You Provide</h3>
        <ul>
          <li>Full name, email address and phone number</li>
          <li>Country of residence and physical address</li>
          <li>Trading account details (broker, account number, MT4/MT5 server)</li>
          <li>Payment information when subscribing to paid services</li>
        </ul>
        <h3>Information Collected Automatically</h3>
        <ul>
          <li>IP address and approximate geographic location</li>
          <li>Browser type, device type and operating system</li>
          <li>Pages visited, time spent and referring URL</li>
          <li>Cookies and similar tracking technologies</li>
        </ul>
        <h2>3. How We Use Your Information</h2>
        <ul>
          <li>To provide and maintain our trading signals, mentorship and account management services</li>
          <li>To verify your identity and comply with AML requirements</li>
          <li>To process payments and send transaction confirmations</li>
          <li>To respond to your inquiries and provide customer support</li>
        </ul>
        <h2>4. Information Sharing</h2>
        <p>We do <strong>not</strong> sell, trade or rent your personal information to third parties.</p>
        <h2>5. Data Security</h2>
        <p>We implement industry-standard security measures to protect your personal information.</p>
        <h2>6. Your Rights</h2>
        <p>Contact us at <span class="placeholder">${CONFIG.EMAIL}</span> to exercise your data rights.</p>
        <h2>7. Contact Us</h2>
        <ul>
          <li>Email: <span class="placeholder">${CONFIG.EMAIL}</span></li>
          <li>WhatsApp: <span class="placeholder">${CONFIG.PHONE_DISPLAY}</span></li>
          <li>Address: <span class="placeholder">${CONFIG.COMPANY_ADDRESS}</span></li>
        </ul>
        <div class="page-last-updated">Last updated: <span class="placeholder">${CONFIG.EFFECTIVE_DATE}</span></div>
      `
    },
    terms: {
      title: 'Terms of Service',
      subtitle: `The rules and conditions that govern your use of ${CONFIG.COMPANY_NAME} services.`,
      content: `
        <p><strong>Effective date:</strong> <span class="placeholder">${CONFIG.EFFECTIVE_DATE}</span></p>
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using ${CONFIG.COMPANY_NAME}, you agree to be bound by these Terms of Service.</p>
        <h2>2. Eligibility</h2>
        <p>You must be at least 18 years old and legally capable of entering into binding contracts.</p>
        <h2>3. Nature of Services</h2>
        <p>${CONFIG.COMPANY_NAME} provides educational content, market analysis, trading signals and mentorship. We are <strong>not</strong> a broker or financial advisor.</p>
        <h2>4. No Financial Advice</h2>
        <p>All content is for educational and informational purposes only.</p>
        <h2>5. Risk Disclosure</h2>
        <p>Trading carries a high level of risk and you could lose some or all of your capital.</p>
        <h2>6. Account Registration</h2>
        <ul>
          <li>Provide accurate information during registration</li>
          <li>Maintain the confidentiality of your credentials</li>
          <li>We may suspend accounts that violate these terms</li>
        </ul>
        <h2>7. Payment and Refunds</h2>
        <p>Subscriptions are billed monthly. Refunds per our <a href="#" data-page="refund">Refund Policy</a>. Payments accepted via <span class="placeholder">${CONFIG.PAYMENT_METHODS}</span>.</p>
        <h2>8. Governing Law</h2>
        <p>These Terms shall be governed by the laws of <span class="placeholder">[YOUR_JURISDICTION]</span>.</p>
        <h2>9. Contact</h2>
        <p>Questions? Contact us at <span class="placeholder">${CONFIG.EMAIL}</span>.</p>
        <div class="page-last-updated">Effective date: <span class="placeholder">${CONFIG.EFFECTIVE_DATE}</span></div>
      `
    },
    risk: {
      title: 'Risk Disclosure',
      subtitle: 'Important information about the risks of trading leveraged financial instruments.',
      content: `
        <p><strong>Effective date:</strong> <span class="placeholder">${CONFIG.EFFECTIVE_DATE}</span></p>
        <h2>⚠️ High Risk Warning</h2>
        <p>Trading forex, CFDs, commodities, indices and cryptocurrencies carries a <strong>high level of risk</strong>. <strong>You could sustain a loss of some or all of your initial investment.</strong></p>
        <h2>Leverage Risk</h2>
        <p>Leverage amplifies both profits and losses.</p>
        <h2>Market Risk</h2>
        <p>Markets are volatile and unpredictable.</p>
        <h2>Liquidity Risk</h2>
        <p>Liquidity may dry up during high volatility.</p>
        <h2>Technology Risk</h2>
        <p>Platforms may experience outages or execution delays.</p>
        <h2>Third-Party Risk</h2>
        <p>${CONFIG.COMPANY_NAME} provides education only. We do not execute trades or hold funds.</p>
        <h2>No Guarantee of Profit</h2>
        <p>Past performance is not indicative of future results.</p>
        <h2>Seek Independent Advice</h2>
        <p>Consult a professional if you do not understand these risks.</p>
        <div class="page-last-updated">Effective date: <span class="placeholder">${CONFIG.EFFECTIVE_DATE}</span></div>
      `
    },
    refund: {
      title: 'Refund Policy',
      subtitle: 'Our policy on cancellations, refunds and subscription billing.',
      content: `
        <p><strong>Effective date:</strong> <span class="placeholder">${CONFIG.EFFECTIVE_DATE}</span></p>
        <h2>Subscription Services</h2>
        <p>Billed monthly in advance.</p>
        <h2>Refund Eligibility</h2>
        <ul>
          <li><strong>Within 7 days of first subscription:</strong> Full refund if not satisfied</li>
          <li><strong>Duplicate payment:</strong> Refunded in full</li>
          <li><strong>Service not delivered:</strong> Full refund issued</li>
        </ul>
        <h2>Non-Refundable Situations</h2>
        <ul>
          <li>After the 7-day refund window</li>
          <li>Trading losses or dissatisfaction with outcomes</li>
          <li>Account termination due to violation of Terms</li>
        </ul>
        <h2>Funded Challenges</h2>
        <p>Refundable <strong>only after</strong> you pass the evaluation and receive your first payout.</p>
        <h2>How to Request a Refund</h2>
        <p>Contact us at <span class="placeholder">${CONFIG.EMAIL}</span> or WhatsApp <span class="placeholder">${CONFIG.PHONE_DISPLAY}</span>.</p>
        <h2>Processing Time</h2>
        <p>Approved refunds processed in 5–10 business days.</p>
        <div class="page-last-updated">Effective date: <span class="placeholder">${CONFIG.EFFECTIVE_DATE}</span></div>
      `
    },
    help: {
      title: 'Help Center',
      subtitle: 'Quick answers to common questions and ways to reach us.',
      content: `
        <h2>📞 Contact Support</h2>
        <p>Available <span class="placeholder">${CONFIG.SUPPORT_HOURS}</span>.</p>
        <ul>
          <li><strong>WhatsApp:</strong> <span class="placeholder">${CONFIG.PHONE_DISPLAY}</span> — fastest response</li>
          <li><strong>Email:</strong> <span class="placeholder">${CONFIG.EMAIL}</span></li>
          <li><strong>Telegram:</strong> <span class="placeholder">${CONFIG.TELEGRAM_LINK}</span></li>
        </ul>
        <h2>🚀 Getting Started</h2>
        <ul>
          <li>1. Join our Telegram community</li>
          <li>2. Explore service offerings</li>
          <li>3. Complete onboarding</li>
          <li>4. Follow daily market updates</li>
        </ul>
        <h2>💳 Payment &amp; Billing</h2>
        <p>We accept <span class="placeholder">${CONFIG.PAYMENT_METHODS}</span>. Minimum deposit <span class="placeholder">${CONFIG.MIN_DEPOSIT}</span>.</p>
        <h2>🎓 Common Questions</h2>
        <p><strong>Do I need a broker account?</strong><br>Yes, our strategies work on your own broker account.</p>
        <p><strong>Can I cancel anytime?</strong><br>Yes. All subscriptions are month-to-month.</p>
        <p><strong>Do you guarantee profits?</strong><br>No. Trading involves risk.</p>
        <div class="page-last-updated">Need more help? WhatsApp us for a quick reply.</div>
      `
    }
  };

  function openLegalPage(key){
    const page = LEGAL[key];
    if (!page) return;
    lastScrollY = window.scrollY;
    openPage(`
      <div class="page-inner">
        ${pageHeader()}
        <h1 class="page-title">${page.title}</h1>
        <p class="page-subtitle">${page.subtitle}</p>
        <div class="page-content">${page.content}</div>
      </div>
    `);
  }

  function renderRegisterPage(){
    return `
      <div class="page-inner">
        ${pageHeader().replace('Back to Home', 'Back to home')}
        <div class="form-card">
          <h1>Open Your Account</h1>
          <p class="form-sub">Join ${CONFIG.COMPANY_NAME} and get access to premium signals, mentorship and market analysis. Already have an account? <a href="#" data-page="login">Login here</a>.</p>
          <form id="registerForm" novalidate>
            <div class="form-divider"><span>Personal Details</span></div>
            <div class="form-row-2">
              <div class="form-field"><label for="reg_first">First name</label><input type="text" id="reg_first" placeholder="John" required /></div>
              <div class="form-field"><label for="reg_last">Last name</label><input type="text" id="reg_last" placeholder="Doe" required /></div>
            </div>
            <div class="form-field"><label for="reg_email">Email address</label><input type="email" id="reg_email" placeholder="you@example.com" required /></div>
            <div class="form-row-2">
              <div class="form-field"><label for="reg_phone">Phone number</label><input type="tel" id="reg_phone" placeholder="+254 700 000 000" required /></div>
              <div class="form-field"><label for="reg_country">Country</label><input type="text" id="reg_country" placeholder="Kenya" required /></div>
            </div>
            <div class="form-divider"><span>Account Preferences</span></div>
            <div class="form-row-2">
              <div class="form-field">
                <label for="reg_type">Account type</label>
                <select id="reg_type" required>
                  <option value="">Select account type</option>
                  <option>Standard Account</option>
                  <option>ECN / Raw Spread</option>
                  <option>Cent Account</option>
                  <option>Demo / Practice</option>
                </select>
              </div>
              <div class="form-field">
                <label for="reg_leverage">Preferred leverage</label>
                <select id="reg_leverage">
                  <option value="">Select leverage</option>
                  <option>1:100</option><option>1:200</option><option>1:500</option><option>1:1000</option>
                </select>
              </div>
            </div>
            <div class="form-field">
              <label for="reg_experience">Trading experience</label>
              <select id="reg_experience">
                <option value="">Select your experience</option>
                <option>Beginner (0–1 years)</option>
                <option>Intermediate (1–3 years)</option>
                <option>Advanced (3–5 years)</option>
                <option>Professional (5+ years)</option>
              </select>
            </div>
            <div class="form-field">
              <label for="reg_service">Primary service of interest</label>
              <select id="reg_service" required>
                <option value="">Select a service</option>
                <option>Premium Trading Signals</option>
                <option>Copy Trading</option>
                <option>Account Management</option>
                <option>Education &amp; Mentorship</option>
                <option>Funded Challenges</option>
                <option>Risk Management Tools</option>
              </select>
            </div>
            <div class="form-divider"><span>Security</span></div>
            <div class="form-row-2">
              <div class="form-field"><label for="reg_password">Password</label><input type="password" id="reg_password" placeholder="Min. 8 characters" minlength="8" required /></div>
              <div class="form-field"><label for="reg_confirm">Confirm password</label><input type="password" id="reg_confirm" placeholder="Re-enter password" minlength="8" required /></div>
            </div>
            <div class="form-checkbox">
              <input type="checkbox" id="reg_terms" required />
              <label for="reg_terms">I agree to the <a href="#" data-page="terms">Terms of Service</a>, <a href="#" data-page="privacy">Privacy Policy</a> and <a href="#" data-page="risk">Risk Disclosure</a>.</label>
            </div>
            <div class="form-checkbox">
              <input type="checkbox" id="reg_newsletter" />
              <label for="reg_newsletter">Send me weekly market analysis, trade ideas and platform updates.</label>
            </div>
            <button type="submit" class="form-submit">Create Account</button>
            <div class="form-success" id="registerSuccess">✅ Account created! Please check your email to verify your address.</div>
          </form>
        </div>
      </div>
    `;
  }

  function renderLoginPage(){
    return `
      <div class="page-inner">
        ${pageHeader().replace('Back to Home', 'Back to home')}
        <div class="form-card">
          <h1>Welcome Back</h1>
          <p class="form-sub">Sign in to access your dashboard, signals and account details. New here? <a href="#" data-page="register">Open an account</a>.</p>
          <form id="loginForm" novalidate>
            <div class="form-field"><label for="log_email">Email address</label><input type="email" id="log_email" placeholder="you@example.com" required /></div>
            <div class="form-field"><label for="log_password">Password</label><input type="password" id="log_password" placeholder="Your password" required /></div>
            <div class="form-checkbox">
              <input type="checkbox" id="log_remember" />
              <label for="log_remember">Remember me on this device</label>
            </div>
            <button type="submit" class="form-submit">Sign In</button>
            <div class="form-success" id="loginSuccess">✅ Sign-in successful! (demo only)</div>
            <p style="text-align:center;color:var(--muted);font-size:.86rem;margin-top:18px">
              Forgot password? <a href="#" data-action="whatsapp" data-message="Hi Lukie Fx, I forgot my password and need help resetting it." style="color:var(--gold);text-decoration:underline">Contact support</a>.
            </p>
          </form>
        </div>
      </div>
    `;
  }

  function bindRegisterForm(container){
    const form = container.querySelector('#registerForm');
    const success = container.querySelector('#registerSuccess');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const pwd = form.querySelector('#reg_password').value;
      const confirm = form.querySelector('#reg_confirm').value;
      if (pwd !== confirm){ alert('Passwords do not match. Please check and try again.'); return; }
      if (!form.checkValidity()){ form.reportValidity(); return; }

      const btn = form.querySelector('.form-submit');
      const originalText = btn.textContent;
      btn.textContent = 'Creating account…';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        form.reset();
        success.classList.add('show');
        setTimeout(() => success.classList.remove('show'), 10000);
      }, 1500);
    });
  }

  function bindLoginForm(container){
    const form = container.querySelector('#loginForm');
    const success = container.querySelector('#loginSuccess');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.checkValidity()){ form.reportValidity(); return; }

      const btn = form.querySelector('.form-submit');
      const originalText = btn.textContent;
      btn.textContent = 'Signing in…';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        success.classList.add('show');
        setTimeout(() => success.classList.remove('show'), 5000);
      }, 1200);
    });
  }

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-page]');
    if (!el) return;
    e.preventDefault();
    const page = el.dataset.page;
    lastScrollY = window.scrollY;

    if (page === 'register'){
      openPage(renderRegisterPage(), { onReady: bindRegisterForm });
    } else if (page === 'login'){
      openPage(renderLoginPage(), { onReady: bindLoginForm });
    } else if (LEGAL[page]){
      openLegalPage(page);
    }
  });

  document.addEventListener('click', e => {
    const card = e.target.closest('.card[data-service]');
    if (!card) return;
    openService(card.dataset.service);
  });

  window.LFX = window.LFX || {};
  LFX.pages = {
    init(){},
    openService,
    openLegalPage,
    close: closePage,
    SERVICES,
    LEGAL
  };
})();
