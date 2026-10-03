import { describe, expect, it } from 'vitest';
import { Bm25Index, fixedChunks, isRelevant } from '../src/index.ts';

describe('fixedChunks', () => {
  it('keeps source offsets and exact text', () => {
    const source = '0123456789';
    const chunks = fixedChunks(source, 4, 1);
    expect(chunks.map((chunk) => [chunk.start, chunk.end, chunk.text])).toEqual([
      [0, 4, '0123'], [3, 7, '3456'], [6, 10, '6789'],
    ]);
  });
});

describe('span relevance', () => {
  it('uses overlap against the shorter span', () => {
    const chunk = { chunkId: 'chunk-0', text: 'abcd', start: 0, end: 4 };
    expect(isRelevant(chunk, { start: 2, end: 6 })).toBe(true);
    expect(isRelevant(chunk, { start: 4, end: 8 })).toBe(false);
  });
});

describe('BM25', () => {
  it('ranks a matching document first and breaks ties by chunk id', () => {
    const index = new Bm25Index([
      { chunkId: 'chunk-1', tokens: ['biru'] },
      { chunkId: 'chunk-0', tokens: ['merah'] },
    ]);
    expect(index.search(['biru']).map((hit) => hit.chunkId)).toEqual(['chunk-1', 'chunk-0']);
  });
});
