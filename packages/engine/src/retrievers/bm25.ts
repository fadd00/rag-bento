export type Bm25Document = { chunkId: string; tokens: string[] };
export type Bm25Hit = { chunkId: string; score: number };

export type Bm25Options = { k1?: number; b?: number };

export class Bm25Index {
  private readonly k1: number;
  private readonly b: number;
  private readonly documents: Bm25Document[];
  private readonly documentFrequency: Map<string, number>;
  private readonly averageLength: number;

  public constructor(documents: Bm25Document[], options: Bm25Options = {}) {
    this.k1 = options.k1 ?? 1.2;
    this.b = options.b ?? 0.75;
    if (this.k1 <= 0 || this.b < 0 || this.b > 1) throw new RangeError('invalid BM25 parameters');
    this.documents = [...documents];
    this.documentFrequency = new Map();
    for (const document of this.documents) {
      for (const token of new Set(document.tokens)) {
        this.documentFrequency.set(token, (this.documentFrequency.get(token) ?? 0) + 1);
      }
    }
    this.averageLength = this.documents.length === 0
      ? 0
      : this.documents.reduce((sum, document) => sum + document.tokens.length, 0) / this.documents.length;
  }

  public search(query: string[]): Bm25Hit[] {
    const documentCount = this.documents.length;
    const hits = this.documents.map((document) => {
      const frequencies = new Map<string, number>();
      for (const token of document.tokens) frequencies.set(token, (frequencies.get(token) ?? 0) + 1);
      const lengthFactor = this.averageLength === 0 ? 1 : document.tokens.length / this.averageLength;
      let score = 0;
      for (const token of query) {
        const frequency = frequencies.get(token) ?? 0;
        const df = this.documentFrequency.get(token) ?? 0;
        if (frequency === 0 || df === 0) continue;
        const idf = Math.log(1 + (documentCount - df + 0.5) / (df + 0.5));
        score += idf * (frequency * (this.k1 + 1)) / (frequency + this.k1 * (1 - this.b + this.b * lengthFactor));
      }
      return { chunkId: document.chunkId, score };
    });
    return hits.sort((left, right) => right.score - left.score || left.chunkId.localeCompare(right.chunkId));
  }
}
