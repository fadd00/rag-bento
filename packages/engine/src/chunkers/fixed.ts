import type { Chunk } from './types.ts';

export function fixedChunks(text: string, size: number, overlap = 0): Chunk[] {
  if (!Number.isInteger(size) || size <= 0) throw new RangeError('size must be positive');
  if (!Number.isInteger(overlap) || overlap < 0 || overlap >= size) throw new RangeError('overlap must be in [0, size)');
  const chunks: Chunk[] = [];
  const step = size - overlap;
  for (let start = 0; start < text.length; start += step) {
    const end = Math.min(text.length, start + size);
    chunks.push({ chunkId: `chunk-${chunks.length}`, text: text.slice(start, end), start, end });
    if (end === text.length) break;
  }
  return chunks;
}
