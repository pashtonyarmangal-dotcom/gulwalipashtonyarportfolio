/* ==========================================================================
   navigation.js — sticky header, mobile menu, active link, smooth scroll
   ========================================================================== */

export function initNavigation() {
  const header = document.querySelector('.site-header');
  const nav = document.getElementById('primary-nav');
  const toggle = document.getElementById('menu-toggle');

  /* --- sticky shadow --- */
  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --- mobile menu --- */
  const closeMenu = ({ returnFocus = false } = {}) => {
    if (!nav || !toggle) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) toggle.focus();
  };

  const openMenu = () => {
    if (!nav || !toggle) return;
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    const first = nav.querySelector('a, button');
    if (first) first.focus();
  };

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      open ? closeMenu() : openMenu();
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMenu({ returnFocus: true });
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      closeMenu();
    });

    // Close when a link is chosen
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) closeMenu();
    });

    // Reset when resizing to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024) closeMenu();
    });
  }

  /* --- smooth scroll for same-page hash links --- */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href');
    if (!id || id === '#') return;

    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const offset = (header ? header.offsetHeight : 0) + 12;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    history.replaceState(null, '', id);

    // Move focus for keyboard users without scrolling again
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  /* --- active section indicator (home page only) --- */
  const sectionLinks = document.querySelectorAll('.nav-link[href^="#"]');
  if (sectionLinks.length && 'IntersectionObserver' in window) {
    const map = new Map();
    sectionLinks.forEach((a) => {
      const sec = document.querySelector(a.getAttribute('href'));
      if (sec) map.set(sec, a);
    });

    const visible = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.set(entry.target, entry.intersectionRatio);
          else visible.delete(entry.target);
        });

        let best = null;
        let bestRatio = 0;
        visible.forEach((ratio, sec) => {
          if (ratio > bestRatio) { bestRatio = ratio; best = sec; }
        });

        sectionLinks.forEach((a) => a.classList.remove('is-active'));
        if (best && map.get(best)) map.get(best).classList.add('is-active');
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.15, 0.4, 0.75, 1] }
    );

    map.forEach((_, sec) => io.observe(sec));
  }

  /* --- active page indicator (sub pages) --- */
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    const file = href.split('/').pop().split('#')[0];
    if (file && file === path) a.classList.add('is-active');
  });
}