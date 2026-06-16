/**
 * ThemeToggle.js
 * Dark/Light mode toggle button.
 */

import { h } from '../utils/helpers.js';
import { icon } from '../icons/icons.js';
import { AppState } from '../state/AppState.js';

/**
 * Create a theme toggle button.
 * @returns {HTMLButtonElement}
 */
export function ThemeToggle() {
  const btn = h('button', {
    className: 'theme-toggle',
    title: 'Ganti tema',
    id: 'theme-toggle-btn',
  });

  const updateIcon = () => {
    const theme = AppState.get('theme');
    btn.innerHTML = '';
    btn.appendChild(icon(theme === 'dark' ? 'sun' : 'moon'));
  };

  btn.addEventListener('click', () => {
    const current = AppState.get('theme');
    AppState.set('theme', current === 'dark' ? 'light' : 'dark');
    updateIcon();
  });

  updateIcon();
  return btn;
}
