/**
 * AppState.js
 * Centralized reactive state store using event emitter pattern.
 */

const INITIAL_STATE = {
  currentStep: 'input', // 'input' | 'scan' | 'preview' | 'execution' | 'summary'
  fileList: [],          // Parsed target filenames
  directoryHandle: null, // FileSystemDirectoryHandle
  directoryName: '',     // Folder name for display
  scanResults: null,     // { matched: [], notFound: [] }
  deletionResults: null, // { deleted: [], failed: [], skipped: [] }
  isLoading: false,
  error: null,
  theme: 'dark',
  includeSubfolders: false,
};

class StateStore {
  constructor() {
    this._state = { ...INITIAL_STATE };
    /** @type {Map<string, Set<Function>>} */
    this._listeners = new Map();

    // Load theme from localStorage
    const savedTheme = localStorage.getItem('kurator-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      this._state.theme = savedTheme;
    }
  }

  /**
   * Get current state value.
   * @param {string} key
   * @returns {*}
   */
  get(key) {
    return this._state[key];
  }

  /**
   * Get entire state object (shallow copy).
   * @returns {object}
   */
  getAll() {
    return { ...this._state };
  }

  /**
   * Set a state value and notify listeners.
   * @param {string} key
   * @param {*} value
   */
  set(key, value) {
    const oldValue = this._state[key];
    this._state[key] = value;

    // Persist theme
    if (key === 'theme') {
      localStorage.setItem('kurator-theme', value);
      document.documentElement.setAttribute('data-theme', value);
    }

    this._notify(key, value, oldValue);
  }

  /**
   * Update multiple state values.
   * @param {object} updates
   */
  update(updates) {
    for (const [key, value] of Object.entries(updates)) {
      this.set(key, value);
    }
  }

  /**
   * Subscribe to state changes on a specific key.
   * @param {string} key
   * @param {Function} callback - (newValue, oldValue) => void
   * @returns {Function} unsubscribe function
   */
  subscribe(key, callback) {
    if (!this._listeners.has(key)) {
      this._listeners.set(key, new Set());
    }
    this._listeners.get(key).add(callback);
    return () => this._listeners.get(key)?.delete(callback);
  }

  /**
   * Subscribe to any state change.
   * @param {Function} callback - (key, newValue, oldValue) => void
   * @returns {Function} unsubscribe function
   */
  subscribeAll(callback) {
    if (!this._listeners.has('*')) {
      this._listeners.set('*', new Set());
    }
    this._listeners.get('*').add(callback);
    return () => this._listeners.get('*')?.delete(callback);
  }

  /** @private */
  _notify(key, newValue, oldValue) {
    const keyListeners = this._listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach(cb => cb(newValue, oldValue));
    }
    const allListeners = this._listeners.get('*');
    if (allListeners) {
      allListeners.forEach(cb => cb(key, newValue, oldValue));
    }
  }

  /**
   * Reset state to initial values (preserves theme).
   */
  reset() {
    const theme = this._state.theme;
    this._state = { ...INITIAL_STATE, theme };
    // Notify all listeners about the reset
    for (const key of Object.keys(INITIAL_STATE)) {
      if (key !== 'theme') {
        this._notify(key, this._state[key], undefined);
      }
    }
  }
}

// Singleton export
export const AppState = new StateStore();
