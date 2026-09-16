/**
 * LUKIE FX — Navigation
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
    if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
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

  function initSmoothAnchors(){
    $$('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const id = link.getAttribute('href');
        if (id === '#' || id.length < 2) return;
        if (link.dataset.action || link.dataset.page) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 84;
        window.scrollTo({ top, behavior: 'smooth' });
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

  function initDismissNotice(){
    const btn = document.querySelector('[data-dismiss-notice]');
    const notice = document.getElementById('configNotice');
    if (!btn || !notice) return;
    btn.addEventListener('click', () => notice.classList.add('hidden'));
  }

  window.LFX = window.LFX || {};
  LFX.nav = {
    init(){
      initStickyNav();
      initMobileMenu();
      initSmoothAnchors();
      initPreloaderAndYear();
      initDismissNotice();
    }
  };
})();
