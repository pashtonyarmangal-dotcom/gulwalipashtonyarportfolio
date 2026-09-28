/* ==========================================================================
   theme.js — dark / light theme with system preference + persistence
   ========================================================================== */

import storage from './storage.js';

const KEY = 'theme';
const THEMES = ['dark', 'light'];

function systemPreference() {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function currentTheme() {
  return document.documentElement.dataset.theme || 'dark';
}

export function applyTheme(theme, { persist = true } = {}) {
  const next = THEMES.includes(theme) ? theme : 'dark';
  document.documentElement.dataset.theme = next;

  if (persist) storage.set(KEY, next);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', next === 'dark' ? '#070a0c' : '#f5f7f9');

  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    const icon = btn.querySelector('[data-theme-icon]');
    if (icon) icon.textContent = next === 'dark' ? '◐' : '◑';
    btn.setAttribute('aria-pressed', String(next === 'light'));
    btn.setAttribute('aria-label', next === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  });

  document.dispatchEvent(new CustomEvent('gw:theme', { detail: { theme: next } }));
}

export function toggleTheme() {
  applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
}

export function initTheme() {
  const stored = storage.get(KEY, null);
  applyTheme(stored || systemPreference(), { persist: Boolean(stored) });

  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', toggleTheme);
  });

  // Follow system changes only when the user has not chosen explicitly.
  const mq = window.matchMedia('(prefers-color-scheme: light)');
  const onSystemChange = (e) => {
    if (storage.get(KEY, null)) return;
    applyTheme(e.matches ? 'light' : 'dark', { persist: false });
  };
  if (mq.addEventListener) mq.addEventListener('change', onSystemChange);
  else if (mq.addListener) mq.addListener(onSystemChange);
}