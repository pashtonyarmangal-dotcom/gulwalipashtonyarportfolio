/* ==========================================================================
   projects.js — project rendering, filtering, search and details page
   ========================================================================== */

import { loadData, rootPath, describeLoadError } from './data.js';
import { t, localized, currentLang } from './language.js';
import { createFilter } from './filters.js';

let allProjects = [];
let projectFilter = null;

/* --------------------------------------------------------------- helpers */

const escapeHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export function getProjectById(id) {
  return allProjects.find((p) => p.id === id) || null;
}

function statusLabel(status) {
  return status === 'in-progress' ? t('projects.statusInProgress') : t('projects.statusCompleted');
}

/* ------------------------------------------------------------ card markup */

function createProjectCard(project) {
  const article = document.createElement('article');
  article.className = 'project-card reveal';

  const image = rootPath(project.image || 'assets/images/projects/muhasib.svg');
  const hasGithub = Boolean(project.github);
  const hasLive = Boolean(project.live);

  article.innerHTML = `
    <div class="project-card__media">
      <img src="${escapeHtml(image)}"
           alt="${escapeHtml(localized(project, 'title'))} project preview"
           loading="lazy" decoding="async" width="800" height="480">
      <span class="project-card__badge">${escapeHtml(statusLabel(project.status))}</span>
    </div>
    <div class="project-card__body">
      <h3 class="project-card__title">${escapeHtml(localized(project, 'title'))}</h3>
      <p class="project-card__desc">${escapeHtml(localized(project, 'description'))}</p>
      <div class="tag-row">
        ${(project.technologies || [])
          .slice(0, 5)
          .map((tech) => `<span class="tag">${escapeHtml(tech)}</span>`)
          .join('')}
      </div>
      <div class="project-card__actions">
        <a class="btn btn--primary btn--sm"
           href="${rootPath('pages/project-details.html')}?id=${encodeURIComponent(project.id)}">
          ${escapeHtml(t('btn.viewProject'))}
        </a>
        ${hasGithub ? `<a class="btn btn--ghost btn--sm" href="${escapeHtml(project.github)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('btn.github'))}</a>` : ''}
        ${hasLive ? `<a class="btn btn--ghost btn--sm" href="${escapeHtml(project.live)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('btn.live'))}</a>` : ''}
      </div>
    </div>
  `;

  return article;
}

/* ------------------------------------------------------ container rendering */

function renderInto(container, projects, { emptyKey = 'projects.empty' } = {}) {
  container.textContent = '';

  if (!projects.length) {
    const empty = document.createElement('p');
    empty.className = 'state';
    empty.textContent = t(emptyKey);
    container.appendChild(empty);
    return;
  }

  const frag = document.createDocumentFragment();
  projects.forEach((p) => frag.appendChild(createProjectCard(p)));
  container.appendChild(frag);

  // Reveal animation for newly rendered nodes
  requestAnimationFrame(() => {
    container.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  });
}

/* ------------------------------------------------------- featured (home) */

function initFeaturedProjects(projects) {
  const container = document.getElementById('featured-projects');
  if (!container) return;

  const featured = projects.filter((p) => p.featured === true);
  const list = featured.length ? featured : projects.slice(0, 3);
  renderInto(container, list);
}

/* ------------------------------------------------------ full projects page */

export async function initProjectsPage() {
  const container = document.getElementById('projects-grid');
  if (!container) return;

  const chipRow = document.getElementById('project-filters');
  const searchInput = document.getElementById('project-search');
  const countEl = document.getElementById('project-count');

  const showState = (message, isError = false) => {
    container.textContent = '';
    const p = document.createElement('p');
    p.className = 'state' + (isError ? ' state--error' : '');
    p.textContent = message;
    container.appendChild(p);
  };

  showState(t('projects.loading'));

  let data;
  try {
    data = await loadData('projects');
  } catch (err) {
    showState(describeLoadError(err), true);
    return;
  }

  allProjects = Array.isArray(data.projects) ? data.projects : [];

  const categories = ['all', ...(data.categories || []).filter((c) => c.toLowerCase() !== 'all')];

  const labelFor = (cat) => {
    if (cat === 'all') return t('projects.all');
    return cat;
  };

  projectFilter = createFilter({
    items: allProjects,
    chipRow,
    searchInput,
    categories,
    getCategory: (p) => p.category,
    getSearchText: (p) =>
      [
        localized(p, 'title'),
        p.title,
        p.titlePs,
        localized(p, 'description'),
        p.description,
        p.descriptionPs,
        p.category,
        ...(p.tags || []),
        ...(p.technologies || [])
      ]
        .join(' ')
        .toLowerCase(),
    onChange: (filtered) => {
      renderInto(container, filtered);
      if (countEl) {
        countEl.textContent = `${filtered.length} ${t('projects.count')}`;
      }
    }
  });

  projectFilter.init(labelFor);

  document.addEventListener('gw:language', () => {
    projectFilter.setCategories(categories, labelFor);
    projectFilter.apply();
  });
}

/* ----------------------------------------------------------- details page */

export async function initProjectDetails() {
  const root = document.getElementById('project-details');
  if (!root) return;

  const params = new URLSearchParams(location.search);
  const id = params.get('id');

  const showState = (message, isError = false) => {
    root.textContent = '';
    const p = document.createElement('p');
    p.className = 'state' + (isError ? ' state--error' : '');
    p.textContent = message;
    root.appendChild(p);
  };

  showState(t('projects.loading'));

  let data;
  try {
    data = await loadData('projects');
  } catch (err) {
    showState(describeLoadError(err), true);
    return;
  }

  allProjects = Array.isArray(data.projects) ? data.projects : [];
  const project = getProjectById(id);

  if (!project) {
    showState(t('details.notFound'), true);
    return;
  }

  renderProjectDetails(root, project);

  document.addEventListener('gw:language', () => {
    renderProjectDetails(root, project);
  });
}

function renderProjectDetails(root, project) {
  const d = project.details || {};

  document.title = `${localized(project, 'title')} — Gul Wali`;

  const section = (titleKey, content) => {
    if (!content) return '';
    const body = Array.isArray(content)
      ? `<ul>${content.map((c) => `<li>${escapeHtml(c)}</li>`).join('')}</ul>`
      : `<p>${escapeHtml(content)}</p>`;
    return `
      <section class="section section--tight">
        <h2 class="section-title" style="font-size:1.35rem">${escapeHtml(t(titleKey))}</h2>
        <div class="article__content" style="margin-top:var(--sp-3)">${body}</div>
      </section>`;
  };

  const links = [];
  if (project.github) {
    links.push(`<a class="btn btn--ghost" href="${escapeHtml(project.github)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('btn.github'))}</a>`);
  }
  if (project.live) {
    links.push(`<a class="btn btn--primary" href="${escapeHtml(project.live)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('btn.live'))}</a>`);
  }

  const screenshots = Array.isArray(d.screenshots) && d.screenshots.length
    ? `<div class="grid grid--2" style="margin-top:var(--sp-4)">
         ${d.screenshots
           .map((s, i) => `
             <figure class="screenshot" style="margin:0;text-align:center">
               <img src="${escapeHtml(rootPath(s))}"
                    alt="${escapeHtml(localized(project, 'title'))} — screenshot ${i + 1}"
                    loading="lazy" decoding="async"
                    onerror="this.closest('figure').style.display='none'"
                    style="width:100%;height:auto;border:1px solid var(--border);border-radius:var(--radius);cursor:zoom-in">
               <figcaption style="font-size:.75rem;color:var(--text-muted);margin-top:.4rem">
                 ${i + 1}
               </figcaption>
             </figure>
           `)
           .join('')}
       </div>`
    : '';

  root.innerHTML = `
    <div class="breadcrumb">
      <a href="${rootPath('pages/projects.html')}">${escapeHtml(t('nav.projects'))}</a>
      <span> / </span><span>${escapeHtml(localized(project, 'title'))}</span>
    </div>

    <h1 class="page-title">${escapeHtml(localized(project, 'title'))}</h1>
    <p class="page-sub">${escapeHtml(localized(project, 'description'))}</p>

    <div class="tag-row" style="margin-top:var(--sp-4)">
      <span class="tag">${escapeHtml(project.category || '')}</span>
      <span class="tag">${escapeHtml(statusLabel(project.status))}</span>
      ${(project.technologies || []).map((x) => `<span class="tag">${escapeHtml(x)}</span>`).join('')}
    </div>

    <div style="margin-top:var(--sp-6);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden">
      <img src="${escapeHtml(rootPath(project.image))}"
           alt="${escapeHtml(localized(project, 'title'))} preview"
           loading="lazy" decoding="async" width="800" height="480" style="width:100%;height:auto">
    </div>

    ${section('details.overview', d.overview)}
    ${section('details.problem', d.problem)}
    ${section('details.solution', d.solution)}
    ${section('details.features', d.features)}
    ${section('details.challenges', d.challenges)}
    ${section('details.learned', d.learned)}

    ${screenshots ? `<section class="section section--tight"><h2 class="section-title" style="font-size:1.35rem">${escapeHtml(t('details.screenshots'))}</h2>${screenshots}</section>` : ''}

    <section class="section section--tight">
      <h2 class="section-title" style="font-size:1.35rem">${escapeHtml(t('details.links'))}</h2>
      <div class="btn-row" style="margin-top:var(--sp-4)">
        ${links.length ? links.join('') : `<p class="card__text">${escapeHtml(t('details.noLive'))}</p>`}
      </div>
      <div class="btn-row" style="margin-top:var(--sp-5)">
        <a class="btn btn--ghost" href="${rootPath('pages/projects.html')}">← ${escapeHtml(t('details.backToProjects'))}</a>
      </div>
    </section>
  `;
}