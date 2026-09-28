/* ==========================================================================
   app.js — application entry point
   Loads data, renders home sections, wires up all modules.
   ========================================================================== */

import { initTheme } from './theme.js';
import { initLanguage, t, localized, currentLang } from './language.js';
import { initNavigation } from './navigation.js';
import { initPreloader, initAnimations } from './animations.js';
import { initTerminal } from './terminal.js';
import { initProjectsPage, initProjectDetails } from './projects.js';
import { initBlogList, initBlogDetails } from './blog.js';
import { initContactForm } from './contact.js';
import { loadData, rootPath, describeLoadError } from './data.js';

/* --------------------------------------------------------------- helpers */

const escapeHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

function setState(container, message, isError = false) {
  if (!container) return;
  container.textContent = '';
  const p = document.createElement('p');
  p.className = 'state' + (isError ? ' state--error' : '');
  p.textContent = message;
  container.appendChild(p);
}

const SOCIAL_ICONS = {
  github:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.75.4-1.27.74-1.56-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.2-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.75.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.26 5.69.41.36.78 1.06.78 2.15v3.19c0 .31.2.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z"/></svg>',
  facebook:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z"/></svg>',
  telegram:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.9 4.3 18.7 19.5c-.24 1.07-.87 1.33-1.77.83l-4.9-3.6-2.36 2.27c-.26.26-.48.48-.98.48l.35-4.96 9.02-8.15c.39-.35-.09-.54-.6-.2L6.6 13.06 1.9 11.6c-1.02-.32-1.04-1.02.21-1.51L20.4 3.1c.85-.32 1.6.2 1.5 1.2Z"/></svg>',
  youtube:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.5a3 3 0 0 0-2.1-2.1C19.5 3.9 12 3.9 12 3.9s-7.5 0-9.4.5A3 3 0 0 0 .5 6.5 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.5 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.5ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z"/></svg>',
  linkedin:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z"/></svg>',
  whatsapp:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.05L2 22l5.1-1.33A10 10 0 1 0 12 2Zm0 18.1a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.02.79.8-2.94-.19-.31A8.1 8.1 0 1 1 12 20.1Zm4.44-6.06c-.24-.12-1.44-.71-1.66-.79-.22-.08-.38-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06a6.6 6.6 0 0 1-1.95-1.2 7.3 7.3 0 0 1-1.35-1.68c-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.75-1.82-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.73 2.73 0 0 0-.85 2.03 4.75 4.75 0 0 0 1 2.51 10.87 10.87 0 0 0 4.16 3.67c.58.25 1.04.4 1.4.51.58.19 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.05.14-1.16-.06-.11-.22-.17-.46-.29Z"/></svg>',
  tiktok:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 1 1 .77-5.06V9.72a5.68 5.68 0 0 0-.77-.05A5.68 5.68 0 1 0 15.54 15.3V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.29 4.29 0 0 1-3.24-1.48Z"/></svg>'
};

export function buildSocialLinks(profile, { compact = false } = {}) {
  const social = (profile && profile.social) || {};
  const frag = document.createDocumentFragment();
  let count = 0;

  Object.entries(social).forEach(([key, url]) => {
    if (!url) return;
    count += 1;

    const a = document.createElement('a');
    a.className = 'social-link';
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', key.charAt(0).toUpperCase() + key.slice(1));
    a.setAttribute('title', key.charAt(0).toUpperCase() + key.slice(1));
    a.innerHTML = SOCIAL_ICONS[key] || '●';

    if (compact) a.style.width = '38px', a.style.height = '38px';

    frag.appendChild(a);
  });

  return { frag, count };
}

/* --------------------------------------------------------- home: profile */

