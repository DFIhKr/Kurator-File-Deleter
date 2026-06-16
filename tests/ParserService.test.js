/**
 * ParserService.test.js
 * Unit tests for the filename parser.
 */

import { describe, it, expect } from 'vitest';
import { ParserService } from '../src/services/ParserService.js';

describe('ParserService', () => {
  describe('parseText', () => {
    it('should parse newline-separated filenames', () => {
      const result = ParserService.parseText('file1.jpg\nfile2.png\nfile3.pdf');
      expect(result.filenames).toEqual(['file1.jpg', 'file2.png', 'file3.pdf']);
      expect(result.errors).toHaveLength(0);
    });

    it('should parse comma-separated filenames', () => {
      const result = ParserService.parseText('file1.jpg,file2.png,file3.pdf');
      expect(result.filenames).toEqual(['file1.jpg', 'file2.png', 'file3.pdf']);
    });

    it('should parse mixed newline and comma input', () => {
      const result = ParserService.parseText('file1.jpg\nfile2.png,file3.pdf');
      expect(result.filenames).toEqual(['file1.jpg', 'file2.png', 'file3.pdf']);
    });

    it('should trim whitespace from filenames', () => {
      const result = ParserService.parseText('  file1.jpg  \n  file2.png  ');
      expect(result.filenames).toEqual(['file1.jpg', 'file2.png']);
    });

    it('should filter empty lines', () => {
      const result = ParserService.parseText('file1.jpg\n\n\nfile2.png\n\n');
      expect(result.filenames).toEqual(['file1.jpg', 'file2.png']);
    });

    it('should deduplicate filenames', () => {
      const result = ParserService.parseText('file1.jpg\nfile1.jpg\nfile2.png\nfile2.png');
      expect(result.filenames).toEqual(['file1.jpg', 'file2.png']);
    });

    it('should reject entries containing forward slash paths', () => {
      const result = ParserService.parseText('folder/file1.jpg\nfile2.png');
      expect(result.filenames).toEqual(['file2.png']);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('path');
    });

    it('should reject entries containing backslash paths', () => {
      const result = ParserService.parseText('folder\\file1.jpg\nfile2.png');
      expect(result.filenames).toEqual(['file2.png']);
      expect(result.errors).toHaveLength(1);
    });

    it('should reject entries that are too long (>255 chars)', () => {
      const longName = 'a'.repeat(256) + '.jpg';
      const result = ParserService.parseText(`${longName}\nfile2.png`);
      expect(result.filenames).toEqual(['file2.png']);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('panjang');
    });

    it('should return error for empty input', () => {
      const result = ParserService.parseText('');
      expect(result.filenames).toHaveLength(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return error for null input', () => {
      const result = ParserService.parseText(null);
      expect(result.filenames).toHaveLength(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle Windows-style line endings (CRLF)', () => {
      const result = ParserService.parseText('file1.jpg\r\nfile2.png\r\nfile3.pdf');
      expect(result.filenames).toEqual(['file1.jpg', 'file2.png', 'file3.pdf']);
    });

    it('should preserve exact filenames including extensions', () => {
      const result = ParserService.parseText('report.pdf\nreport.docx\nREPORT.PDF');
      expect(result.filenames).toEqual(['report.pdf', 'report.docx', 'REPORT.PDF']);
    });

    it('should handle filenames with special characters', () => {
      const result = ParserService.parseText('file (1).jpg\nfile-name_v2.png\nfile.name.ext.jpg');
      expect(result.filenames).toEqual(['file (1).jpg', 'file-name_v2.png', 'file.name.ext.jpg']);
    });
  });
});
