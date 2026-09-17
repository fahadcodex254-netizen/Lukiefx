/**
 * LUKIE FX — Page Overlay System + URL Router
 * Back / forward / refresh work correctly.
 */
(function(){
  const { CONFIG, $, $$ } = LFX;

  const overlay = $('#pageOverlay');
  const overlayContent = $('#pageOverlayContent');

  /* ============================================================
     ROUTER
  ============================================================ */
  const router = (() => {
    const routes = {};
    let currentState = null;

    function register(page, handler){
      routes[page] = handler;
    }

    function safePush(state, hash){
      const url = hash ? '#' + hash : location.pathname + location.search;
      try {
        history.pushState(state, '', url);
      } catch(err){
        try {
          if (hash) location.hash = hash;
          else if (location.hash) location.hash = '';
        } catch(e){ /* ignore */ }
      }
    }

    function safeReplace(state, hash){
      const url = hash ? '#' + hash : location.pathname + location.search;
      try {
        history.replaceState(state, '', url);
      } catch(err){ /* silent */ }
    }

    function navigate(state, hash){
      if (currentState &&
          currentState.page === state.page &&
          currentState.key === state.key &&
          currentState.id === state.id){
        return;
      }
      safePush(state, hash);
      dispatch(state);
    }

    function dispatch(state){
      currentState = state;
      const page = (state && state.page) || 'home';
      const handler = routes[page] || routes.home;
      if (handler){
        try {
          handler(state || { page: 'home' });
        } catch(err){
          console.error('Route handler error for "' + page + '":', err);
        }
      }
    }

    function parseHash(hash){
      if (!hash) return { page: 'home' };
      if (hash.startsWith('service/')) return { page: 'service', key: hash.slice(8) };
      if (hash.startsWith('legal/'))   return { page: 'legal',   key: hash.slice(6) };
      if (hash === 'register') return { page: 'register' };
      if (hash === 'login')    return { page: 'login' };
      if (hash === 'admin')    return { page: 'admin' };
      return { page: 'anchor', id: hash };
    }

    function init(){
      const hash = location.hash.slice(1);
      const state = parseHash(hash);
      safeReplace(state, hash);
      currentState = state;
      dispatch(state);
    }

    window.addEventListener('popstate', (e) => {
      const state = e.state || parseHash(location.hash.slice(1));
      dispatch(state);
    });

    return { register, navigate, init, getState: () => currentState };
  })();

  window.LFX = window.LFX || {};
  LFX.router = router;

  /* ============================================================
     PAGE OVERLAY — render / close
  ============================================================ */
  function renderOverlay(html, opts = {}){
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

  function actuallyClosePage(){
    if (!overlay) return;
    overlay.classList.remove('open');
    overlayContent.innerHTML = '';
    document.body.style.overflow = '';
  }

  function closePage(){
    router.navigate({ page: 'home' }, '');
  }

  function pageHeader(){
    return `
      <button class="page-back" data-close-page type="button">
        <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Home
      </button>
    `;
  }

  /* ============================================================
     SERVICE CONTENT
  ============================================================ */
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
      paymentMessage: 'Hi LUKIE FX, I would like to pay and get started with the Premium Trading Signals subscription ($49/month). Please send me the payment details.'
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
      paymentMessage: 'Hi LUKIE FX, I would like to pay and get started with Copy Trading ($79/month). Please send me the payment details.'
    },
    management: {
      title: 'Account Management Onboarding',
      lead: 'No linking fee — just share your trading account details so LUKIE can link you up.',
      onboarding: true,
      fields: [
        { id:'onb_name',     label:'Full name',              type:'text',     placeholder:'Your full name',              required:true },
        { id:'onb_email',    label:'Email',                  type:'email',    placeholder:'you@example.com',             required:true },
        { id:'onb_phone',    label:'Phone',                  type:'tel',      placeholder:'07XXXXXXXX',                  required:true, digitsOnly:true },
        { id:'onb_country',  label:'Country',                type:'text',     placeholder:'e.g. Kenya',                  required:true },
        { id:'onb_broker',   label:'Broker',                 type:'text',     placeholder:'e.g. Exness, HFM, Deriv',     required:true },
        { id:'onb_account',  label:'MT5 Account Number',     type:'text',     placeholder:'Your MT5 account number',     required:true, digitsOnly:true },
        { id:'onb_server',   label:'MT5 Server',             type:'text',     placeholder:'e.g. Exness-MT5Real8',        required:true },
        { id:'onb_password', label:'MT5 Password',           type:'password', placeholder:'Enter MT5 Password',          required:true },
        { id:'onb_balance',  label:'Account balance (USD)',  type:'text',     placeholder:'e.g. 2000',                   required:true },
        { id:'onb_leverage', label:'Preferred leverage',     type:'text',     placeholder:'e.g. 1:500',                  required:false },
        { id:'onb_notes',    label:'Additional notes',       type:'textarea', placeholder:'Anything we should know?',    required:false, optional:true }
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
          <li style="display:flex;gap:10px;align-items:flex-start"><span style="color:var(--green);font-weight:900">✓</span><span>Lifetime access to all course material updates</span></li>
        </ul>
      `,
      pricing: { amount:'$99', period:'/month', note:'Billed monthly · Cancel anytime' },
      ctaLabel: 'Pay & Get Started',
      paymentMessage: 'Hi LUKIE FX, I would like to pay and get started with Education & Mentorship ($99/month). Please send me the payment details.'
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
          <li style="display:flex;gap:10px;align-items:flex-start"><span style="color:var(--green);font-weight:900">✓</span><span>Free retry on your first failed attempt</span></li>
        </ul>
      `,
      pricing: { amount:'$149', period:'one-time', note:'Refundable with your first funded payout' },
      ctaLabel: 'Pay & Get Started',
      paymentMessage: 'Hi LUKIE FX, I would like to pay and start the Funded Challenge ($149 one-time). Please send me the payment details.'
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
      paymentMessage: 'Hi LUKIE FX, I would like to pay and get started with the Risk Management Tools ($39/month). Please send me the payment details.'
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
            <a href="#" class="btn btn-ghost btn-block" data-action="whatsapp" data-message="Hi LUKIE FX, I have a question about ${svc.title}.">Ask a Question</a>
          </aside>
        </div>
      </div>
    `;
  }

  /* ============================================================
     ONBOARDING FORM — fields builder
  ============================================================ */
  function buildFieldHtml(f){
    const optional = f.optional ? ' <span class="optional">(optional)</span>' : '';
    const required = f.required ? 'required' : '';
    const digitAttrs = f.digitsOnly
      ? ' inputmode="numeric" pattern="[0-9]*" title="Please enter only digits"'
      : '';

    if (f.type === 'textarea'){
      return `<div class="form-field">
        <label for="${f.id}">${f.label}${optional}</label>
        <textarea id="${f.id}" name="${f.id}" placeholder="${f.placeholder}" ${required}></textarea>
      </div>`;
    }

    if (f.type === 'password'){
      return `<div class="form-field">
        <label for="${f.id}">${f.label}${optional}</label>
        <div class="password-wrapper">
          <input type="password" id="${f.id}" name="${f.id}" placeholder="${f.placeholder}" ${required} />
          <button type="button" class="password-toggle" onclick="togglePassword('${f.id}', this)" aria-label="Toggle password visibility">
            <svg class="eye-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <svg class="eye-closed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
          </button>
        </div>
      </div>`;
    }

    return `<div class="form-field">
      <label for="${f.id}">${f.label}${optional}</label>
      <input type="${f.type}" id="${f.id}" name="${f.id}" placeholder="${f.placeholder}" ${required}${digitAttrs} />
    </div>`;
  }

  function renderOnboardingPage(svc){
    const fields = svc.fields.map(buildFieldHtml).join('');

    return `
      <div class="page-inner">
        ${pageHeader()}
        <div class="form-card">
          <h1>${svc.title}</h1>
          <p class="form-sub">${svc.lead}</p>
          <form id="onbForm" novalidate>
            ${fields}
            <div class="form-checkbox">
              <input type="checkbox" id="onb_confirm" name="onb_confirm" value="yes" required />
              <label for="onb_confirm">I confirm the account details above are mine and accurate, I understand trading involves risk of loss, I will not interfere with trades on this account, and I agree to the <a href="#" data-page="terms">Terms &amp; Conditions</a>, <a href="#" data-page="privacy">Privacy Policy</a> and <a href="#" data-page="risk">Risk Disclaimer</a>.</label>
            </div>
            <button type="submit" class="form-submit" id="onbSubmit" disabled>Submit account details</button>
            <div class="form-success" id="onbSuccess">✅ Thanks! We've received your details. Our team will reach out within 24 hours to link your account.</div>
          </form>
        </div>
      </div>
    `;
  }

  function bindOnboardingForm(container){
    const form = container.querySelector('#onbForm');
    const success = container.querySelector('#onbSuccess');
    const confirmBox = form ? form.querySelector('#onb_confirm') : null;
    const submitBtn = form ? form.querySelector('#onbSubmit') : null;

    if (!form) return;

    // ---- Submit button enabled only when checkbox is ticked ----
    if (confirmBox && submitBtn){
      const updateSubmitState = () => {
        submitBtn.disabled = !confirmBox.checked;
      };
      confirmBox.addEventListener('change', updateSubmitState);
      // Set initial state (in case it's ever pre-checked)
      updateSubmitState();
    }

    // Apply digits-only restriction to any input with inputmode="numeric"
    form.querySelectorAll('input[inputmode="numeric"]').forEach(input => {
      input.addEventListener('input', function(){
        this.value = this.value.replace(/[^0-9]/g, '');
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();

      // Extra safety: block submit if checkbox isn't ticked
      if (confirmBox && !confirmBox.checked){
        alert('Please tick the confirmation box before submitting.');
        confirmBox.focus();
        return;
      }

      // Standard validity check
      if (!form.checkValidity()){ form.reportValidity(); return; }

      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Submitting…';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        form.reset();
        // After reset, re-disable the button (since checkbox is now unticked)
        if (confirmBox) confirmBox.checked = false;
        if (submitBtn) submitBtn.disabled = true;
        success.classList.add('show');
        setTimeout(() => success.classList.remove('show'), 8000);
      }, 1200);
    });
  }

  function renderServiceRoute(key){
    const svc = SERVICES[key];
    if (!svc) return actuallyClosePage();
    if (svc.onboarding) renderOverlay(renderOnboardingPage(svc), { onReady: bindOnboardingForm });
    else renderOverlay(renderServicePage(svc));
  }

  /* ============================================================
     LEGAL PAGES
  ============================================================ */
  const LEGAL = {
    privacy: {
      title: 'Privacy Policy',
      subtitle: `How ${CONFIG.COMPANY_NAME} collects, uses and protects your personal information.`,
      content: `
        <p><strong>Last updated:</strong> ${CONFIG.EFFECTIVE_DATE}</p>
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
        <p>We do <strong>not</strong> sell, trade or rent your personal information to third parties. We may share your information only with service providers who help us operate, legal authorities when required by law, and successors in the event of a merger or acquisition.</p>
        <h2>5. Data Security</h2>
        <p>We implement industry-standard security measures to protect your personal information, including SSL/TLS encryption for data in transit and restricted access on a need-to-know basis.</p>
        <h2>6. Your Rights</h2>
        <p>Depending on your jurisdiction, you may have the right to access, correct or delete your personal information, and to opt out of marketing communications. Contact us at ${CONFIG.EMAIL} to exercise these rights.</p>
        <h2>7. Contact Us</h2>
        <ul>
          <li>Email: ${CONFIG.EMAIL}</li>
          <li>Phone: ${CONFIG.PHONE_DISPLAY}</li>
          <li>Address: ${CONFIG.COMPANY_ADDRESS}</li>
        </ul>
        <div class="page-last-updated">Last updated: ${CONFIG.EFFECTIVE_DATE}</div>
      `
    },
    terms: {
      title: 'Terms of Service',
      subtitle: `The rules and conditions that govern your use of ${CONFIG.COMPANY_NAME} services.`,
      content: `
        <p><strong>Effective date:</strong> ${CONFIG.EFFECTIVE_DATE}</p>
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using the ${CONFIG.COMPANY_NAME} website and services, you agree to be bound by these Terms of Service.</p>
        <h2>2. Eligibility</h2>
        <p>You must be at least 18 years old and legally capable of entering into binding contracts to use our services.</p>
        <h2>3. Nature of Services</h2>
        <p>${CONFIG.COMPANY_NAME} provides educational content, market analysis, trading signals and mentorship. We are <strong>not</strong> a broker, dealer or financial advisor. We do not hold client funds, execute trades on your behalf, or provide personalized investment advice.</p>
        <h2>4. No Financial Advice</h2>
        <p>All content, signals, analysis and mentorship provided by ${CONFIG.COMPANY_NAME} are for educational and informational purposes only.</p>
        <h2>5. Risk Disclosure</h2>
        <p>Trading foreign exchange, CFDs, commodities and cryptocurrencies carries a high level of risk and may not be suitable for all investors. You could lose some or all of your initial capital.</p>
        <h2>6. Account Registration</h2>
        <ul>
          <li>You agree to provide accurate, current and complete information during registration</li>
          <li>You are responsible for maintaining the confidentiality of your account credentials</li>
          <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
        </ul>
        <h2>7. Payment and Refunds</h2>
        <p>Subscription fees are billed in advance on a monthly basis. All payments are non-refundable except as described in our <a href="#" data-page="refund">Refund Policy</a>. Payments are accepted via ${CONFIG.PAYMENT_METHODS}.</p>
        <h2>8. Intellectual Property</h2>
        <p>All content on this website is the property of ${CONFIG.COMPANY_NAME} and is protected by international copyright laws.</p>
        <h2>9. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, ${CONFIG.COMPANY_NAME} shall not be liable for any direct, indirect, incidental, consequential or punitive damages arising from your use of our services.</p>
        <h2>10. Governing Law</h2>
        <p>These Terms shall be governed by and construed in accordance with the laws of Kenya.</p>
        <h2>11. Contact</h2>
        <p>Questions about these terms? Contact us at ${CONFIG.EMAIL}.</p>
        <div class="page-last-updated">Effective date: ${CONFIG.EFFECTIVE_DATE}</div>
      `
    },
    risk: {
      title: 'Risk Disclosure',
      subtitle: 'Important information about the risks of trading leveraged financial instruments.',
      content: `
        <p><strong>Effective date:</strong> ${CONFIG.EFFECTIVE_DATE}</p>
        <h2>⚠️ High Risk Warning</h2>
        <p>Trading foreign exchange (Forex), Contracts for Difference (CFDs), commodities, indices and cryptocurrencies carries a <strong>high level of risk</strong> and may not be suitable for all investors. <strong>You could sustain a loss of some or all of your initial investment.</strong> Do not invest money that you cannot afford to lose.</p>
        <h2>Leverage Risk</h2>
        <p>Leverage allows you to control a large position with a relatively small amount of capital. While it can amplify profits, it can equally amplify losses.</p>
        <h2>Market Risk</h2>
        <p>Financial markets are volatile and unpredictable. Prices can move rapidly against your position due to economic news, geopolitical events, central bank decisions and other factors.</p>
        <h2>Liquidity Risk</h2>
        <p>During periods of high volatility or market stress, liquidity may dry up, causing wider spreads, slippage and difficulty closing positions at your desired price.</p>
        <h2>Technology Risk</h2>
        <p>Trading platforms may experience outages, connectivity issues or execution delays. Stop-loss orders do not guarantee you will be closed at your specified level.</p>
        <h2>Third-Party Risk</h2>
        <p>${CONFIG.COMPANY_NAME} provides educational content and analysis only. We do not execute trades or hold client funds.</p>
        <h2>No Guarantee of Profit</h2>
        <p>Past performance is not indicative of future results. We make no guarantee that you will profit from using our services.</p>
        <h2>Seek Independent Advice</h2>
        <p>If you do not fully understand these risks, please seek independent professional advice before trading.</p>
        <div class="page-last-updated">Effective date: ${CONFIG.EFFECTIVE_DATE}</div>
      `
    },
    refund: {
      title: 'Refund Policy',
      subtitle: 'Our policy on cancellations, refunds and subscription billing.',
      content: `
        <p><strong>Effective date:</strong> ${CONFIG.EFFECTIVE_DATE}</p>
        <h2>Subscription Services</h2>
        <p>All subscription-based services are billed in advance on a monthly recurring basis.</p>
        <h2>Refund Eligibility</h2>
        <ul>
          <li><strong>Within 7 days of first subscription:</strong> Full refund if you're not satisfied</li>
          <li><strong>Duplicate payment:</strong> The duplicate charge will be refunded in full</li>
          <li><strong>Service not delivered:</strong> Full refund will be issued</li>
        </ul>
        <h2>Non-Refundable Situations</h2>
        <ul>
          <li>After the 7-day refund window has passed</li>
          <li>Trading losses or dissatisfaction with outcomes</li>
          <li>Failure to use the service during your subscription period</li>
          <li>Account termination due to violation of our Terms of Service</li>
        </ul>
        <h2>Funded Challenges</h2>
        <p>The Funded Challenge fee is refundable <strong>only after</strong> you successfully pass the evaluation and receive your first payout.</p>
        <h2>How to Request a Refund</h2>
        <p>Contact us at ${CONFIG.EMAIL} or via WhatsApp at ${CONFIG.PHONE_DISPLAY}.</p>
        <h2>Processing Time</h2>
        <p>Approved refunds are processed within 5–10 business days.</p>
        <div class="page-last-updated">Effective date: ${CONFIG.EFFECTIVE_DATE}</div>
      `
    },
    help: {
      title: 'Help Center',
      subtitle: 'Quick answers to common questions and ways to reach us.',
      content: `
        <h2>📞 Contact Support</h2>
        <p>Our team is available ${CONFIG.SUPPORT_HOURS} and typically responds within a few hours.</p>
        <ul>
          <li><strong>WhatsApp:</strong> ${CONFIG.PHONE_DISPLAY} — fastest response</li>
          <li><strong>Email:</strong> ${CONFIG.EMAIL} — for detailed inquiries</li>
          <li><strong>Telegram:</strong> ${CONFIG.TELEGRAM_LINK} — join our community</li>
        </ul>
        <h2>🚀 Getting Started</h2>
        <ul>
          <li>1. Join our free Telegram community to see sample content</li>
          <li>2. Explore our service offerings and pick the one that fits your goals</li>
          <li>3. Complete the onboarding for your chosen service</li>
          <li>4. Follow our daily market updates and start learning</li>
        </ul>
        <h2>💳 Payment &amp; Billing</h2>
        <p>We accept ${CONFIG.PAYMENT_METHODS}. Minimum deposit is ${CONFIG.MIN_DEPOSIT}.</p>
        <h2>🎓 Common Questions</h2>
        <p><strong>Do I need a broker account first?</strong><br>Yes, our signals and strategies work on your own broker account.</p>
        <p><strong>Can I cancel anytime?</strong><br>Yes. All subscriptions are month-to-month with no lock-in.</p>
        <p><strong>Do you guarantee profits?</strong><br>No. Trading involves risk and no service can guarantee profits.</p>
        <div class="page-last-updated">Need more help? Reach out on WhatsApp for a quick reply.</div>
      `
    }
  };

  function renderLegalRoute(key){
    const page = LEGAL[key];
    if (!page) return actuallyClosePage();
    renderOverlay(`
      <div class="page-inner">
        ${pageHeader()}
        <h1 class="page-title">${page.title}</h1>
        <p class="page-subtitle">${page.subtitle}</p>
        <div class="page-content">${page.content}</div>
      </div>
    `);
  }

  /* ============================================================
     REGISTER & LOGIN
  ============================================================ */
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
              <div class="form-field">
                <label for="reg_password">Password</label>
                <div class="password-wrapper">
                  <input type="password" id="reg_password" placeholder="Min. 8 characters" minlength="8" required />
                  <button type="button" class="password-toggle" onclick="togglePassword('reg_password', this)" aria-label="Toggle password visibility">
                    <svg class="eye-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    <svg class="eye-closed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  </button>
                </div>
              </div>
              <div class="form-field">
                <label for="reg_confirm">Confirm password</label>
                <div class="password-wrapper">
                  <input type="password" id="reg_confirm" placeholder="Re-enter password" minlength="8" required />
                  <button type="button" class="password-toggle" onclick="togglePassword('reg_confirm', this)" aria-label="Toggle password visibility">
                    <svg class="eye-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    <svg class="eye-closed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  </button>
                </div>
              </div>
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
            <div class="form-success" id="registerSuccess">✅ Account created! Please check your email to verify your address. Our team will contact you shortly on WhatsApp.</div>
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
            <div class="form-field">
              <label for="log_password">Password</label>
              <div class="password-wrapper">
                <input type="password" id="log_password" placeholder="Your password" required />
                <button type="button" class="password-toggle" onclick="togglePassword('log_password', this)" aria-label="Toggle password visibility">
                  <svg class="eye-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  <svg class="eye-closed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                </button>
              </div>
            </div>
            <div class="form-checkbox">
              <input type="checkbox" id="log_remember" />
              <label for="log_remember">Remember me on this device</label>
            </div>
            <button type="submit" class="form-submit">Sign In</button>
            <div class="form-success" id="loginSuccess">✅ Sign-in successful! (demo only)</div>
            <p style="text-align:center;color:var(--muted);font-size:.86rem;margin-top:18px">
              Forgot password? <a href="#" data-action="whatsapp" data-message="Hi LUKIE FX, I forgot my password and need help resetting it." style="color:var(--gold);text-decoration:underline">Contact support</a>.
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

  function renderRegisterRoute(){
    renderOverlay(renderRegisterPage(), { onReady: bindRegisterForm });
  }
  function renderLoginRoute(){
    renderOverlay(renderLoginPage(), { onReady: bindLoginForm });
  }

  /* ============================================================
     ROUTE REGISTRATION
  ============================================================ */
  router.register('home',     () => actuallyClosePage());
  router.register('service',  (state) => renderServiceRoute(state.key));
  router.register('legal',    (state) => renderLegalRoute(state.key));
  router.register('register', () => renderRegisterRoute());
  router.register('login',    () => renderLoginRoute());
  router.register('anchor',   (state) => {
    actuallyClosePage();
    if (state.id){
      const target = document.getElementById(state.id);
      if (target){
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - 84,
          behavior: 'smooth'
        });
      }
    }
  });

  /* ============================================================
     PUBLIC API
  ============================================================ */
  function openService(key){
    router.navigate({ page: 'service', key }, 'service/' + key);
  }
  function openLegalPage(key){
    router.navigate({ page: 'legal', key }, 'legal/' + key);
  }
  function openRegister(){
    router.navigate({ page: 'register' }, 'register');
  }
  function openLogin(){
    router.navigate({ page: 'login' }, 'login');
  }

  /* ============================================================
     EVENT DELEGATION
  ============================================================ */
  document.addEventListener('click', e => {
    const pageEl = e.target.closest('[data-page]');
    if (pageEl){
      e.preventDefault();
      const page = pageEl.dataset.page;
      if (page === 'register') return openRegister();
      if (page === 'login')    return openLogin();
      if (LEGAL[page])         return openLegalPage(page);
      return;
    }

    const card = e.target.closest('.card[data-service]');
    if (card){
      e.preventDefault();
      openService(card.dataset.service);
    }
  });

  /* ============================================================
     EXPORTS
  ============================================================ */
  window.LFX = window.LFX || {};
  LFX.pages = {
    init(){ /* routes registered at load time */ },
    openService,
    openLegalPage,
    openRegister,
    openLogin,
    close: closePage,
    SERVICES,
    LEGAL
  };
})();