async function renderProfileBits(profile) {
  const lang = currentLang();

  // Hero name
  const nameEl = document.getElementById('hero-name');
  if (nameEl) {
    const name = localized(profile, 'name');
    nameEl.innerHTML = `<span>${escapeHtml(name.split(' ')[0] || name)}</span> ${escapeHtml(
      name.split(' ').slice(1).join(' ')
    )}`.trim();
  }

  // Roles
  const rolesEl = document.getElementById('hero-roles');
  if (rolesEl) {
    rolesEl.textContent = '';
    (profile.roles || []).forEach((_, i) => {
      const chip = document.createElement('span');
      chip.className = 'role-chip';
      chip.textContent = localized(
        { role: profile.roles[i], rolePs: (profile.rolesPs || [])[i] },
        'role',
        lang
      );
      rolesEl.appendChild(chip);
    });
  }

  // Headline / description
  const headline = document.getElementById('hero-headline');
  if (headline) headline.textContent = localized(profile, 'headline');

  const desc = document.getElementById('hero-desc');
  if (desc) desc.textContent = localized(profile, 'description');

  // Profile image
  const img = document.getElementById('hero-image');
  if (img && profile.profileImage) {
    img.src = rootPath(profile.profileImage);
    img.alt = `${localized(profile, 'name')} — profile picture`;
  }

  // Status pill
  const pill = document.getElementById('availability');
  if (pill) {
    const available = profile.availability !== 'unavailable';
    pill.dataset.available = String(available);
    const label = pill.querySelector('[data-availability-text]');
    if (label) label.textContent = available ? t('hero.available') : t('hero.unavailable');
  }

  // Social rows
  const { frag, count } = buildSocialLinks(profile);
  ['hero-social', 'footer-social', 'contact-social'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = '';
    if (count === 0) {
      el.innerHTML = `<p class="card__text" style="font-size:0.8125rem">No social links configured yet.</p>`;
      return;
    }
    el.appendChild(frag.cloneNode(true));
  });

  // Resume buttons
  const resumeUrl = profile.resumeUrl ? rootPath(profile.resumeUrl) : '';
  document.querySelectorAll('[data-resume-link]').forEach((a) => {
    if (resumeUrl) {
      a.href = resumeUrl;
      a.setAttribute('download', '');
    } else {
      a.href = rootPath('pages/resume.html');
      a.removeAttribute('download');
    }
  });

  // About preview text
  const aboutText = document.getElementById('about-preview-text');
  if (aboutText) aboutText.textContent = localized(profile, 'bio');

  const aboutPhilosophy = document.getElementById('about-philosophy');
  if (aboutPhilosophy) aboutPhilosophy.textContent = localized(profile, 'philosophy');

  const aboutFocus = document.getElementById('about-focus');
  if (aboutFocus) {
    aboutFocus.textContent = '';
    (profile.currentFocus || []).forEach((_, i) => {
      const li = document.createElement('li');
      li.textContent = localized(
        { f: profile.currentFocus[i], fPs: (profile.currentFocusPs || [])[i] },
        'f',
        lang
      );
      aboutFocus.appendChild(li);
    });
  }

  // Identity card meta
  const meta = document.getElementById('identity-meta');
  if (meta) {
    meta.textContent = '';
    const rows = [
      ['Email', profile.email || '—'],
      ['Location', profile.location || '—'],
      ['Availability', profile.availability === 'unavailable' ? 'Unavailable' : 'Available']
    ];
    rows.forEach(([k, v]) => {
      const row = document.createElement('div');
      row.innerHTML = `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`;
      meta.appendChild(row);
    });
  }

  // Contact page info
  const contactEmail = document.getElementById('contact-email');
  if (contactEmail) {
    if (profile.email) {
      contactEmail.href = `mailto:${profile.email}`;
      contactEmail.textContent = profile.email;
    } else {
      contactEmail.textContent = 'Not configured yet';
      contactEmail.removeAttribute('href');
    }
  }

  const contactPhone = document.getElementById('contact-phone');
  if (contactPhone) {
    if (profile.phone) {
      contactPhone.href = `tel:${profile.phone.replace(/\s+/g, '')}`;
      contactPhone.textContent = profile.phone;
    } else {
      contactPhone.textContent = 'Not configured yet';
      contactPhone.removeAttribute('href');
    }
  }

  const contactLocation = document.getElementById('contact-location');
  if (contactLocation) contactLocation.textContent = profile.location || 'Not configured yet';
}

