/**
 * LoggerService.js
 * Singleton activity logger with in-memory store.
 * Logs all important operations with timestamps.
 */

const LOG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  ACTION: 'ACTION',
};

export class LoggerService {
  /** @type {LoggerService|null} */
  static _instance = null;

  constructor() {
    /** @type {Array<{timestamp: string, level: string, message: string}>} */
    this._logs = [];
    /** @type {Set<Function>} */
    this._listeners = new Set();
  }

  /**
   * @returns {LoggerService}
   */
  static getInstance() {
    if (!LoggerService._instance) {
      LoggerService._instance = new LoggerService();
    }
    return LoggerService._instance;
  }

  /**
   * Subscribe to log updates.
   * @param {Function} callback
   * @returns {Function} unsubscribe function
   */
  subscribe(callback) {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  /** @private */
  _notify() {
    this._listeners.forEach(cb => cb(this._logs));
  }

  /**
   * Add a log entry.
   * @param {string} level
   * @param {string} message
   */
  _log(level, message) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };
    this._logs.push(entry);
    this._notify();

    // Also log to browser console for debugging
    const consoleFn = level === LOG_LEVELS.ERROR ? 'error' : level === LOG_LEVELS.WARN ? 'warn' : 'log';
    console[consoleFn](`[${level}] ${message}`);
  }

  info(message)   { this._log(LOG_LEVELS.INFO, message); }
  warn(message)   { this._log(LOG_LEVELS.WARN, message); }
  error(message)  { this._log(LOG_LEVELS.ERROR, message); }
  action(message) { this._log(LOG_LEVELS.ACTION, message); }

  /**
   * Returns all log entries (immutable copy).
   * @returns {Array<{timestamp: string, level: string, message: string}>}
   */
  getLogs() {
    return [...this._logs];
  }

  /**
   * Clears all logs.
   */
  clear() {
    this._logs = [];
    this._notify();
  }
}
