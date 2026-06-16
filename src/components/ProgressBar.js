/**
 * ProgressBar.js
 * Animated progress bar component.
 */

import { h } from '../utils/helpers.js';

/**
 * Create a progress bar element.
 * @param {number} percent - 0–100
 * @param {string} [label] - Optional label text
 * @param {boolean} [animated] - Show stripe animation
 * @returns {HTMLElement}
 */
export function ProgressBar(percent = 0, label = '', animated = false) {
  const fillClasses = ['progress-bar__fill'];
  if (animated && percent < 100) fillClasses.push('progress-bar__fill--active');

  const fill = h('div', {
    className: fillClasses.join(' '),
    style: { width: `${Math.min(100, Math.max(0, percent))}%` },
  });

  const bar = h('div', { className: 'progress-bar' }, fill);
  const wrapper = h('div', {}, bar);

  if (label) {
    wrapper.appendChild(h('div', { className: 'progress-bar__label' }, label));
  }

  // Expose update method
  wrapper.updateProgress = (newPercent, newLabel) => {
    fill.style.width = `${Math.min(100, Math.max(0, newPercent))}%`;
    if (newPercent >= 100) {
      fill.classList.remove('progress-bar__fill--active');
    }
    if (newLabel !== undefined) {
      const labelEl = wrapper.querySelector('.progress-bar__label');
      if (labelEl) labelEl.textContent = newLabel;
    }
  };

  return wrapper;
}
