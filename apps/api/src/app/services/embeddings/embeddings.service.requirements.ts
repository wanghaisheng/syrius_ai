export interface IEmbeddingService {
  embedChunks(chunks: string[]): Promise<number[][]>;
  embedQuery(question: string): Promise<number[]>;
}
