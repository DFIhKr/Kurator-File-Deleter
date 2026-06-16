/**
 * MatcherService.js
 * SECURITY-CRITICAL: Exact filename matching engine.
 * Uses strict equality (===) only. No regex, no fuzzy, no wildcard, no partial matching.
 */

import { LoggerService } from './LoggerService.js';

const logger = LoggerService.getInstance();

export class MatcherService {
  /**
   * Cross-reference target file list against directory contents.
   * SECURITY: Uses === strict equality only.
   *
   * @param {string[]} targetList - User's list of filenames to match
   * @param {Map<string, object>} directoryFiles - Map<filename, fileInfo> from directory scan
   * @returns {{ matched: Array<{name: string, handle: object}>, notFound: string[] }}
   */
  static matchFiles(targetList, directoryFiles) {
    const matched = [];
    const notFound = [];

    for (const targetName of targetList) {
      // SECURITY: Exact string match only (===)
      // No .includes(), no .startsWith(), no regex, no toLowerCase()
      if (directoryFiles.has(targetName)) {
        const fileInfo = directoryFiles.get(targetName);

        // SECURITY: Double-verify the name from the handle matches
        if (fileInfo.name === targetName) {
          matched.push({
            name: targetName,
            handle: fileInfo.handle,
            dirHandle: fileInfo.dirHandle,
          });
        } else {
          // This should never happen, but guard against it
          logger.error(`KEAMANAN: Inkonsistensi Map — key "${targetName}" tetapi handle.name "${fileInfo.name}". File dilewati.`);
          notFound.push(targetName);
        }
      } else {
        notFound.push(targetName);
      }
    }

    logger.info(`Matching selesai: ${matched.length} cocok, ${notFound.length} tidak ditemukan dari ${targetList.length} target.`);
    return { matched, notFound };
  }
}
