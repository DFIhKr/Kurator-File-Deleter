/**
 * ParserService.js
 * Parses text, TXT files, and CSV files into clean filename arrays.
 */

import { LoggerService } from './LoggerService.js';

const logger = LoggerService.getInstance();

export class ParserService {
  /**
   * Parse raw text input into an array of filenames.
   * Splits by newline or comma, trims whitespace, filters empty, deduplicates.
   * @param {string} rawText
   * @returns {{ filenames: string[], errors: string[] }}
   */
  static parseText(rawText) {
    const errors = [];

    if (!rawText || typeof rawText !== 'string') {
      errors.push('Input teks kosong atau tidak valid.');
      return { filenames: [], errors };
    }

    // Split by newline or comma
    const lines = rawText
      .split(/[\n\r,]+/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const validNames = [];
    const seen = new Set();

    for (const line of lines) {
      // Reject entries containing path separators
      if (line.includes('/') || line.includes('\\')) {
        errors.push(`Ditolak (mengandung path): "${line}"`);
        continue;
      }

      // Reject entries that are too long (filesystem limit)
      if (line.length > 255) {
        errors.push(`Ditolak (nama terlalu panjang): "${line.substring(0, 50)}..."`);
        continue;
      }

      // Deduplicate
      if (seen.has(line)) {
        continue;
      }

      seen.add(line);
      validNames.push(line);
    }

    if (validNames.length === 0 && errors.length === 0) {
      errors.push('Tidak ada nama file valid yang ditemukan dalam input.');
    }

    logger.info(`Parser: ${validNames.length} nama file valid diproses, ${errors.length} error.`);
    return { filenames: validNames, errors };
  }

  /**
   * Parse a .txt file into filenames.
   * @param {File} file
   * @returns {Promise<{ filenames: string[], errors: string[] }>}
   */
  static async parseTxtFile(file) {
    try {
      const text = await file.text();
      logger.info(`Mengimpor file TXT: "${file.name}" (${file.size} bytes)`);
      return ParserService.parseText(text);
    } catch (err) {
      logger.error(`Gagal membaca file TXT "${file.name}": ${err.message}`);
      return { filenames: [], errors: [`Gagal membaca file: ${err.message}`] };
    }
  }

  /**
   * Parse a .csv file into filenames.
   * Extracts the first column from each row.
   * @param {File} file
   * @returns {Promise<{ filenames: string[], errors: string[] }>}
   */
  static async parseCsvFile(file) {
    try {
      const text = await file.text();
      logger.info(`Mengimpor file CSV: "${file.name}" (${file.size} bytes)`);

      // Parse CSV: extract first column
      const lines = text.split(/[\n\r]+/).filter(l => l.trim().length > 0);
      const filenames = [];

      for (const line of lines) {
        // Handle quoted CSV fields
        let firstCol;
        if (line.startsWith('"')) {
          const endQuote = line.indexOf('"', 1);
          firstCol = endQuote > 0 ? line.substring(1, endQuote) : line;
        } else {
          firstCol = line.split(',')[0];
        }
        firstCol = firstCol.trim();
        if (firstCol.length > 0) {
          filenames.push(firstCol);
        }
      }

      // Now parse through our standard text parser for validation
      return ParserService.parseText(filenames.join('\n'));
    } catch (err) {
      logger.error(`Gagal membaca file CSV "${file.name}": ${err.message}`);
      return { filenames: [], errors: [`Gagal membaca file: ${err.message}`] };
    }
  }

  /**
   * Auto-detect file type and parse accordingly.
   * @param {File} file
   * @returns {Promise<{ filenames: string[], errors: string[] }>}
   */
  static async parseFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'csv') {
      return ParserService.parseCsvFile(file);
    }
    // Default to TXT parsing for .txt and any other text files
    return ParserService.parseTxtFile(file);
  }
}
