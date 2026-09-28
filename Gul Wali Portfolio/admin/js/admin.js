/* ==========================================================================
   admin.js — demo admin dashboard logic (LocalStorage backed)

   IMPORTANT: This is NOT real authentication and NOT a secure backend.
   All data lives in the browser. Production use requires server-side auth
   and a real database.
   ========================================================================== */

import storage from '../../js/storage.js';
import { loadData, rootPath } from '../../js/data.js';

/* ------------------------------------------------------------ demo gate */

const SESSION_KEY = 'admin_session';

export function requireSession() {
  if (storage.get(SESSION_KEY, null) !== 'active') {
    location.replace('index.html');
    return false;
  }
  return true;
}

export function logout() {
  storage.remove(SESSION_KEY);
  location.replace('index.html');
}

/* ------------------------------------------------------- storage helpers */

const KEYS = {
  projects: 'admin_projects',
  blog: 'admin_blog',
  messages: 'admin_messages',
  settings: 'admin_settings',
  content: 'admin_content'
};

/** Read an override list, falling back to the seed JSON file. */
async function readCollection(name, seedFile, prop) {
  const override = storage.get(KEYS[name], null);
  if (Array.isArray(override)) return override;

  try {
    const data = await loadData(seedFile);
    const list = data[prop] || [];
    storage.set(KEYS[name], list);
    return list;
  } catch {
    return [];
  }
}

function writeCollection(name, list) {
  storage.set(KEYS[name], list);
}

export const adminStore = {
  async getProjects() {
    return readCollection('projects', 'projects', 'projects');
  },
  saveProjects(list) {
    writeCollection('projects', list);
  },

  async getPosts() {
    return readCollection('blog', 'blog', 'posts');
  },
  savePosts(list) {
    writeCollection('blog', list);
  },

  getMessages() {
    const local = storage.get('messages', []);
    const admin = storage.get(KEYS.messages, []);
    const merged = [...admin];
    const seen = new Set(merged.map((m) => m.id));
    (Array.isArray(local) ? local : []).forEach((m) => {
      if (!seen.has(m.id)) merged.push(m);
    });
    return merged.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  },
  saveMessages(list) {
    writeCollection('messages', list);
  },

  async getSettings() {
    const override = storage.get(KEYS.settings, null);
    if (override && typeof override === 'object') return override;

    try {
      const profile = await loadData('profile');
      storage.set(KEYS.settings, profile);
      return profile;
    } catch {
      return {};
    }
  },
  saveSettings(obj) {
    storage.set(KEYS.settings, obj);
  },

  async getContent() {
    const override = storage.get(KEYS.content, null);
    if (override && typeof override === 'object') return override;

    try {
      const [skills, services, experience, education, achievements] = await Promise.all([
        loadData('skills').catch(() => ({ categories: [] })),
        loadData('services').catch(() => ({ services: [] })),
        loadData('experience').catch(() => ({ items: [] })),
        loadData('education').catch(() => ({ items: [] })),
        loadData('achievements').catch(() => ({ items: [] }))
      ]);
      const content = {
        skills: skills.categories || [],
        services: services.services || [],
        experience: experience.items || [],
        education: education.items || [],
        achievements: achievements.items || []
      };
      storage.set(KEYS.content, content);
      return content;
    } catch {
      return { skills: [], services: [], experience: [], education: [], achievements: [] };
    }
  },
  saveContent(obj) {
    storage.set(KEYS.content, obj);
  },

  resetAll() {
    Object.values(KEYS).forEach((k) => storage.remove(k));
    storage.remove('messages');
  }
};

/* ---------------------------------------------------------- UI helpers */

export function uid(prefix = 'item') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function toast(message, type = 'success') {
  let el = document.getElementById('admin-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'admin-toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.style.cssText = `
      position:fixed;inset-block-end:24px;inset-inline-end:24px;z-index:9999;
      padding:.8rem 1.1rem;border-radius:10px;font-size:.875rem;font-weight:600;
      border:1px solid var(--border);background:var(--surface);box-shadow:var(--shadow-lg);
      transition:opacity .25s ease,transform .25s ease;`;
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.style.color = type === 'error' ? 'var(--danger)' : 'var(--primary)';
  el.style.borderColor = type === 'error' ? 'var(--danger)' : 'var(--primary)';
  el.style.opacity = '1';
  el.style.transform = 'translateY(0)';

  clearTimeout(el._timer);
  el._timer = setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';
  }, 2600);
}

/** Simple modal controller bound to #admin-modal. */
export function createModal() {
  const modal = document.getElementById('admin-modal');
  if (!modal) return null;

  const titleEl = modal.querySelector('[data-modal-title]');
  const bodyEl = modal.querySelector('[data-modal-body]');

  const close = () => {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  modal.querySelectorAll('[data-modal-close]').forEach((btn) => {
    btn.addEventListener('click', close);
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
  });

  return {
    open(title, bodyHtml) {
      if (titleEl) titleEl.textContent = title;
      if (bodyEl) bodyEl.innerHTML = bodyHtml;
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      const first = modal.querySelector('input, textarea, select, button');
      if (first) first.focus();
    },
    close,
    body: () => bodyEl
  };
}

/** Renders the shared admin sidebar into #admin-sidebar. */
export async function renderSidebar(activePage) {
  const host = document.getElementById('admin-sidebar');
  if (!host) return;

  const links = [
    ['dashboard.html', 'Dashboard', '▤'],
    ['projects.html', 'Projects', '▦'],
    ['blog.html', 'Blog', '✎'],
    ['content.html', 'Content', '◆'],
    ['messages.html', 'Messages', '✉'],
    ['settings.html', 'Settings', '⚙']
  ];

  host.innerHTML = `
    <a class="admin-brand" href="dashboard.html">
      <span class="brand-mark" aria-hidden="true">GW</span>
      <span>ADMIN</span>
    </a>
    <nav class="admin-nav" aria-label="Admin navigation">
      ${links
        .map(
          ([href, label, icon]) =>
            `<a href="${href}" ${href === activePage ? 'aria-current="page"' : ''}>
               <span aria-hidden="true">${icon}</span><span>${label}</span>
             </a>`
        )
        .join('')}
    </nav>
    <div class="admin-side__foot">
      <a class="a-btn" href="${rootPath('index.html')}">← View site</a>
      <button class="a-btn a-btn--danger" type="button" id="admin-logout">Log out</button>
    </div>
  `;

  document.getElementById('admin-logout')?.addEventListener('click', logout);
}