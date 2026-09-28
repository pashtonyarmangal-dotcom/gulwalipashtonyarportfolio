/* ==========================================================================
   terminal.js — safe, sandboxed portfolio terminal
   No shell, no filesystem, no network. Pure presentation.
   ========================================================================== */

import { t, localized, currentLang } from './language.js';
import { loadData } from './data.js';

const PROMPT = 'gulwali@portfolio:~$';

export function initTerminal() {
  const root = document.getElementById('terminal');
  if (!root) return;

  const body = root.querySelector('[data-terminal-body]');
  const form = root.querySelector('[data-terminal-form]');
  const input = root.querySelector('[data-terminal-input]');
  const titleEl = root.querySelector('[data-terminal-title]');

  if (!body || !form || !input) return;

  const history = [];
  let historyIndex = -1;
  let data = { profile: null, projects: null, skills: null };
  let ready = false;

  const scrollDown = () => { body.scrollTop = body.scrollHeight; };

  const escapeHtml = (s) =>
    String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const print = (text = '', cls = 'out') => {
    const line = document.createElement('div');
    line.className = `terminal__line terminal__line--${cls}`;
    line.textContent = text === '' ? '\u00a0' : text;
    body.appendChild(line);
    scrollDown();
  };

  const printEcho = (cmd) => {
    const line = document.createElement('div');
    line.className = 'terminal__line';
    line.innerHTML =
      `<span class="terminal__prompt">${escapeHtml(PROMPT)}</span> ` +
      `<span>${escapeHtml(cmd)}</span>`;
    body.appendChild(line);
    scrollDown();
  };

  const printRaw = (html, cls = 'out') => {
    const line = document.createElement('div');
    line.className = `terminal__line terminal__line--${cls}`;
    line.innerHTML = html;
    body.appendChild(line);
    scrollDown();
  };

  /* ------------------------------------------------------------- commands */

  const commands = {
    help() {
      print('Available commands:', 'ok');
      print('  help      — show this list');
      print('  whoami    — who is Gul Wali');
      print('  skills    — list technical skills');
      print('  projects  — list projects');
      print('  about     — short biography');
      print('  status    — availability status');
      print('  contact   — how to get in touch');
      print('  clear     — clear the terminal');
      print('');
      print('This terminal is a presentation tool only.', 'out');
      print('It cannot access your system, files or network.', 'out');
    },

    whoami() {
      const p = data.profile;
      if (!p) { print('Profile data is not loaded yet.', 'err'); return; }
      print(localized(p, 'name') || 'Gul Wali', 'ok');
      (p.roles || []).forEach((_, i) => print('  ' + localized({ role: p.roles[i], rolePs: (p.rolesPs || [])[i] }, 'role')));
      print('');
      print(localized(p, 'bio'));
    },

    skills() {
      const s = data.skills;
      if (!s || !s.categories) { print('Skills data is not loaded yet.', 'err'); return; }
      s.categories.forEach((cat) => {
        print(`${localized(cat, 'title')}`, 'ok');
        cat.skills.forEach((sk) => {
          print(`  ${localized(sk, 'name')} — ${localized(sk, 'label')}`);
        });
        print('');
      });
    },

    projects() {
      const p = data.projects;
      if (!p || !p.projects) { print('Project data is not loaded yet.', 'err'); return; }
      print(`${p.projects.length} ${t('projects.count')}`, 'ok');
      print('');
      p.projects.forEach((proj, i) => {
        print(`  ${String(i + 1).padStart(2, '0')}  ${localized(proj, 'title')}`);
      });
      print('');
      print('Open the Projects page to see full details.', 'out');
    },

    about() {
      const p = data.profile;
      if (!p) { print('Profile data is not loaded yet.', 'err'); return; }
      print(localized(p, 'bio'));
      print('');
      print(`${t('about.philosophy')}:`, 'ok');
      print(localized(p, 'philosophy'));
    },

    status() {
      const p = data.profile;
      const available = !p || p.availability !== 'unavailable';
      print(available ? '● AVAILABLE' : '● UNAVAILABLE', available ? 'ok' : 'err');
      print(available ? t('hero.available') : t('hero.unavailable'));
    },

    contact() {
      const p = data.profile || {};
      print(t('contact.title'), 'ok');
      if (p.email) print(`  email    : ${p.email}`);
      if (p.phone) print(`  phone    : ${p.phone}`);
      if (p.location) print(`  location : ${p.location}`);
      print('  page     : pages/contact.html');
      if (!p.email && !p.phone) {
        print('');
        print('Direct contact details have not been configured yet.', 'out');
        print('Use the contact form on the Contact page.', 'out');
      }
    },

    clear() {
      body.textContent = '';
    },

    /* --- harmless easter eggs --- */
    sudo() {
      print('Nice try. This terminal has no privileges.', 'err');
      print('gulwali is not in the sudoers file. This incident will be reported.', 'out');
    },

    ls() {
      print('about/   projects/   services/   blog/   contact/', 'ok');
    },

    pwd() {
      print('/home/gulwali/portfolio');
    },

    coffee() {
      print('HTTP 418 — I am a teapot.', 'err');
    },

    matrix() {
      print('Wake up, Neo...', 'ok');
      print('The Matrix has you.', 'out');
      print('Follow the white rabbit. 🐇', 'out');
    },

    exit() {
      print('There is no exit. Only more projects.', 'out');
    }
  };

  const ALIASES = {
    '?': 'help',
    man: 'help',
    info: 'about',
    me: 'whoami',
    project: 'projects',
    work: 'projects',
    cls: 'clear',
    hi: 'help',
    hello: 'help'
  };

  function run(raw) {
    const cmd = raw.trim();
    if (!cmd) return;

    printEcho(cmd);
    history.push(cmd);
    historyIndex = history.length;

    const key = cmd.toLowerCase();
    const resolved = ALIASES[key] || key;

    if (Object.prototype.hasOwnProperty.call(commands, resolved)) {
      commands[resolved]();
    } else {
      print(`command not found: ${cmd}`, 'err');
      print('Type "help" to see available commands.', 'out');
    }
  }

  /* ------------------------------------------------------------- input UX */

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = input.value;
    input.value = '';
    run(value);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex] || '';
      input.setSelectionRange(input.value.length, input.value.length);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!history.length) return;
      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = history[historyIndex] || '';
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      commands.clear();
    }
  });

  // Clicking anywhere in the panel focuses the input (but not when selecting text)
  root.addEventListener('click', (e) => {
    if (window.getSelection().toString()) return;
    if (e.target.closest('a')) return;
    input.focus();
  });

  /* ------------------------------------------------------------ bootstrap */

  async function boot() {
    if (titleEl) titleEl.textContent = t('terminal.title');

    print(`${PROMPT} whoami`, 'out');
    print('');
    print('Initializing...', 'out');

    try {
      const [profile, projects, skills] = await Promise.all([
        loadData('profile'),
        loadData('projects'),
        loadData('skills')
      ]);
      data = { profile, projects, skills };
      ready = true;

      body.textContent = '';
      printEcho('whoami');
      print('');
      print(localized(profile, 'name') || 'Gul Wali', 'ok');
      (profile.roles || []).forEach((_, i) =>
        print('  ' + localized({ role: profile.roles[i], rolePs: (profile.rolesPs || [])[i] }, 'role'))
      );
      print('');
      printEcho('status');
      print(profile.availability === 'unavailable' ? '● UNAVAILABLE' : '● AVAILABLE',
        profile.availability === 'unavailable' ? 'err' : 'ok');
      print('');
      print(t('terminal.hint'));
      print('');
    } catch (err) {
      ready = false;
      print('Could not load profile data.', 'err');
      print(String(err.message || err), 'err');
      print('');
      print(t('terminal.hint'));
    }
  }

  document.addEventListener('gw:language', () => {
    if (titleEl) titleEl.textContent = t('terminal.title');
  });

  boot();
}