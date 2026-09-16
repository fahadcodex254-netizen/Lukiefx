/**
 * LUKIE FX — UI Interactivity
 */
(function(){
  const $  = LFX.$;
  const $$ = LFX.$$;
  const CONFIG = LFX.CONFIG;

  function initReveal(){
    const els = $$('[data-reveal]');
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    els.forEach((el, i) => {
      el.style.transitionDelay = (i % 4) * 90 + 'ms';
      observer.observe(el);
    });
  }

  function initCounters(){
    const els = $$('[data-count]');
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const duration = 1800;
        const start = performance.now();

        function tick(now){
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = target * eased;
          el.textContent = (target % 1 === 0 ? Math.floor(val).toLocaleString() : val.toFixed(1)) + suffix;
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target.toLocaleString() + suffix;
        }
        requestAnimationFrame(tick);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    els.forEach(el => observer.observe(el));
  }

  function initFAQ(){
    $$('.faq-item').forEach(item => {
      const q = item.querySelector('.faq-q');
      const a = item.querySelector('.faq-a');
      if (!q || !a) return;

      q.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        $$('.faq-item.open').forEach(openItem => {
          openItem.classList.remove('open');
          openItem.querySelector('.faq-a').style.maxHeight = null;
        });
        if (!isOpen){
          item.classList.add('open');
          a.style.maxHeight = a.scrollHeight + 'px';
        }
      });
    });
  }

  function initSlider(){
    const slidesEl = $('#slides');
    const dotsEl = $('#dots');
    if (!slidesEl || !dotsEl) return;

    const slideCount = slidesEl.children.length;
    let slideIndex = 0;
    let autoSlide;

    for (let i = 0; i < slideCount; i++){
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
      dot.addEventListener('click', () => goToSlide(i));
      dotsEl.appendChild(dot);
    }

    function goToSlide(i){
      slideIndex = (i + slideCount) % slideCount;
      slidesEl.style.transform = `translateX(-${slideIndex * 100}%)`;
      [...dotsEl.children].forEach((d, k) => d.classList.toggle('active', k === slideIndex));
      restartAuto();
    }

    function restartAuto(){
      clearInterval(autoSlide);
      autoSlide = setInterval(() => goToSlide(slideIndex + 1), 6000);
    }
    restartAuto();

    let touchStartX = 0;
    slidesEl.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    slidesEl.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goToSlide(slideIndex + (diff > 0 ? 1 : -1));
    }, { passive: true });
  }

  function initCardSpotlight(){
    $$('.card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  function handleActionButton(el){
    const action = el.dataset.action;
    if (action === 'whatsapp'){
      const msg = el.dataset.message || 'Hi LUKIE FX, I would like more information.';
      const phone = LFX.phoneSafe();
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank', 'noopener');
      return true;
    }
    if (action === 'telegram'){
      window.open(CONFIG.TELEGRAM_LINK, '_blank', 'noopener');
      return true;
    }
    return false;
  }

  function initActionButtons(){
    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-action]');
      if (!el) return;
      if (handleActionButton(el)) e.preventDefault();
    });
    const waFloat = document.getElementById('waFloat');
    if (waFloat){
      waFloat.href = `https://wa.me/${LFX.phoneSafe()}`;
    }
  }

  function initDeadLinks(){
    $$('a[href="#"]').forEach(link => {
      if (link.dataset.action || link.dataset.page) return;
      if (link.closest('.socials')){
        link.addEventListener('click', e => e.preventDefault());
      }
    });
  }

  window.LFX = window.LFX || {};
  LFX.ui = {
    init(){
      initReveal();
      initCounters();
      initFAQ();
      initSlider();
      initCardSpotlight();
      initActionButtons();
      initDeadLinks();
    },
    handleActionButton
  };
})();
