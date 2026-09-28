/* ==========================================================================
   data.js — JSON data loading with caching and clear error handling
   ========================================================================== */

const cache = new Map();

/**
 * Resolve a path relative to the site root, based on <html data-root="...">.
 * index.html        -> data-root="./"
 * pages/*.html      -> data-root="../"
 * admin/*.html      -> data-root="../"
 */
export function rootPath(path = '') {
  const root = document.documentElement.dataset.root || './';
  return root + path.replace(/^\.?\//, '');
}

export async function loadData(name) {
  if (cache.has(name)) return cache.get(name);

  const url = rootPath(`data/${name}.json`);

  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Failed to load ${url} (HTTP ${res.status})`);

  const json = await res.json();
  cache.set(name, json);
  return json;
}

export function clearDataCache() {
  cache.clear();
}

/** Human-readable reason for a failed load. */
export function describeLoadError(err) {
  if (location.protocol === 'file:') {
    return 'Data could not be loaded because this page was opened directly from disk. Please run a local web server (see the project README).';
  }
  return err && err.message
    ? err.message
    : 'Unable to load data. Please try again.';
}