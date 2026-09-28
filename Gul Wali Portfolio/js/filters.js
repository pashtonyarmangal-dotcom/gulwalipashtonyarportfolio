/* ==========================================================================
   filters.js — reusable search + category filter controller
   ========================================================================== */

/**
 * Creates a filter controller over a list of items.
 *
 * @param {object} opts
 * @param {Array}  opts.items        - array of data objects
 * @param {HTMLElement} opts.chipRow - container for category chips
 * @param {HTMLInputElement} opts.searchInput
 * @param {Array<string>} opts.categories
 * @param {Function} opts.getCategory - (item) => string
 * @param {Function} opts.getSearchText - (item) => string
 * @param {Function} opts.onChange - (filteredItems, meta) => void
 */
export function createFilter({
  items,
  chipRow,
  searchInput,
  categories = [],
  getCategory = (i) => i.category || '',
  getSearchText = (i) => JSON.stringify(i),
  onChange
}) {
  let activeCategory = 'all';
  let query = '';
  let chipButtons = [];

  const normalize = (s) => String(s || '').toLowerCase().trim();

  function buildChips(labelFor) {
    if (!chipRow) return;
    chipRow.textContent = '';
    chipButtons = categories.map((cat) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip';
      btn.textContent = labelFor(cat);
      btn.dataset.category = cat;
      btn.setAttribute('aria-pressed', String(cat === activeCategory));
      btn.addEventListener('click', () => {
        activeCategory = cat === activeCategory && cat !== 'all' ? 'all' : cat;
        chipButtons.forEach((b) =>
          b.setAttribute('aria-pressed', String(b.dataset.category === activeCategory))
        );
        apply();
      });
      chipRow.appendChild(btn);
      return btn;
    });
  }

  function apply() {
    const q = normalize(query);

    const filtered = items.filter((item) => {
      const cat = getCategory(item);
      const catOk =
        activeCategory === 'all' ||
        normalize(cat) === normalize(activeCategory) ||
        (Array.isArray(item.tags) &&
          item.tags.some((tag) => normalize(tag) === normalize(activeCategory)));

      if (!catOk) return false;
      if (!q) return true;

      return normalize(getSearchText(item)).includes(q);
    });

    if (typeof onChange === 'function') {
      onChange(filtered, { category: activeCategory, query: q, total: items.length });
    }
    return filtered;
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      query = searchInput.value;
      apply();
    });
  }

  return {
    setItems(next) {
      items = next;
      apply();
    },
    setCategories(next, labelFor = (c) => c) {
      categories = next;
      buildChips(labelFor);
    },
    setCategory(cat) {
      activeCategory = cat;
      chipButtons.forEach((b) =>
        b.setAttribute('aria-pressed', String(b.dataset.category === activeCategory))
      );
      apply();
    },
    init(labelFor = (c) => c) {
      buildChips(labelFor);
      apply();
    },
    apply,
    getItems: () => items
  };
}