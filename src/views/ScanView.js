/**
 * ScanView.js
 * Step 2: Folder selection + scanning.
 */

import { h, clearElement, formatNumber } from '../utils/helpers.js';
import { AppState } from '../state/AppState.js';
import { FileSystemAPI } from '../core/FileSystemAPI.js';
import { MatcherService } from '../services/MatcherService.js';
import { LoggerService } from '../services/LoggerService.js';
import { Button } from '../components/Button.js';
import { showToast } from '../components/Toast.js';
import { icons } from '../icons/icons.js';

const logger = LoggerService.getInstance();

/**
 * Render the Scan View.
 * @param {HTMLElement} container
 * @param {Function} onNext
 * @param {Function} onBack
 */
export function ScanView(container, onNext, onBack) {
  clearElement(container);
  logger.info('Menampilkan halaman Scan.');

  const fileList = AppState.get('fileList');
  const view = h('div', { className: 'anim-fade-in' });

  // Title
  view.appendChild(
    h('div', { style: { marginBottom: 'var(--space-6)', textAlign: 'center' } },
      h('h2', { style: { marginBottom: 'var(--space-2)' } }, 'Pilih Folder Sumber'),
      h('p', { style: { fontSize: 'var(--text-sm)' } },
        `${formatNumber(fileList.length)} file akan dicocokkan dengan isi folder yang Anda pilih.`
      )
    )
  );

  // Subfolder toggle
  const includeSubfolders = AppState.get('includeSubfolders');
  const toggleRow = h('div', { className: 'toggle-row', style: { marginBottom: 'var(--space-6)' } });
  toggleRow.appendChild(h('span', { className: 'toggle-row__label' }, 'Scan subfolder (rekursif)'));

  const toggleSwitch = h('div', {
    className: `toggle-switch ${includeSubfolders ? 'toggle-switch--on' : ''}`,
    id: 'subfolder-toggle',
  });
  const thumb = h('div', { className: 'toggle-switch__thumb' });
  toggleSwitch.appendChild(thumb);
  toggleSwitch.addEventListener('click', () => {
    const current = AppState.get('includeSubfolders');
    AppState.set('includeSubfolders', !current);
    toggleSwitch.classList.toggle('toggle-switch--on', !current);
  });
  toggleRow.appendChild(toggleSwitch);
  view.appendChild(toggleRow);

  // Select Folder Button
  const statusArea = h('div', { id: 'scan-status', style: { marginBottom: 'var(--space-6)' } });

  const selectBtn = Button({
    text: 'Pilih Folder Sumber',
    variant: 'primary',
    size: 'lg',
    fullWidth: true,
    iconName: 'folderOpen',
    id: 'select-folder-btn',
    onClick: async () => {
      try {
        AppState.set('isLoading', true);
        selectBtn.disabled = true;

        const dirHandle = await FileSystemAPI.pickDirectory();
        if (!dirHandle) {
          AppState.set('isLoading', false);
          selectBtn.disabled = false;
          return;
        }

        AppState.set('directoryHandle', dirHandle);
        AppState.set('directoryName', dirHandle.name);

        // Show scanning status
        clearElement(statusArea);
        statusArea.appendChild(
          h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', padding: 'var(--space-6)' } },
            h('div', { className: 'spinner' }),
            h('span', { style: { color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' } }, `Memindai folder "${dirHandle.name}"...`)
          )
        );

        // Scan directory
        const recursive = AppState.get('includeSubfolders');
        const directoryFiles = await FileSystemAPI.listFiles(dirHandle, recursive);

        // Match files
        const results = MatcherService.matchFiles(fileList, directoryFiles);
        AppState.set('scanResults', results);

        // Show results summary
        clearElement(statusArea);
        const summaryCard = h('div', { className: 'card', style: { textAlign: 'center' } });
        summaryCard.innerHTML = `
          <div style="display:flex;gap:var(--space-4);justify-content:center;margin-bottom:var(--space-4)">
            <div class="stat-card" style="flex:1">
              <div class="stat-card__value" style="color:var(--color-brand-500)">${formatNumber(results.matched.length)}</div>
              <div class="stat-card__label">Ditemukan</div>
            </div>
            <div class="stat-card" style="flex:1">
              <div class="stat-card__value" style="color:var(--color-warning-500)">${formatNumber(results.notFound.length)}</div>
              <div class="stat-card__label">Tidak Ditemukan</div>
            </div>
            <div class="stat-card" style="flex:1">
              <div class="stat-card__value">${formatNumber(directoryFiles.size)}</div>
              <div class="stat-card__label">Total di Folder</div>
            </div>
          </div>
          <p style="font-size:var(--text-sm);color:var(--color-text-muted)">Folder: "${dirHandle.name}"${recursive ? ' (termasuk subfolder)' : ''}</p>
        `;
        statusArea.appendChild(summaryCard);

        AppState.set('isLoading', false);
        selectBtn.disabled = false;

        showToast(`Scan selesai: ${formatNumber(results.matched.length)} file ditemukan.`, 'success');

        // Show continue button
        if (results.matched.length > 0) {
          const continueBtn = Button({
            text: `Lanjutkan ke Preview (${formatNumber(results.matched.length)} file)`,
            variant: 'primary',
            size: 'lg',
            fullWidth: true,
            iconName: 'arrowRight',
            iconRight: true,
            id: 'continue-to-preview-btn',
            onClick: () => onNext(),
          });
          statusArea.appendChild(h('div', { style: { marginTop: 'var(--space-4)' } }, continueBtn));
        } else {
          showToast('Tidak ada file yang cocok ditemukan. Periksa daftar file dan folder Anda.', 'warning');
        }

      } catch (err) {
        AppState.set('isLoading', false);
        selectBtn.disabled = false;
        logger.error(`Gagal scan folder: ${err.message}`);
        showToast(`Gagal memindai folder: ${err.message}`, 'error');
        clearElement(statusArea);
      }
    },
  });

  view.appendChild(selectBtn);
  view.appendChild(h('div', { style: { height: 'var(--space-4)' } }));
  view.appendChild(statusArea);

  // Back button
  view.appendChild(h('div', { style: { marginTop: 'var(--space-4)' } },
    Button({
      text: 'Kembali',
      variant: 'ghost',
      iconName: 'arrowLeft',
      id: 'back-to-input-btn',
      onClick: () => onBack(),
    })
  ));

  container.appendChild(view);
}
