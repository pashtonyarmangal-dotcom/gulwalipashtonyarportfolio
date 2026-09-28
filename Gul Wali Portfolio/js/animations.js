/* ==========================================================================
   animations.js — preloader, scroll reveal, counters, custom cursor
   ========================================================================== */

const reduceMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------- preloader */

export function initPreloader() {
  const pre = document.getElementById('preloader');
  if (!pre) return;

  const log = pre.querySelector('[data-preloader-log]');
  const fill = pre.querySelector('[data-preloader-fill]');

  const finish = () => {
    if (fill) fill.style.width = '100%';
    pre.classList.add('is-done');
    document.body.classList.remove('is-loading');
    setTimeout(() => pre.remove(), 600);
  };

  if (reduceMotion()) {
    finish();
    return;
  }

  const steps = [
    'Initializing portfolio...',
    'Loading profile...',
    'Loading projects...',
    'Loading interface...',
    '100%',
    'Welcome, Gul Wali.'
  ];

  let i = 0;
  let cancelled = false;

  const safety = setTimeout(() => {
    cancelled = true;
    finish();
  }, 1800);

  const tick = () => {
    if (cancelled) return;
    if (i >= steps.length) {
      clearTimeout(safety);
      setTimeout(finish, 180);
      return;
    }
    if (log) {
      const line = document.createElement('div');
      line.textContent = (i === steps.length - 1 ? '> ' : '$ ') + steps[i];
      log.appendChild(line);
    }
    if (fill) fill.style.width = `${Math.round(((i + 1) / steps.length) * 100)}%`;
    i += 1;
    setTimeout(tick, 140);
  };

  tick();
}

/* ---------------------------------------------------------- scroll reveal */

export function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  if (reduceMotion() || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
  );

  els.forEach((el) => io.observe(el));
}

/* ------------------------------------------------------- number counters */

export function initCounters() {
  const counters = document.querySelectorAll('[data-count-to]');
  if (!counters.length) return;

  if (reduceMotion() || !('IntersectionObserver' in window)) {
    counters.forEach((el) => {
      el.textContent = el.dataset.countTo;
    });
    return;
  }

  const animate = (el) => {
    const target = Number(el.dataset.countTo) || 0;
    const duration = 1100;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = String(target);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((el) => io.observe(el));
}

/* --------------------------------------------------------- skill bars fill */

export function initSkillBars() {
  const bars = document.querySelectorAll('[data-skill-level]');
  if (!bars.length) return;

  const fill = (el) => {
    el.style.width = `${Math.max(0, Math.min(100, Number(el.dataset.skillLevel) || 0))}%`;
  };

  if (reduceMotion() || !('IntersectionObserver' in window)) {
    bars.forEach(fill);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          fill(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  bars.forEach((el) => io.observe(el));
}

/* --------------------------------------------------------- custom cursor */

export function initCursor() {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!fine || reduceMotion()) return;
  if (document.querySelector('.cursor-dot')) return;

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.append(dot, ring);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let rafId = null;

  document.body.classList.add('has-custom-cursor');

  const onMove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate3d(${mouseX - 3}px, ${mouseY - 3}px, 0)`;
  };

  const loop = () => {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    ring.style.transform = `translate3d(${ringX - 16}px, ${ringY - 16}px, 0)`;
    rafId = requestAnimationFrame(loop);
  };

  const interactive = 'a, button, .chip, input, textarea, select, [role="button"]';

  document.addEventListener('mousemove', onMove, { passive: true });

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactive)) ring.classList.add('is-hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactive)) ring.classList.remove('is-hover');
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });

  rafId = requestAnimationFrame(loop);

  window.addEventListener('pagehide', () => {
    if (rafId) cancelAnimationFrame(rafId);
  });
}

/* ------------------------------------------------------------ orchestrator */

export function initAnimations() {
  initReveal();
  initCounters();
  initSkillBars();
  initCursor();
}