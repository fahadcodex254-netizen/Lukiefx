/**
 * LUKIE FX — Navigation
 * Handles sticky nav, scroll progress, mobile menu, active link tracking,
 * AND routes all anchor clicks through the router so back/forward work.
 */
(function(){
  const $  = LFX.$;
  const $$ = LFX.$$;

  function initStickyNav(){
    const nav = $('#nav');
    const progress = $('#progress');
    const toTop = $('#toTop');
    if (!nav) return;

    function onScroll(){
      const y = window.scrollY;
      nav.classList.toggle('scrolled', y > 40);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
      if (toTop) toTop.classList.toggle('show', y > 600);
      updateActiveLink();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    if (toTop) toTop.addEventListener('click', () => {
      // Route to home / top — this also closes any overlay
      LFX.router.navigate({ page: 'home' }, '');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    onScroll();
  }

  function initMobileMenu(){
    const burger  = $('#burger');
    const menu    = $('#mobileMenu');
    const overlay = $('#overlay');
    if (!burger || !menu) return;

    function toggle(open){
      burger.classList.toggle('open', open);
      menu.classList.toggle('open', open);
      overlay?.classList.toggle('show', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    }

    burger.addEventListener('click', () => toggle(!menu.classList.contains('open')));
    overlay?.addEventListener('click', () => toggle(false));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
    LFX.bus.on('closeMenu', () => toggle(false));
  }

  function updateActiveLink(){
    const sections = $$('section[id]');
    const links = $$('.nav-links a');
    const pos = window.scrollY + 140;
    let current = 'home';
    sections.forEach(sec => { if (pos >= sec.offsetTop) current = sec.id; });
    links.forEach(a => {
      const href = a.getAttribute('href');
      if (href && href.startsWith('#')) a.classList.toggle('active', href === '#' + current);
    });
  }

  /**
   * Anchor links (#about, #tools, etc.) go through the router so that
   * pressing the browser back button after clicking them returns
   * to the previous anchor correctly.
   */
  function initSmoothAnchors(){
    $$('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const id = link.getAttribute('href');
        if (id === '#' || id.length < 2) return;

        // Skip links handled by the router / other modules
        if (link.dataset.action || link.dataset.page || link.dataset.adminOpen) return;

        // Skip route-based hashes (services, legal, etc.) — those are
        // handled by the router via data attributes elsewhere.
        const hash = id.slice(1);
        if (hash.startsWith('service/') || hash.startsWith('legal/')) return;
        if (hash === 'register' || hash === 'login' || hash === 'admin') return;

        e.preventDefault();
        LFX.router.navigate({ page: 'anchor', id: hash }, hash);
      });
    });
  }

  function initPreloaderAndYear(){
    window.addEventListener('load', () => {
      setTimeout(() => document.getElementById('preloader')?.classList.add('hide'), 450);
    });
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  }

  window.LFX = window.LFX || {};
  LFX.nav = {
    init(){
      initStickyNav();
      initMobileMenu();
      initSmoothAnchors();
      initPreloaderAndYear();
    }
  };
})();
