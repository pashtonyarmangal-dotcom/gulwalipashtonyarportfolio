/* ==========================================================================
   blog.js — blog listing, search, filtering and article details
   ========================================================================== */

import { loadData, rootPath, describeLoadError } from './data.js';
import { t, localized } from './language.js';
import { createFilter } from './filters.js';

const escapeHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

function formatDate(iso, lang) {
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat(lang === 'ps' ? 'ps-AF' : 'en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(d);
  } catch {
    return d.toDateString();
  }
}

function createPostCard(post, lang) {
  const el = document.createElement('article');
  el.className = 'post-card reveal';
  const url = `${rootPath('pages/blog.html')}?id=${encodeURIComponent(post.id)}`;

  el.innerHTML = `
    <div class="post-card__media">
      <img src="${escapeHtml(rootPath(post.image))}" alt="${escapeHtml(localized(post, 'title'))} cover"
           loading="lazy" decoding="async" width="800" height="450">
    </div>
    <div class="post-card__body">
      <div class="post-card__meta">
        <span class="cat">${escapeHtml(post.category || '')}</span>
        <span>${escapeHtml(formatDate(post.date, lang))}</span>
        <span>${escapeHtml(String(post.readTime || 0))} ${escapeHtml(t('blog.readTime'))}</span>
      </div>
      <h3 class="post-card__title">${escapeHtml(localized(post, 'title'))}</h3>
      <p class="post-card__excerpt">${escapeHtml(localized(post, 'excerpt'))}</p>
      <a class="btn btn--ghost btn--sm" href="${url}">${escapeHtml(t('btn.viewArticle'))}</a>
    </div>
  `;
  return el;
}

function renderPosts(container, posts, lang, emptyKey = 'blog.empty') {
  container.textContent = '';
  if (!posts.length) {
    const p = document.createElement('p');
    p.className = 'state';
    p.textContent = t(emptyKey);
    container.appendChild(p);
    return;
  }
  const frag = document.createDocumentFragment();
  posts.forEach((post) => frag.appendChild(createPostCard(post, lang)));
  container.appendChild(frag);
  requestAnimationFrame(() => {
    container.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  });
}

/* --------------------------------------------------------------- listing */

export async function initBlogList() {
  const container = document.getElementById('blog-list') || document.getElementById('blog-preview');
  if (!container) return;

  const chipRow = document.getElementById('blog-filters');
  const searchInput = document.getElementById('blog-search');
  const isPreview = container.id === 'blog-preview';

  container.textContent = '';
  const loading = document.createElement('p');
  loading.className = 'state';
  loading.textContent = t('blog.loading');
  container.appendChild(loading);

  let data;
  try {
    data = await loadData('blog');
  } catch (err) {
    container.textContent = '';
    const p = document.createElement('p');
    p.className = 'state state--error';
    p.textContent = describeLoadError(err);
    container.appendChild(p);
    return;
  }

  const posts = (data.posts || []).filter((p) => p.published !== false);

  if (isPreview) {
    renderPosts(container, posts.slice(0, 3), document.documentElement.lang || 'en');
    return;
  }

  const categories = ['all', ...(data.categories || []).filter((c) => c.toLowerCase() !== 'all')];
  const labelFor = (c) => (c === 'all' ? t('projects.all') : c);

  const filter = createFilter({
    items: posts,
    chipRow,
    searchInput,
    categories,
    getCategory: (p) => p.category,
    getSearchText: (p) =>
      [localized(p, 'title'), p.title, p.titlePs, localized(p, 'excerpt'), p.excerpt, p.category, p.content]
        .join(' ')
        .toLowerCase(),
    onChange: (filtered) => renderPosts(container, filtered, document.documentElement.lang || 'en')
  });

  filter.init(labelFor);

  document.addEventListener('gw:language', () => {
    filter.setCategories(categories, labelFor);
    filter.apply();
  });
}

/* --------------------------------------------------------------- details */