/* ----------------------------------------------------------- home: skills */

function renderSkills(data) {
  const container = document.getElementById('skills-grid');
  if (!container) return;

  container.textContent = '';
  const cats = data.categories || [];
  if (!cats.length) return setState(container, t('state.empty'));

  cats.forEach((cat) => {
    const card = document.createElement('div');
    card.className = 'skill-cat reveal';

    const head = document.createElement('div');
    head.className = 'skill-cat__head';
    head.innerHTML = `
      <span class="skill-cat__icon" aria-hidden="true">${escapeHtml(cat.icon || '{}')}</span>
      <h3 class="skill-cat__title">${escapeHtml(localized(cat, 'title'))}</h3>
    `;
    card.appendChild(head);

    (cat.skills || []).forEach((skill) => {
      const item = document.createElement('div');
      item.className = 'skill-item';
      item.innerHTML = `
        <div class="skill-item__top">
          <span>${escapeHtml(localized(skill, 'name'))}</span>
          <span class="skill-item__level">${escapeHtml(localized(skill, 'label'))}</span>
        </div>
        <div class="skill-item__bar" role="img"
             aria-label="${escapeHtml(localized(skill, 'name'))} — ${escapeHtml(localized(skill, 'label'))}">
          <div class="skill-item__fill" data-skill-level="${Number(skill.level) || 0}"></div>
        </div>
      `;
      card.appendChild(item);
    });

    container.appendChild(card);
  });

  initSkillBarsLazy();
}

function initSkillBarsLazy() {
  const bars = document.querySelectorAll('[data-skill-level]');
  if (!bars.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fill = (el) => { el.style.width = `${Number(el.dataset.skillLevel) || 0}%`; };

  if (reduce || !('IntersectionObserver' in window)) {
    bars.forEach(fill);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { fill(e.target); io.unobserve(e.target); }
      });
    },
    { threshold: 0.3 }
  );
  bars.forEach((b) => io.observe(b));
}

/* --------------------------------------------------------- home: services */

function renderServices(data) {
  const container = document.getElementById('services-grid');
  if (!container) return;

  container.textContent = '';
  const list = data.services || [];
  if (!list.length) return setState(container, t('state.empty'));

  list.forEach((service) => {
    const card = document.createElement('article');
    card.className = 'card reveal';
    const features = (service.features || [])
      .map((f) => `<li>${escapeHtml(f)}</li>`)
      .join('');

    card.innerHTML = `
      <div class="skill-cat__icon" aria-hidden="true">${escapeHtml(service.icon || '◆')}</div>
      <h3 class="card__title" style="margin-top:var(--sp-4)">${escapeHtml(localized(service, 'title'))}</h3>
      <p class="card__text">${escapeHtml(localized(service, 'description'))}</p>
      ${features ? `<ul class="card__text" style="list-style:disc;padding-inline-start:1.2rem;margin-top:var(--sp-3)">${features}</ul>` : ''}
      <div class="btn-row" style="margin-top:var(--sp-4)">
        <a class="btn btn--ghost btn--sm" href="${rootPath('pages/contact.html')}">${escapeHtml(t('hero.contactMe'))}</a>
      </div>
    `;
    container.appendChild(card);
  });
}

/* -------------------------------------------------------- home: timeline */

function renderTimeline(container, items) {
  if (!container) return;
  container.textContent = '';

  if (!items.length) return setState(container, t('state.empty'));

  items.forEach((item) => {
    const el = document.createElement('div');
    el.className = 'timeline__item reveal';
    el.innerHTML = `
      <div class="timeline__date">${escapeHtml(localized(item, 'date'))}</div>
      <h3 class="timeline__title">${escapeHtml(localized(item, 'title'))}</h3>
      <p class="timeline__org">${escapeHtml(localized(item, 'org'))}</p>
      <p class="timeline__desc">${escapeHtml(localized(item, 'description'))}</p>
    `;
    container.appendChild(el);
  });
}

