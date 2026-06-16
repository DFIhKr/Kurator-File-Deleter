/**
 * MatcherService.test.js
 * Unit tests for the exact filename matching engine.
 * SECURITY: Tests verify that only exact matches are accepted.
 */

import { describe, it, expect } from 'vitest';
import { MatcherService } from '../src/services/MatcherService.js';

function createMockFileMap(fileNames) {
  const map = new Map();
  for (const name of fileNames) {
    map.set(name, { handle: {}, dirHandle: {}, name });
  }
  return map;
}

describe('MatcherService', () => {
  describe('matchFiles — exact matching', () => {
    it('should match exact filenames', () => {
      const targets = ['report.pdf', 'photo.jpg'];
      const dirFiles = createMockFileMap(['report.pdf', 'photo.jpg', 'other.txt']);
      const result = MatcherService.matchFiles(targets, dirFiles);

      expect(result.matched).toHaveLength(2);
      expect(result.matched[0].name).toBe('report.pdf');
      expect(result.matched[1].name).toBe('photo.jpg');
      expect(result.notFound).toHaveLength(0);
    });

    it('should correctly identify not-found files', () => {
      const targets = ['report.pdf', 'missing.pdf'];
      const dirFiles = createMockFileMap(['report.pdf', 'other.txt']);
      const result = MatcherService.matchFiles(targets, dirFiles);

      expect(result.matched).toHaveLength(1);
      expect(result.matched[0].name).toBe('report.pdf');
      expect(result.notFound).toEqual(['missing.pdf']);
    });

    // SECURITY: Partial match rejection
    it('should NOT match partial filenames — report.pdf should NOT match report (1).pdf', () => {
      const targets = ['report.pdf'];
      const dirFiles = createMockFileMap(['report (1).pdf']);
      const result = MatcherService.matchFiles(targets, dirFiles);

      expect(result.matched).toHaveLength(0);
      expect(result.notFound).toEqual(['report.pdf']);
    });

    it('should NOT match report.pdf with report_final.pdf', () => {
      const targets = ['report.pdf'];
      const dirFiles = createMockFileMap(['report_final.pdf']);
      const result = MatcherService.matchFiles(targets, dirFiles);

      expect(result.matched).toHaveLength(0);
      expect(result.notFound).toEqual(['report.pdf']);
    });

    it('should NOT match report.pdf with my_report.pdf', () => {
      const targets = ['report.pdf'];
      const dirFiles = createMockFileMap(['my_report.pdf']);
      const result = MatcherService.matchFiles(targets, dirFiles);

      expect(result.matched).toHaveLength(0);
      expect(result.notFound).toEqual(['report.pdf']);
    });

    // SECURITY: Extension mismatch
    it('should NOT match report.pdf with report.docx (extension mismatch)', () => {
      const targets = ['report.pdf'];
      const dirFiles = createMockFileMap(['report.docx']);
      const result = MatcherService.matchFiles(targets, dirFiles);

      expect(result.matched).toHaveLength(0);
      expect(result.notFound).toEqual(['report.pdf']);
    });

    // SECURITY: Case sensitivity
    it('should NOT match Report.PDF with report.pdf (case-sensitive)', () => {
      const targets = ['Report.PDF'];
      const dirFiles = createMockFileMap(['report.pdf']);
      const result = MatcherService.matchFiles(targets, dirFiles);

      expect(result.matched).toHaveLength(0);
      expect(result.notFound).toEqual(['Report.PDF']);
    });

    it('should handle empty target list', () => {
      const targets = [];
      const dirFiles = createMockFileMap(['file1.jpg', 'file2.png']);
      const result = MatcherService.matchFiles(targets, dirFiles);

      expect(result.matched).toHaveLength(0);
      expect(result.notFound).toHaveLength(0);
    });

    it('should handle empty directory', () => {
      const targets = ['file1.jpg'];
      const dirFiles = createMockFileMap([]);
      const result = MatcherService.matchFiles(targets, dirFiles);

      expect(result.matched).toHaveLength(0);
      expect(result.notFound).toEqual(['file1.jpg']);
    });

    it('should handle filenames with special characters', () => {
      const targets = ['file (1).jpg', 'file-name_v2.png'];
      const dirFiles = createMockFileMap(['file (1).jpg', 'file-name_v2.png', 'file(1).jpg']);
      const result = MatcherService.matchFiles(targets, dirFiles);

      expect(result.matched).toHaveLength(2);
      expect(result.notFound).toHaveLength(0);
    });

    // The critical safety scenario from the user spec
    it('should ONLY match exact filename — full scenario from spec', () => {
      const targets = ['report.pdf'];
      const dirFiles = createMockFileMap([
        'report.pdf',          // Should match
        'report (1).pdf',      // Should NOT match
        'report_final.pdf',    // Should NOT match
        'my_report.pdf',       // Should NOT match
        'report.docx',         // Should NOT match
      ]);
      const result = MatcherService.matchFiles(targets, dirFiles);

      expect(result.matched).toHaveLength(1);
      expect(result.matched[0].name).toBe('report.pdf');
      expect(result.notFound).toHaveLength(0);
    });
  });
});
