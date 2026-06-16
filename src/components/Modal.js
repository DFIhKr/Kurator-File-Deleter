/**
 * Modal.js
 * Confirmation dialog modal component.
 */

import { h, clearElement } from '../utils/helpers.js';
import { icon } from '../icons/icons.js';
import { Button } from './Button.js';

/**
 * Show a confirmation modal.
 * @param {object} options
 * @param {string} options.title
 * @param {string} options.message
 * @param {string} [options.iconName='alertTriangle']
 * @param {string} [options.iconVariant='danger']
 * @param {string} options.confirmText
 * @param {string} [options.cancelText='Batal']
 * @param {string} [options.confirmVariant='danger']
 * @param {Function} options.onConfirm
 * @param {Function} [options.onCancel]
 * @returns {HTMLElement}
 */
export function Modal({ title, message, iconName = 'alertTriangle', iconVariant = 'danger', confirmText, cancelText = 'Batal', confirmVariant = 'danger', onConfirm, onCancel }) {
  const root = document.getElementById('modal-root');

  const close = () => {
    if (overlay.classList) {
      overlay.classList.add('anim-fade-out');
      setTimeout(() => { if (root.contains(overlay)) root.removeChild(overlay); }, 200);
    } else {
      if (root.contains(overlay)) root.removeChild(overlay);
    }
  };

  const overlay = h('div', {
    className: 'modal-overlay anim-fade-in',
    onClick: (e) => {
      if (e.target === overlay) {
        close();
        onCancel && onCancel();
      }
    },
  },
    h('div', { className: 'modal anim-fade-in-scale' },
      h('div', { className: `modal__icon modal__icon--${iconVariant}` },
        icon(iconName)
      ),
      h('h3', { className: 'modal__title' }, title),
      h('p', { className: 'modal__message' }, message),
      h('div', { className: 'modal__actions' },
        Button({
          text: cancelText,
          variant: 'ghost',
          onClick: () => { close(); onCancel && onCancel(); },
        }),
        Button({
          text: confirmText,
          variant: confirmVariant,
          onClick: () => { close(); onConfirm(); },
          id: 'modal-confirm-btn',
        })
      )
    )
  );

  clearElement(root);
  root.appendChild(overlay);
  return overlay;
}