/* ------------------------------------------------------ home: achievements */

function renderAchievements(data) {
  const container = document.getElementById('achievements-grid');
  if (!container) return;

  container.textContent = '';
  const items = data.items || [];
  if (!items.length) return setState(container, t('state.empty'));

  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'card reveal';
    card.innerHTML = `
      <div class="skill-cat__icon" aria-hidden="true">${escapeHtml(item.icon || '★')}</div>
      <h3 class="card__title" style="margin-top:var(--sp-4)">${escapeHtml(localized(item, 'title'))}</h3>
      <p class="card__text">${escapeHtml(localized(item, 'description'))}</p>
      <span class="tag" style="margin-top:var(--sp-3);display:inline-block">${escapeHtml(item.type || '')}</span>
    `;
    container.appendChild(card);
  });
}

/* ------------------------------------------------------------- home: stats */

function renderStats(profile) {
  const container = document.getElementById('stats-grid');
  if (!container) return;

  container.textContent = '';
  const stats = profile.stats || [];
  if (!stats.length) return setState(container, t('state.empty'));

  stats.forEach((stat) => {
    const el = document.createElement('div');
    el.className = 'stat reveal';
    el.innerHTML = `
      <div class="stat__num" data-count-to="${Number(stat.value) || 0}">0</div>
      <div class="stat__label">${escapeHtml(localized(stat, 'label'))}</div>
    `;
    container.appendChild(el);
  });
}

/* ------------------------------------------------------------- bootstrap */

async function boot() {
  // Immediate UI systems (do not depend on data)
  initTheme();
  initLanguage();
  initNavigation();
  initPreloader();
  initTerminal();

  // Page-specific modules
  await initProjectsPage();
  await initProjectDetails();
  await initBlogList();
  await initBlogDetails();
  await initContactForm();

  // Footer year
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  // Home-page data-driven sections
  const needsHomeData = document.getElementById('skills-grid') ||
                        document.getElementById('services-grid') ||
                        document.getElementById('stats-grid') ||
                        document.getElementById('hero-name') ||
                        document.getElementById('achievements-grid');

  if (needsHomeData) {
    try {
      const [profile, skills, services, achievements, experience, education] = await Promise.all([
        loadData('profile'),
        loadData('skills').catch(() => ({ categories: [] })),
        loadData('services').catch(() => ({ services: [] })),
        loadData('achievements').catch(() => ({ items: [] })),
        loadData('experience').catch(() => ({ items: [] })),
        loadData('education').catch(() => ({ items: [] }))
      ]);

      await renderProfileBits(profile);
      renderSkills(skills);
      renderServices(services);
      renderStats(profile);
      renderAchievements(achievements);
      renderTimeline(document.getElementById('experience-timeline'), experience.items || []);
      renderTimeline(document.getElementById('education-timeline'), education.items || []);
    } catch (err) {
      const message = describeLoadError(err);
      ['skills-grid', 'services-grid', 'stats-grid', 'achievements-grid'].forEach((id) => {
        setState(document.getElementById(id), message, true);
      });
      const aboutText = document.getElementById('about-preview-text');
      if (aboutText) aboutText.textContent = message;
    }
  }

  // Animations last — after content is present
  initAnimations();

  // Re-render localized content when language changes
  document.addEventListener('gw:language', async () => {
    if (needsHomeData) {
      try {
        const [profile, skills, services, achievements] = await Promise.all([
          loadData('profile'),
          loadData('skills'),
          loadData('services'),
          loadData('achievements')
        ]);
        await renderProfileBits(profile);
        renderSkills(skills);
        renderServices(services);
        renderStats(profile);
        renderAchievements(achievements);
      } catch {
        /* keep current content on failure */
      }
    }
    document.querySelectorAll('[data-year]').forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}