/**
 * ExportService.js
 * Exports log data as TXT or CSV files via download.
 */

import { LoggerService } from './LoggerService.js';

const logger = LoggerService.getInstance();

export class ExportService {
  /**
   * Export logs as a formatted .txt file.
   * @param {Array<{timestamp: string, level: string, message: string}>} logs
   */
  static exportAsText(logs) {
    const header = '=== Kurator Batch File Deleter — Activity Log ===\n';
    const date = `Generated: ${new Date().toLocaleString('id-ID')}\n`;
    const separator = '='.repeat(50) + '\n\n';

    const body = logs.map(entry => {
      const time = new Date(entry.timestamp).toLocaleString('id-ID');
      return `[${time}] [${entry.level.padEnd(6)}] ${entry.message}`;
    }).join('\n');

    const content = header + date + separator + body;
    ExportService._download(content, 'kurator-log.txt', 'text/plain');
    logger.info('Log diekspor sebagai TXT.');
  }

  /**
   * Export logs as a .csv file.
   * @param {Array<{timestamp: string, level: string, message: string}>} logs
   */
  static exportAsCsv(logs) {
    const header = 'Timestamp,Level,Message\n';
    const body = logs.map(entry => {
      const escaped = entry.message.replace(/"/g, '""');
      return `"${entry.timestamp}","${entry.level}","${escaped}"`;
    }).join('\n');

    const content = header + body;
    ExportService._download(content, 'kurator-log.csv', 'text/csv');
    logger.info('Log diekspor sebagai CSV.');
  }

  /**
   * Trigger a file download in the browser.
   * @private
   * @param {string} content
   * @param {string} filename
   * @param {string} mimeType
   */
  static _download(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
