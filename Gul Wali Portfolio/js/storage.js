/* ==========================================================================
   storage.js — safe localStorage wrapper
   ========================================================================== */

const PREFIX = 'gw_';

function available() {
  try {
    const key = PREFIX + '__test__';
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

const HAS_LS = available();
const memory = new Map();

export const storage = {
  get(key, fallback = null) {
    const k = PREFIX + key;
    try {
      const raw = HAS_LS ? localStorage.getItem(k) : memory.get(k);
      if (raw === null || raw === undefined) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    const k = PREFIX + key;
    const raw = JSON.stringify(value);
    try {
      if (HAS_LS) localStorage.setItem(k, raw);
      else memory.set(k, raw);
      return true;
    } catch {
      return false;
    }
  },

  remove(key) {
    const k = PREFIX + key;
    try {
      if (HAS_LS) localStorage.removeItem(k);
      else memory.delete(k);
    } catch {
      /* ignore */
    }
  },

  isPersistent() {
    return HAS_LS;
  }
};

export default storage;