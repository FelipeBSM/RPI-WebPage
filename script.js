(() => {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const setHeader = () => {
    header?.classList.toggle('scrolled', window.scrollY > 36);
  };
  setHeader();
  window.addEventListener('scroll', setHeader, { passive: true });

  const closeMenu = () => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
  };

  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!open));
    menuToggle.setAttribute('aria-label', open ? 'Abrir menu' : 'Fechar menu');
    mobileMenu?.classList.toggle('open', !open);
    mobileMenu?.setAttribute('aria-hidden', String(open));
  });

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      const offset = header?.offsetHeight ?? 0;
      const top = target.getBoundingClientRect().top + window.scrollY - offset + 1;
      window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
      closeMenu();
    });
  });

  const revealElements = [...document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-line')];
  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-visible'));
  }

  const counters = document.querySelectorAll('.counter[data-target]');
  const animateCounter = el => {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const target = Number(el.dataset.target || 0);
    const suffix = el.dataset.suffix || '';
    if (reducedMotion) {
      el.textContent = `${target}${suffix}`;
      return;
    }
    const start = performance.now();
    const duration = 1100;
    const tick = now => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .6 });
    counters.forEach(counter => counterObserver.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }

  const timeline = document.querySelector('[data-timeline]');
  const progress = timeline?.querySelector('.timeline-progress');
  const updateTimeline = () => {
    if (!timeline || !progress) return;
    const rect = timeline.getBoundingClientRect();
    const viewport = window.innerHeight;
    const ratio = Math.max(0, Math.min(1, (viewport * .72 - rect.top) / Math.max(rect.height, 1)));
    if (window.innerWidth <= 768) {
      progress.style.height = `${ratio * 100}%`;
      progress.style.width = '1px';
    } else {
      progress.style.width = `${ratio * 100}%`;
      progress.style.height = '100%';
    }
  };
  updateTimeline();
  window.addEventListener('scroll', updateTimeline, { passive: true });
  window.addEventListener('resize', updateTimeline);

  const toggle = document.querySelector('.trajectory-toggle');
  const panel = document.querySelector('#trajectory-panel');
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    if (!panel) return;
    if (open) {
      panel.hidden = true;
    } else {
      panel.hidden = false;
      panel.animate?.([
        { opacity: 0, transform: 'translateY(-8px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: reducedMotion ? 1 : 380, easing: 'cubic-bezier(.22,1,.36,1)' });
    }
  });

  const navLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"]')];
  const sections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`));
    }, { rootMargin: '-30% 0px -55% 0px', threshold: [0, .1, .3, .6] });
    sections.forEach(section => navObserver.observe(section));
  }

  const heroMedia = document.querySelector('.hero-media');
  const pchMedia = document.querySelector('.pch-media');
  const parallax = () => {
    if (reducedMotion || window.innerWidth < 769) return;
    const y = window.scrollY;
    if (heroMedia && y < window.innerHeight * 1.3) heroMedia.style.transform = `translate3d(0, ${y * .06}px, 0) scale(1.01)`;
    if (pchMedia) {
      const rect = pchMedia.parentElement.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) pchMedia.style.transform = `translate3d(0, ${rect.top * -.025}px, 0) scale(1.02)`;
    }
  };
  window.addEventListener('scroll', parallax, { passive: true });
    // HERO - Digitação dinâmica

  const typingElement = document.querySelector('#hero-typing');

  if (typingElement && !reducedMotion) {

    const words = [
      'elétrica',
      'eólica',
      'hidroelétrica',
      'termoelétrica'
    ];

    let wordIndex = 0;
    let charIndex = words[0].length;
    let deleting = true;

    function typeEffect() {

      const currentWord = words[wordIndex];

      if (deleting) {

        charIndex--;
        typingElement.textContent = currentWord.substring(0, charIndex);

        if (charIndex === 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;

          setTimeout(typeEffect, 400);
          return;
        }

        setTimeout(typeEffect, 65);

      } else {

        const nextWord = words[wordIndex];

        charIndex++;
        typingElement.textContent = nextWord.substring(0, charIndex);

        if (charIndex === nextWord.length) {
          deleting = true;

          setTimeout(typeEffect, 2600);
          return;
        }

        setTimeout(typeEffect, 110);
      }
    }

    setTimeout(typeEffect, 3200);
  }



})();
