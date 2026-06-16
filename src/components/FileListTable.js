/**
 * FileListTable.js
 * Table/list for displaying file names with status indicators.
 */

import { h, clearElement } from '../utils/helpers.js';
import { icon } from '../icons/icons.js';

/**
 * Create a file list table.
 * @param {object} options
 * @param {Array<{name: string, status: string}>} options.files - File entries
 * @param {string} [options.emptyText='Tidak ada file.']
 * @param {string} [options.headerLabel='Nama File']
 * @param {string} [options.statusLabel='Status']
 * @param {string} [options.id]
 * @returns {HTMLElement}
 */
export function FileListTable({ files, emptyText = 'Tidak ada file.', headerLabel = 'Nama File', statusLabel = 'Status', id }) {
  const container = h('div', { className: 'card' });
  if (id) container.id = id;

  const header = h('div', { className: 'file-table__header' },
    h('span', {}, headerLabel),
    h('span', {}, statusLabel)
  );

  const body = h('div', { className: 'file-table__body' });

  if (!files || files.length === 0) {
    body.appendChild(
      h('div', { style: { padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' } }, emptyText)
    );
  } else {
    for (const file of files) {
      const statusIcon = getStatusIcon(file.status);
      const row = h('div', { className: 'file-table__row' },
        statusIcon,
        h('span', { className: 'file-table__name' }, file.name)
      );
      body.appendChild(row);
    }
  }

  container.appendChild(header);
  container.appendChild(body);

  // Expose update method
  container.updateFiles = (newFiles) => {
    clearElement(body);
    if (!newFiles || newFiles.length === 0) {
      body.appendChild(
        h('div', { style: { padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' } }, emptyText)
      );
    } else {
      for (const file of newFiles) {
        const statusIcon = getStatusIcon(file.status);
        const row = h('div', { className: 'file-table__row' },
          statusIcon,
          h('span', { className: 'file-table__name' }, file.name)
        );
        body.appendChild(row);
      }
    }
  };

  return container;
}

function getStatusIcon(status) {
  const span = h('span', { className: `file-table__status file-table__status--${status}` });
  switch (status) {
    case 'matched':
      span.appendChild(icon('checkCircle'));
      break;
    case 'notfound':
      span.appendChild(icon('alertTriangle'));
      break;
    case 'deleted':
      span.appendChild(icon('check'));
      break;
    case 'failed':
      span.appendChild(icon('xCircle'));
      break;
    default:
      span.appendChild(icon('file'));
  }
  return span;
}
