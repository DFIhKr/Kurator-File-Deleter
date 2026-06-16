/**
 * DeletionEngine.test.js
 * Unit tests for the deletion engine.
 */

import { describe, it, expect, vi } from 'vitest';
import { DeletionEngine } from '../src/services/DeletionEngine.js';

function createMockDirHandle(existingFiles) {
  return {
    removeEntry: vi.fn(async (name) => {
      if (!existingFiles.includes(name)) {
        throw new Error(`File not found: ${name}`);
      }
    }),
  };
}

describe('DeletionEngine', () => {
  it('should delete only matched files', async () => {
    const dirHandle = createMockDirHandle(['file1.jpg', 'file2.png']);
    const matched = [
      { name: 'file1.jpg', handle: {}, dirHandle },
      { name: 'file2.png', handle: {}, dirHandle },
    ];
    const targetList = ['file1.jpg', 'file2.png'];

    const result = await DeletionEngine.executeDelete(dirHandle, matched, targetList);

    expect(result.deleted).toEqual(['file1.jpg', 'file2.png']);
    expect(result.failed).toHaveLength(0);
    expect(result.skipped).toHaveLength(0);
    expect(dirHandle.removeEntry).toHaveBeenCalledTimes(2);
  });

  it('should report progress correctly', async () => {
    const dirHandle = createMockDirHandle(['file1.jpg', 'file2.png']);
    const matched = [
      { name: 'file1.jpg', handle: {}, dirHandle },
      { name: 'file2.png', handle: {}, dirHandle },
    ];
    const targetList = ['file1.jpg', 'file2.png'];
    const progressCalls = [];

    await DeletionEngine.executeDelete(dirHandle, matched, targetList, (current, total, name, status) => {
      progressCalls.push({ current, total, name, status });
    });

    expect(progressCalls).toHaveLength(2);
    expect(progressCalls[0]).toEqual({ current: 1, total: 2, name: 'file1.jpg', status: 'deleted' });
    expect(progressCalls[1]).toEqual({ current: 2, total: 2, name: 'file2.png', status: 'deleted' });
  });

  it('should handle individual file deletion failures gracefully', async () => {
    const dirHandle = createMockDirHandle(['file1.jpg']); // file2 will fail
    const matched = [
      { name: 'file1.jpg', handle: {}, dirHandle },
      { name: 'file2.png', handle: {}, dirHandle },
    ];
    const targetList = ['file1.jpg', 'file2.png'];

    const result = await DeletionEngine.executeDelete(dirHandle, matched, targetList);

    expect(result.deleted).toEqual(['file1.jpg']);
    expect(result.failed).toHaveLength(1);
    expect(result.failed[0].name).toBe('file2.png');
    expect(result.failed[0].error).toBeTruthy();
  });

  it('should NEVER delete files not in target list (security guard)', async () => {
    const dirHandle = createMockDirHandle(['rogue.jpg']);
    const matched = [
      { name: 'rogue.jpg', handle: {}, dirHandle },
    ];
    // Target list does NOT include 'rogue.jpg'
    const targetList = ['other.jpg'];

    const result = await DeletionEngine.executeDelete(dirHandle, matched, targetList);

    expect(result.deleted).toHaveLength(0);
    expect(result.skipped).toEqual(['rogue.jpg']);
    expect(dirHandle.removeEntry).not.toHaveBeenCalled();
  });

  it('should handle empty matched list', async () => {
    const dirHandle = createMockDirHandle([]);
    const result = await DeletionEngine.executeDelete(dirHandle, [], []);

    expect(result.deleted).toHaveLength(0);
    expect(result.failed).toHaveLength(0);
    expect(result.skipped).toHaveLength(0);
  });
});
