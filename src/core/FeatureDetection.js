/**
 * FeatureDetection.js
 * Browser compatibility checks for File System Access API.
 */

export class FeatureDetection {
  /**
   * Checks if the File System Access API is available.
   * @returns {boolean}
   */
  static isSupported() {
    return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
  }

  /**
   * Returns a user-friendly incompatibility message.
   * @returns {string|null} null if supported, message string if not
   */
  static getIncompatibilityMessage() {
    if (FeatureDetection.isSupported()) return null;

    return 'Browser Anda tidak mendukung File System Access API. ' +
      'Aplikasi ini membutuhkan Google Chrome (versi 86+) atau Microsoft Edge (versi 86+) versi desktop. ' +
      'Silakan buka aplikasi ini menggunakan salah satu browser yang didukung.';
  }

  /**
   * Returns browser info for logging.
   * @returns {string}
   */
  static getBrowserInfo() {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    return 'Unknown';
  }
}
