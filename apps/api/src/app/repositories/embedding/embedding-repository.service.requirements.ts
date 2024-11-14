export interface IEmbeddingRepository {
  saveChunks(chunks: string[]): Promise<void>;
  getRelevantContext(
    question: string
  ): Promise<{ context: string[]; contextIsRelevant: boolean }>;
}
