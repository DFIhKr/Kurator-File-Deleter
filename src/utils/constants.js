/**
 * constants.js
 * Application constants and configuration.
 */

export const APP_NAME = 'Kurator';
export const APP_SUBTITLE = 'Batch File Deleter';
export const APP_VERSION = '1.0.0';

export const MAX_FILE_LIST_SIZE = 10000;

export const STEPS = [
  { id: 'input', label: 'Input', number: 1 },
  { id: 'scan', label: 'Scan', number: 2 },
  { id: 'preview', label: 'Preview', number: 3 },
  { id: 'execution', label: 'Hapus', number: 4 },
  { id: 'summary', label: 'Selesai', number: 5 },
];

export const ACCEPTED_FILE_TYPES = ['.txt', '.csv'];

export const TOAST_DURATION = 4000; // ms
