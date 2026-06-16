/**
 * DropZone.js
 * Drag and drop zone for .txt/.csv files.
 */

import { h } from '../utils/helpers.js';
import { icons } from '../icons/icons.js';

/**
 * Create a drop zone component.
 * @param {object} options
 * @param {Function} options.onFileDrop - Callback with File object
 * @param {string} [options.id]
 * @returns {HTMLElement}
 */
export function DropZone({ onFileDrop, id }) {
  const zone = h('div', { className: 'drop-zone' });
  if (id) zone.id = id;

  zone.innerHTML = `
    <div class="drop-zone__icon">${icons.upload}</div>
    <div class="drop-zone__title">Seret file ke sini</div>
    <div class="drop-zone__subtitle">atau klik untuk memilih file .txt / .csv</div>
  `;

  const fileInput = h('input', {
    type: 'file',
    accept: '.txt,.csv',
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && onFileDrop) onFileDrop(file);
    fileInput.value = ''; // Reset
  });

  zone.appendChild(fileInput);

  // Drag & Drop events
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('drop-zone--active');
  });

  zone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    zone.classList.remove('drop-zone--active');
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drop-zone--active');
    const file = e.dataTransfer.files[0];
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (ext === 'txt' || ext === 'csv') {
        if (onFileDrop) onFileDrop(file);
      }
    }
  });

  return zone;
}
