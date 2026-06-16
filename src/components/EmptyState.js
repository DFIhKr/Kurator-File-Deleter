/**
 * EmptyState.js
 * Centered placeholder with icon and instructional text.
 */

import { h } from '../utils/helpers.js';
import { icon } from '../icons/icons.js';

/**
 * Create an empty state component.
 * @param {object} options
 * @param {string} options.iconName
 * @param {string} options.title
 * @param {string} [options.description]
 * @returns {HTMLElement}
 */
export function EmptyState({ iconName, title, description }) {
  const el = h('div', { className: 'empty-state anim-fade-in' });

  const iconEl = icon(iconName);
  if (iconEl) {
    iconEl.classList.add('empty-state__icon');
    // Set size via style since SVG may not inherit class sizing
    iconEl.setAttribute('width', '64');
    iconEl.setAttribute('height', '64');
    el.appendChild(iconEl);
  }

  el.appendChild(h('div', { className: 'empty-state__title' }, title));

  if (description) {
    el.appendChild(h('div', { className: 'empty-state__desc' }, description));
  }

  return el;
}
