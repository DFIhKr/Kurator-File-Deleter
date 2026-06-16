/**
 * Button.js
 * Reusable button component with variants.
 */

import { h } from '../utils/helpers.js';
import { icon } from '../icons/icons.js';

/**
 * Create a button element.
 * @param {object} options
 * @param {string} options.text - Button text
 * @param {string} options.variant - 'primary'|'danger'|'ghost'|'secondary'
 * @param {string} [options.size] - 'sm'|'lg'
 * @param {string} [options.iconName] - Icon name
 * @param {boolean} [options.iconRight] - Place icon on right
 * @param {boolean} [options.disabled]
 * @param {boolean} [options.fullWidth]
 * @param {string} [options.id]
 * @param {Function} [options.onClick]
 * @returns {HTMLButtonElement}
 */
export function Button({ text, variant = 'primary', size, iconName, iconRight, disabled, fullWidth, id, onClick }) {
  const classes = ['btn', `btn--${variant}`];
  if (size) classes.push(`btn--${size}`);
  if (fullWidth) classes.push('btn--full');

  const attrs = { className: classes.join(' ') };
  if (id) attrs.id = id;
  if (disabled) attrs.disabled = 'disabled';
  if (onClick) attrs.onClick = onClick;

  const btn = h('button', attrs);

  if (iconName && !iconRight) {
    btn.appendChild(icon(iconName));
  }

  if (text) {
    btn.appendChild(document.createTextNode(text));
  }

  if (iconName && iconRight) {
    btn.appendChild(icon(iconName));
  }

  return btn;
}

/**
 * Create an icon-only button.
 */
export function IconButton({ iconName, variant = 'ghost', title, onClick, id }) {
  const btn = h('button', {
    className: `btn btn--${variant} btn--icon`,
    title: title || '',
    onClick,
  });
  if (id) btn.id = id;
  btn.appendChild(icon(iconName));
  return btn;
}
