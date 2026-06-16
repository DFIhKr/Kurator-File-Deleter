/**
 * InputView.js
 * Step 1: File list input — textarea, drag & drop, import buttons.
 */

import { h, clearElement, formatNumber } from '../utils/helpers.js';
import { AppState } from '../state/AppState.js';
import { ParserService } from '../services/ParserService.js';
import { LoggerService } from '../services/LoggerService.js';
import { MAX_FILE_LIST_SIZE } from '../utils/constants.js';
import { Button } from '../components/Button.js';
import { DropZone } from '../components/DropZone.js';
import { showToast } from '../components/Toast.js';
import { icons } from '../icons/icons.js';

const logger = LoggerService.getInstance();

/**
 * Render the Input View.
 * @param {HTMLElement} container
 * @param {Function} onNext - Called when user proceeds to next step
 */
export function InputView(container, onNext) {
  clearElement(container);
  logger.info('Menampilkan halaman Input.');

  const view = h('div', { className: 'anim-fade-in' });

  // Title
  view.appendChild(
    h('div', { style: { marginBottom: 'var(--space-6)', textAlign: 'center' } },
      h('h2', { style: { marginBottom: 'var(--space-2)' } }, 'Masukkan Daftar File'),
      h('p', { style: { fontSize: 'var(--text-sm)' } }, 'Paste nama file yang ingin dihapus, atau impor dari file .txt')
    )
  );

  // Textarea card
  const textareaCard = h('div', { className: 'card', style: { marginBottom: 'var(--space-4)' } });
  const textareaWrapper = h('div', { className: 'textarea-wrapper' });
  const textarea = h('textarea', {
    id: 'file-input-textarea',
    placeholder: 'Ketik atau paste nama file di sini...\nContoh:\nreport.pdf\nphoto_001.jpg',
    style: { minHeight: '220px' },
  });

  // Restore previous input if any
  const existing = AppState.get('fileList');
  if (existing && existing.length > 0) {
    textarea.value = existing.join('\n');
  }

  const counter = h('div', { className: 'textarea-wrapper__count', id: 'line-counter' }, '0 file');

  const updateCounter = () => {
    const lines = textarea.value.split(/[\n\r,]+/).map(l => l.trim()).filter(l => l.length > 0);
    counter.textContent = `${formatNumber(lines.length)} file`;
  };

  textarea.addEventListener('input', updateCounter);
  updateCounter();

  textareaWrapper.appendChild(textarea);
  textareaWrapper.appendChild(counter);
  textareaCard.appendChild(textareaWrapper);
  view.appendChild(textareaCard);

  // Import buttons row
  const importRow = h('div', { style: { display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' } });

  const txtInput = h('input', { type: 'file', accept: '.txt', style: { display: 'none' } });
  txtInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) await handleFileImport(file, textarea, updateCounter);
    txtInput.value = '';
  });

  importRow.appendChild(txtInput);
  importRow.appendChild(Button({ text: 'Import TXT', variant: 'ghost', iconName: 'fileText', id: 'import-txt-btn', onClick: () => txtInput.click() }));
  importRow.appendChild(Button({ text: 'Hapus Semua', variant: 'ghost', iconName: 'trash2', id: 'clear-input-btn', onClick: () => { textarea.value = ''; updateCounter(); } }));

  view.appendChild(importRow);

  // Drop Zone
  view.appendChild(DropZone({
    id: 'file-drop-zone',
    onFileDrop: async (file) => {
      await handleFileImport(file, textarea, updateCounter);
    },
  }));

  // Spacer
  view.appendChild(h('div', { style: { height: 'var(--space-6)' } }));

  // Continue button
  const continueBtn = Button({
    text: 'Lanjutkan',
    variant: 'primary',
    size: 'lg',
    fullWidth: true,
    iconName: 'arrowRight',
    iconRight: true,
    id: 'continue-to-scan-btn',
    onClick: () => {
      const result = ParserService.parseText(textarea.value);

      if (result.errors.length > 0) {
        result.errors.forEach(err => showToast(err, 'warning'));
      }

      if (result.filenames.length === 0) {
        showToast('Tidak ada nama file valid. Silakan masukkan daftar file terlebih dahulu.', 'error');
        return;
      }

      if (result.filenames.length > MAX_FILE_LIST_SIZE) {
        showToast(`Maks ${formatNumber(MAX_FILE_LIST_SIZE)} file. Anda memasukkan ${formatNumber(result.filenames.length)}.`, 'error');
        return;
      }

      AppState.set('fileList', result.filenames);
      logger.action(`${result.filenames.length} nama file disimpan.`);
      showToast(`${formatNumber(result.filenames.length)} nama file berhasil diproses.`, 'success');
      onNext();
    },
  });

  view.appendChild(continueBtn);
  container.appendChild(view);
}

async function handleFileImport(file, textarea, updateCounter) {
  try {
    const result = await ParserService.parseFile(file);
    if (result.errors.length > 0) {
      result.errors.forEach(err => showToast(err, 'warning'));
    }
    if (result.filenames.length > 0) {
      const existing = textarea.value.trim();
      textarea.value = existing ? existing + '\n' + result.filenames.join('\n') : result.filenames.join('\n');
      updateCounter();
      showToast(`${formatNumber(result.filenames.length)} file diimpor dari "${file.name}".`, 'success');
    } else {
      showToast(`Tidak ada nama file valid di "${file.name}".`, 'warning');
    }
  } catch (err) {
    showToast(`Gagal mengimpor file: ${err.message}`, 'error');
  }
}
