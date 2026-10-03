import type { Chunk, GoldSpan } from '../chunkers/types.ts';

export function spanOverlap(chunk: Chunk, gold: GoldSpan): number {
  return Math.max(0, Math.min(chunk.end, gold.end) - Math.max(chunk.start, gold.start));
}

export function isRelevant(chunk: Chunk, gold: GoldSpan, tau = 0.5): boolean {
  if (tau < 0 || tau > 1) throw new RangeError('tau must be between 0 and 1');
  const overlap = spanOverlap(chunk, gold);
  const minimumLength = Math.min(chunk.end - chunk.start, gold.end - gold.start);
  return minimumLength > 0 && overlap >= tau * minimumLength;
}
