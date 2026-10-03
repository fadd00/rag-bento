export type Chunk = {
  chunkId: string;
  text: string;
  start: number;
  end: number;
  tokenCount?: number;
};

export type GoldSpan = { start: number; end: number };