export async function initBlogDetails() {
  const root = document.getElementById('blog-details');
  if (!root) return;

  const showState = (msg, isError = false) => {
    root.textContent = '';
    const p = document.createElement('p');
    p.className = 'state' + (isError ? ' state--error' : '');
    p.textContent = msg;
    root.appendChild(p);
  };

  showState(t('blog.loading'));

  let data;
  try {
    data = await loadData('blog');
  } catch (err) {
    showState(describeLoadError(err), true);
    return;
  }

  const id = new URLSearchParams(location.search).get('id');
  const post = (data.posts || []).find((p) => p.id === id);

  if (!post) {
    showState(t('blog.notFound'), true);
    return;
  }

  renderPost(root, post);

  document.addEventListener('gw:language', () => renderPost(root, post));
}

function renderPost(root, post) {
  const lang = document.documentElement.lang || 'en';
  document.title = `${localized(post, 'title')} — Gul Wali`;

  root.innerHTML = `
    <article class="article">
      <div class="breadcrumb">
        <a href="${rootPath('pages/blog.html')}">${escapeHtml(t('nav.blog'))}</a>
        <span> / </span><span>${escapeHtml(post.category || '')}</span>
      </div>

      <header class="article__header">
        <h1 class="page-title">${escapeHtml(localized(post, 'title'))}</h1>
        <div class="post-card__meta" style="margin-top:var(--sp-4)">
          <span class="cat">${escapeHtml(post.category || '')}</span>
          <span>${escapeHtml(formatDate(post.date, lang))}</span>
          <span>${escapeHtml(String(post.readTime || 0))} ${escapeHtml(t('blog.readTime'))}</span>
        </div>
      </header>

      <img src="${escapeHtml(rootPath(post.image))}"
           alt="${escapeHtml(localized(post, 'title'))} cover"
           loading="lazy" decoding="async" width="800" height="450"
           style="border-radius:var(--radius);border:1px solid var(--border);margin-bottom:var(--sp-6)">

      <div class="article__content">
        ${sanitizeHtml(post.content || '')}
      </div>

      <div class="btn-row" style="margin-top:var(--sp-7)">
        <a class="btn btn--ghost" href="${rootPath('pages/blog.html')}">← ${escapeHtml(t('blog.backToBlog'))}</a>
      </div>
    </article>
  `;
}

/**
 * Minimal HTML sanitizer for trusted-but-external JSON content.
 * Allows a safe subset of formatting tags and strips everything else,
 * including all event handlers and javascript: URLs.
 */
function sanitizeHtml(html) {
  const allowed = new Set([
    'H1','H2','H3','H4','P','UL','OL','LI','STRONG','EM','B','I','CODE','PRE',
    'BLOCKQUOTE','BR','HR','A','FIGURE','FIGCAPTION','IMG','SPAN'
  ]);

  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const wrapper = doc.body.firstElementChild;

  const walk = (node) => {
    [...node.children].forEach((child) => {
      walk(child);

      if (!allowed.has(child.tagName)) {
        // Unwrap disallowed element but keep its text
        child.replaceWith(...child.childNodes);
        return;
      }

      // Strip every attribute except a safe whitelist
      [...child.attributes].forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = attr.value.trim();

        const isSafeHref =
          name === 'href' && /^(https?:|mailto:|#|\/)/i.test(value) && !/javascript:/i.test(value);
        const isSafeSrc =
          name === 'src' && /^(https?:|\/|\.\.?\/|data:image\/)/i.test(value);
        const isSafeAlt = name === 'alt';
        const isSafeTitle = name === 'title';

        if (!(isSafeHref || isSafeSrc || isSafeAlt || isSafeTitle)) {
          child.removeAttribute(attr.name);
        }
      });

      if (child.tagName === 'A') {
        child.setAttribute('rel', 'noopener noreferrer');
      }
    });
  };

  walk(wrapper);
  return wrapper.innerHTML;
}