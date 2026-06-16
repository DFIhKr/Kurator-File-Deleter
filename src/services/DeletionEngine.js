/**
 * DeletionEngine.js
 * Safe file deletion orchestrator.
 * Handles batch deletion with progress reporting, per-file error handling,
 * and mandatory double-check security guard.
 */

import { LoggerService } from './LoggerService.js';

const logger = LoggerService.getInstance();

export class DeletionEngine {
  /**
   * Execute batch file deletion with progress reporting.
   *
   * SECURITY: Before each deletion, re-verifies that the filename
   * matches the target list entry exactly (===).
   *
   * @param {FileSystemDirectoryHandle} directoryHandle - Root directory handle
   * @param {Array<{name: string, handle: object, dirHandle: object}>} matchedFiles - Files to delete
   * @param {string[]} targetList - Original target list for double-check
   * @param {Function} onProgress - Callback: (current, total, fileName, status) => void
   * @returns {Promise<{deleted: string[], failed: Array<{name: string, error: string}>, skipped: string[]}>}
   */
  static async executeDelete(directoryHandle, matchedFiles, targetList, onProgress) {
    const deleted = [];
    const failed = [];
    const skipped = [];
    const total = matchedFiles.length;
    const targetSet = new Set(targetList);

    logger.action(`Memulai penghapusan ${total} file...`);

    for (let i = 0; i < matchedFiles.length; i++) {
      const file = matchedFiles[i];
      const fileName = file.name;

      // SECURITY: Double-check guard — verify filename is in original target list
      if (!targetSet.has(fileName)) {
        const msg = `KEAMANAN: "${fileName}" tidak ada di daftar target asli. Dilewati.`;
        logger.error(msg);
        skipped.push(fileName);
        if (onProgress) onProgress(i + 1, total, fileName, 'skipped');
        continue;
      }

      try {
        // Use the file's parent directory handle for deletion
        const parentHandle = file.dirHandle || directoryHandle;
        await parentHandle.removeEntry(fileName);
        deleted.push(fileName);
        logger.action(`Dihapus: "${fileName}"`);
        if (onProgress) onProgress(i + 1, total, fileName, 'deleted');
      } catch (err) {
        const errorMsg = `Gagal menghapus "${fileName}": ${err.message}`;
        logger.error(errorMsg);
        failed.push({ name: fileName, error: err.message });
        if (onProgress) onProgress(i + 1, total, fileName, 'failed');
      }

      // Small delay to allow UI updates and prevent UI freeze
      if (i % 10 === 9) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    logger.action(`Penghapusan selesai: ${deleted.length} dihapus, ${failed.length} gagal, ${skipped.length} dilewati.`);

    return { deleted, failed, skipped };
  }
}
