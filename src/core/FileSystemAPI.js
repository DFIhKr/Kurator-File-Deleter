/**
 * FileSystemAPI.js
 * Wrapper around the File System Access API.
 * Handles directory picking, file listing, and safe file deletion.
 */

import { LoggerService } from '../services/LoggerService.js';

const logger = LoggerService.getInstance();

export class FileSystemAPI {
  /**
   * Opens a directory picker dialog and returns a directory handle with readwrite access.
   * @returns {Promise<FileSystemDirectoryHandle>}
   */
  static async pickDirectory() {
    try {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      logger.action(`Folder dipilih: "${handle.name}"`);
      return handle;
    } catch (err) {
      if (err.name === 'AbortError') {
        logger.info('Pemilihan folder dibatalkan oleh pengguna.');
        return null;
      }
      logger.error(`Gagal memilih folder: ${err.message}`);
      throw err;
    }
  }

  /**
   * Lists all files in the given directory (top-level only by default).
   * Returns a Map<filename, FileSystemFileHandle>.
   * @param {FileSystemDirectoryHandle} directoryHandle
   * @param {boolean} recursive - Whether to scan subdirectories (default: false)
   * @returns {Promise<Map<string, FileSystemFileHandle>>}
   */
  static async listFiles(directoryHandle, recursive = false) {
    const files = new Map();
    try {
      await FileSystemAPI._scanDirectory(directoryHandle, files, recursive, '');
      logger.info(`Scan selesai: ${files.size} file ditemukan di "${directoryHandle.name}"${recursive ? ' (termasuk subfolder)' : ''}.`);
      return files;
    } catch (err) {
      logger.error(`Gagal membaca isi folder: ${err.message}`);
      throw err;
    }
  }

  /**
   * Recursively (or not) scans a directory.
   * @private
   */
  static async _scanDirectory(dirHandle, filesMap, recursive, prefix) {
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file') {
        const fileName = prefix ? `${prefix}/${entry.name}` : entry.name;
        filesMap.set(fileName, { handle: entry, dirHandle: dirHandle, name: entry.name });
      } else if (entry.kind === 'directory' && recursive) {
        const subPrefix = prefix ? `${prefix}/${entry.name}` : entry.name;
        await FileSystemAPI._scanDirectory(entry, filesMap, recursive, subPrefix);
      }
    }
  }

  /**
   * Deletes a single file by its exact name from the directory.
   * SECURITY: Double-checks that the file name matches exactly before deletion.
   * @param {FileSystemDirectoryHandle} directoryHandle - The parent directory handle
   * @param {string} fileName - The exact file name to delete
   * @param {string} expectedName - The name from the user's target list (must === fileName)
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  static async deleteFile(directoryHandle, fileName, expectedName) {
    // SECURITY GUARD: Double-check exact match
    if (fileName !== expectedName) {
      const msg = `KEAMANAN: Nama file tidak cocok! "${fileName}" !== "${expectedName}". Penghapusan dibatalkan.`;
      logger.error(msg);
      return { success: false, error: msg };
    }

    try {
      await directoryHandle.removeEntry(fileName);
      logger.action(`File dihapus: "${fileName}"`);
      return { success: true };
    } catch (err) {
      const msg = `Gagal menghapus "${fileName}": ${err.message}`;
      logger.error(msg);
      return { success: false, error: msg };
    }
  }
}
