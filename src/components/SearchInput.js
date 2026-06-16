/**
 * SearchInput.js
 * Search/filter input with icon and debounced callback.
 */

import { h, debounce } from '../utils/helpers.js';
import { icons } from '../icons/icons.js';

/**
 * Create a search input component.
 * @param {object} options
 * @param {string} [options.placeholder='Cari file...']
 * @param {Function} options.onSearch - Callback with search term
 * @param {number} [options.delay=300]
 * @param {string} [options.id]
 * @returns {HTMLElement}
 */
export function SearchInput({ placeholder = 'Cari file...', onSearch, delay = 300, id }) {
  const wrapper = h('div', { className: 'search-input' });
  wrapper.innerHTML = `<span class="search-input__icon">${icons.search}</span>`;

  const input = h('input', {
    type: 'text',
    placeholder,
  });
  if (id) input.id = id;

  const debouncedSearch = debounce((value) => {
    if (onSearch) onSearch(value);
  }, delay);

  input.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
  });

  wrapper.appendChild(input);
  return wrapper;
}
