/**
 * SummaryView.js
 * Step 5: Results summary with log viewer and export.
 */

import { h, clearElement, formatNumber, formatTime } from '../utils/helpers.js';
import { AppState } from '../state/AppState.js';
import { LoggerService } from '../services/LoggerService.js';
import { ExportService } from '../services/ExportService.js';
import { Button } from '../components/Button.js';
import { SearchInput } from '../components/SearchInput.js';
import { FileListTable } from '../components/FileListTable.js';
import { showToast } from '../components/Toast.js';

const logger = LoggerService.getInstance();

/**
 * Render the Summary View.
 * @param {HTMLElement} container
 * @param {Function} onRestart
 */
export function SummaryView(container, onRestart) {
  clearElement(container);
  logger.info('Menampilkan halaman Ringkasan.');

  const deletionResults = AppState.get('deletionResults');
  if (!deletionResults) {
    showToast('Tidak ada data hasil penghapusan.', 'error');
    return;
  }

  const { deleted, failed, skipped } = deletionResults;
  const view = h('div', { className: 'anim-fade-in' });

  // Title
  view.appendChild(
    h('div', { style: { marginBottom: 'var(--space-6)', textAlign: 'center' } },
      h('h2', { style: { marginBottom: 'var(--space-2)' } }, 'Selesai!'),
      h('p', { style: { fontSize: 'var(--text-sm)' } }, 'Berikut ringkasan proses penghapusan file.')
    )
  );

  // Stats
  const stats = h('div', { style: { display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', justifyContent: 'center' } });

  const statDeleted = h('div', { className: 'stat-card', style: { flex: '1' } });
  statDeleted.innerHTML = `<div class="stat-card__value" style="color:var(--color-brand-500)">${formatNumber(deleted.length)}</div><div class="stat-card__label">Dihapus</div>`;

  const statFailed = h('div', { className: 'stat-card', style: { flex: '1' } });
  statFailed.innerHTML = `<div class="stat-card__value" style="color:var(--color-danger-500)">${formatNumber(failed.length)}</div><div class="stat-card__label">Gagal</div>`;

  const statSkipped = h('div', { className: 'stat-card', style: { flex: '1' } });
  statSkipped.innerHTML = `<div class="stat-card__value" style="color:var(--color-warning-500)">${formatNumber(skipped.length)}</div><div class="stat-card__label">Dilewati</div>`;

  stats.appendChild(statDeleted);
  stats.appendChild(statFailed);
  stats.appendChild(statSkipped);
  view.appendChild(stats);

  // File result lists
  if (deleted.length > 0) {
    view.appendChild(h('h4', { style: { marginBottom: 'var(--space-3)' } }, 'File Berhasil Dihapus'));
    view.appendChild(FileListTable({
      files: deleted.map(name => ({ name, status: 'deleted' })),
      id: 'deleted-files-table',
    }));
    view.appendChild(h('div', { style: { height: 'var(--space-4)' } }));
  }

  if (failed.length > 0) {
    view.appendChild(h('h4', { style: { marginBottom: 'var(--space-3)', color: 'var(--color-danger-500)' } }, 'File Gagal Dihapus'));
    view.appendChild(FileListTable({
      files: failed.map(f => ({ name: `${f.name} — ${f.error}`, status: 'failed' })),
      id: 'failed-files-table',
    }));
    view.appendChild(h('div', { style: { height: 'var(--space-4)' } }));
  }

  // Activity Log section
  view.appendChild(h('div', { className: 'divider' }));
  view.appendChild(h('h4', { style: { marginBottom: 'var(--space-3)' } }, 'Log Aktivitas'));

  const logs = logger.getLogs();
  const logContainer = h('div', {
    className: 'card',
    style: { maxHeight: '300px', overflowY: 'auto', padding: 'var(--space-4)' },
    id: 'activity-log',
  });

  for (const entry of logs) {
    const logRow = h('div', { className: 'log-entry' },
      h('span', { className: 'log-entry__time' }, formatTime(entry.timestamp)),
      h('span', { className: `log-entry__level log-entry__level--${entry.level.toLowerCase()}` }, entry.level),
      h('span', { className: 'log-entry__message' }, entry.message)
    );
    logContainer.appendChild(logRow);
  }

  view.appendChild(logContainer);
  view.appendChild(h('div', { style: { height: 'var(--space-4)' } }));

  // Action buttons
  const actions = h('div', { style: { display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' } });

  actions.appendChild(Button({
    text: 'Export Log TXT',
    variant: 'ghost',
    iconName: 'download',
    id: 'export-log-txt-btn',
    onClick: () => ExportService.exportAsText(logs),
  }));

  actions.appendChild(Button({
    text: 'Export Log CSV',
    variant: 'ghost',
    iconName: 'download',
    id: 'export-log-csv-btn',
    onClick: () => ExportService.exportAsCsv(logs),
  }));

  actions.appendChild(
    h('div', { style: { flex: '1' } },
      Button({
        text: 'Mulai Tugas Baru',
        variant: 'primary',
        size: 'lg',
        fullWidth: true,
        iconName: 'rotateCcw',
        id: 'restart-btn',
        onClick: () => {
          logger.clear();
          AppState.reset();
          onRestart();
        },
      })
    )
  );

  view.appendChild(actions);
  container.appendChild(view);
}
