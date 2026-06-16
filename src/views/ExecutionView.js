/**
 * ExecutionView.js
 * Step 4: Deletion execution with progress bar.
 */

import { h, clearElement, formatNumber } from '../utils/helpers.js';
import { AppState } from '../state/AppState.js';
import { DeletionEngine } from '../services/DeletionEngine.js';
import { LoggerService } from '../services/LoggerService.js';
import { ProgressBar } from '../components/ProgressBar.js';
import { showToast } from '../components/Toast.js';

const logger = LoggerService.getInstance();

/**
 * Render the Execution View and start deletion.
 * @param {HTMLElement} container
 * @param {Function} onComplete
 */
export function ExecutionView(container, onComplete) {
  clearElement(container);
  logger.info('Menampilkan halaman Eksekusi.');

  const results = AppState.get('scanResults');
  const dirHandle = AppState.get('directoryHandle');
  const fileList = AppState.get('fileList');

  if (!results || !dirHandle) {
    showToast('Data tidak lengkap. Kembali ke langkah sebelumnya.', 'error');
    return;
  }

  const matched = results.matched;
  const total = matched.length;

  const view = h('div', { className: 'anim-fade-in' });

  // Title
  view.appendChild(
    h('div', { style: { marginBottom: 'var(--space-8)', textAlign: 'center' } },
      h('h2', { style: { marginBottom: 'var(--space-2)' } }, 'Menghapus File...'),
      h('p', { style: { fontSize: 'var(--text-sm)' } }, 'Jangan tutup halaman ini selama proses berlangsung.')
    )
  );

  // Progress bar
  const progressBar = ProgressBar(0, `0 / ${formatNumber(total)}`, true);
  view.appendChild(h('div', { className: 'card', style: { marginBottom: 'var(--space-4)' } }, progressBar));

  // Current file display
  const currentFileEl = h('div', {
    id: 'current-file',
    style: {
      textAlign: 'center',
      fontSize: 'var(--text-sm)',
      color: 'var(--color-text-muted)',
      fontFamily: 'var(--font-mono)',
      marginBottom: 'var(--space-4)',
      padding: 'var(--space-3)',
      minHeight: '40px',
    },
  }, 'Memulai...');
  view.appendChild(currentFileEl);

  // Live counters
  const countersEl = h('div', {
    style: { display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', marginBottom: 'var(--space-6)' },
  });

  const deletedCount = h('div', { className: 'stat-card', style: { flex: '1' } });
  deletedCount.innerHTML = `<div class="stat-card__value" style="color:var(--color-brand-500)" id="counter-deleted">0</div><div class="stat-card__label">Dihapus</div>`;

  const failedCount = h('div', { className: 'stat-card', style: { flex: '1' } });
  failedCount.innerHTML = `<div class="stat-card__value" style="color:var(--color-danger-500)" id="counter-failed">0</div><div class="stat-card__label">Gagal</div>`;

  const totalCount = h('div', { className: 'stat-card', style: { flex: '1' } });
  totalCount.innerHTML = `<div class="stat-card__value" id="counter-total">0 / ${formatNumber(total)}</div><div class="stat-card__label">Progress</div>`;

  countersEl.appendChild(deletedCount);
  countersEl.appendChild(failedCount);
  countersEl.appendChild(totalCount);
  view.appendChild(countersEl);

  container.appendChild(view);

  // Start deletion
  let deletedN = 0;
  let failedN = 0;

  const onProgress = (current, totalFiles, fileName, status) => {
    const percent = Math.round((current / totalFiles) * 100);
    progressBar.updateProgress(percent, `${formatNumber(current)} / ${formatNumber(totalFiles)} (${percent}%)`);
    currentFileEl.textContent = fileName;

    if (status === 'deleted') deletedN++;
    if (status === 'failed') failedN++;

    document.getElementById('counter-deleted').textContent = formatNumber(deletedN);
    document.getElementById('counter-failed').textContent = formatNumber(failedN);
    document.getElementById('counter-total').textContent = `${formatNumber(current)} / ${formatNumber(totalFiles)}`;
  };

  DeletionEngine.executeDelete(dirHandle, matched, fileList, onProgress)
    .then((deletionResults) => {
      AppState.set('deletionResults', deletionResults);
      progressBar.updateProgress(100, 'Selesai!');
      currentFileEl.textContent = 'Proses penghapusan selesai.';
      currentFileEl.style.color = 'var(--color-brand-500)';

      showToast(`Penghapusan selesai: ${formatNumber(deletionResults.deleted.length)} file dihapus.`, 'success');

      // Auto-advance after a brief pause
      setTimeout(() => onComplete(), 1500);
    })
    .catch((err) => {
      logger.error(`Proses penghapusan gagal: ${err.message}`);
      showToast(`Proses gagal: ${err.message}`, 'error');
      currentFileEl.textContent = `Error: ${err.message}`;
      currentFileEl.style.color = 'var(--color-danger-500)';
    });
}
