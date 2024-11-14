import { Document } from '@langchain/core/documents';

export interface IEmbeddingRepositoryLogger {
  logStoringDocuments(documents: Document<Record<string, unknown>>[]): void;
  logQueryingContext(question: string): void;
  logNoMatchesFound(question: string): void;
  logRelevantDoc(index: number, score: number, text: string): void;
  logAverageScore(averageScore: number): void;
  logContextRelevance(
    contextIsRelevant: boolean,
    averageScore: number,
    question: string
  ): void;
  logSimilarityScore(score: number): void;
  logGeneratedEmbeddings(embeddings: number[][] | number[]): void;
}
