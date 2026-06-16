/**
 * PreviewView.js
 * Step 3: Match preview — shows matched and not-found files.
 */

import { h, clearElement, formatNumber } from '../utils/helpers.js';
import { AppState } from '../state/AppState.js';
import { LoggerService } from '../services/LoggerService.js';
import { Button } from '../components/Button.js';
import { SearchInput } from '../components/SearchInput.js';
import { FileListTable } from '../components/FileListTable.js';
import { Modal } from '../components/Modal.js';
import { showToast } from '../components/Toast.js';

const logger = LoggerService.getInstance();

/**
 * Render the Preview View.
 * @param {HTMLElement} container
 * @param {Function} onConfirmDelete
 * @param {Function} onBack
 */
export function PreviewView(container, onConfirmDelete, onBack) {
  clearElement(container);
  logger.info('Menampilkan halaman Preview.');

  const results = AppState.get('scanResults');
  if (!results) {
    showToast('Data scan tidak ditemukan. Kembali ke langkah sebelumnya.', 'error');
    onBack();
    return;
  }

  const { matched, notFound } = results;
  const view = h('div', { className: 'anim-fade-in' });

  // Title
  view.appendChild(
    h('div', { style: { marginBottom: 'var(--space-6)', textAlign: 'center' } },
      h('h2', { style: { marginBottom: 'var(--space-2)' } }, 'Preview Hasil Pencocokan'),
      h('p', { style: { fontSize: 'var(--text-sm)' } }, 'Periksa file yang akan dihapus sebelum melanjutkan.')
    )
  );

  // Summary badges
  const badgeRow = h('div', { style: { display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap' } });
  badgeRow.appendChild(h('span', { className: 'badge badge--brand' }, `✓ ${formatNumber(matched.length)} Ditemukan`));
  badgeRow.appendChild(h('span', { className: 'badge badge--warning' }, `⚠ ${formatNumber(notFound.length)} Tidak Ditemukan`));
  view.appendChild(badgeRow);

  // Tab system
  let activeTab = 'matched';
  const matchedFiles = matched.map(f => ({ name: f.name, status: 'matched' }));
  const notFoundFiles = notFound.map(name => ({ name, status: 'notfound' }));

  // Search
  let currentSearch = '';
  const searchInput = SearchInput({
    placeholder: 'Cari file...',
    id: 'preview-search',
    onSearch: (term) => {
      currentSearch = term.toLowerCase();
      updateTable();
    },
  });
  view.appendChild(h('div', { style: { marginBottom: 'var(--space-4)' } }, searchInput));

  // Tab group
  const tabGroup = h('div', { className: 'tab-group', style: { marginBottom: 'var(--space-4)' } });
  const matchedTab = h('button', {
    className: 'tab-btn tab-btn--active',
    id: 'tab-matched',
    onClick: () => {
      activeTab = 'matched';
      matchedTab.classList.add('tab-btn--active');
      notFoundTab.classList.remove('tab-btn--active');
      updateTable();
    },
  }, `Ditemukan (${formatNumber(matched.length)})`);

  const notFoundTab = h('button', {
    className: 'tab-btn',
    id: 'tab-notfound',
    onClick: () => {
      activeTab = 'notfound';
      notFoundTab.classList.add('tab-btn--active');
      matchedTab.classList.remove('tab-btn--active');
      updateTable();
    },
  }, `Tidak Ditemukan (${formatNumber(notFound.length)})`);

  tabGroup.appendChild(matchedTab);
  tabGroup.appendChild(notFoundTab);
  view.appendChild(tabGroup);

  // File table
  const table = FileListTable({
    files: matchedFiles,
    emptyText: 'Tidak ada file yang cocok.',
    id: 'preview-file-table',
  });
  view.appendChild(table);

  function updateTable() {
    const source = activeTab === 'matched' ? matchedFiles : notFoundFiles;
    const filtered = currentSearch
      ? source.filter(f => f.name.toLowerCase().includes(currentSearch))
      : source;
    table.updateFiles(filtered);
  }

  // Spacer
  view.appendChild(h('div', { style: { height: 'var(--space-6)' } }));

  // Action buttons
  const actions = h('div', { style: { display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' } });

  actions.appendChild(Button({
    text: 'Kembali',
    variant: 'ghost',
    iconName: 'arrowLeft',
    id: 'back-to-scan-btn',
    onClick: () => onBack(),
  }));

  if (matched.length > 0) {
    actions.appendChild(
      h('div', { style: { flex: '1' } },
        Button({
          text: `Hapus ${formatNumber(matched.length)} File`,
          variant: 'danger',
          size: 'lg',
          fullWidth: true,
          iconName: 'trash2',
          id: 'execute-delete-btn',
          onClick: () => {
            // MANDATORY confirmation modal per instruct.md
            Modal({
              title: 'Konfirmasi Penghapusan',
              message: `Tindakan ini tidak bisa dibatalkan dan file mungkin tidak masuk ke Recycle Bin. Lanjutkan menghapus ${formatNumber(matched.length)} file?`,
              iconName: 'shieldAlert',
              iconVariant: 'danger',
              confirmText: `Ya, Hapus ${formatNumber(matched.length)} File`,
              cancelText: 'Batal',
              confirmVariant: 'danger',
              onConfirm: () => {
                logger.action(`Pengguna mengkonfirmasi penghapusan ${matched.length} file.`);
                onConfirmDelete();
              },
              onCancel: () => {
                logger.info('Pengguna membatalkan penghapusan.');
              },
            });
          },
        })
      )
    );
  }

  view.appendChild(actions);
  container.appendChild(view);
}
