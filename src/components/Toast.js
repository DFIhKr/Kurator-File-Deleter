/**
 * Toast.js
 * Toast notification component.
 */

import { h } from '../utils/helpers.js';
import { icon } from '../icons/icons.js';
import { TOAST_DURATION } from '../utils/constants.js';

const ICON_MAP = {
  success: 'checkCircle',
  error: 'xCircle',
  warning: 'alertTriangle',
  info: 'info',
};

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {number} [duration]
 */
export function showToast(message, type = 'info', duration = TOAST_DURATION) {
  let container = document.getElementById('toast-root');
  if (!container.querySelector('.toast-container')) {
    const tc = h('div', { className: 'toast-container' });
    container.appendChild(tc);
    container = tc;
  } else {
    container = container.querySelector('.toast-container');
  }

  const toast = h('div', { className: `toast toast--${type} anim-slide-in` },
    h('span', { className: 'toast__icon', innerHTML: icon(ICON_MAP[type] || 'info').outerHTML }),
    h('span', { className: 'toast__text' }, message),
    h('button', {
      className: 'toast__close',
      onClick: () => removeToast(toast, container),
      innerHTML: icon('x').outerHTML,
    })
  );

  container.appendChild(toast);

  // Auto-remove
  setTimeout(() => removeToast(toast, container), duration);
}

function removeToast(toast, container) {
  if (!container.contains(toast)) return;
  toast.classList.remove('anim-slide-in');
  toast.classList.add('anim-slide-out');
  setTimeout(() => {
    if (container.contains(toast)) container.removeChild(toast);
  }, 200);
}
