export const LIMITS = {
  liveEmbeddingChunkCap: 150, // TODO(M0): confirm on target hardware.
  semanticMaxSentences: 60, // TODO(M0): calibrate with the spike.
  timingBatchSize: 20, // TODO(M0): calibrate against timer resolution.
  uploadBytes: 2_000_000, // Provisional product bound from the PRD.
  minimumLabeledQueries: 5,
  relevanceTau: 0.5,
} as const;
