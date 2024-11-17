import { Document } from '@langchain/core/documents';
import { RelevantDocument } from '../document/document-processing.service.requirements';

export interface IEmbeddingServiceLogger {
  logStoringDocuments(documents: Document<Record<string, unknown>>[]): void;
  logQueryingContext(question: string): void;
  logNoMatchesFound(question: string): void;
  logRelevantDocuments(relevantDocs: RelevantDocument[]): void;
  logAverageScore(averageScore: number): void;
  logContextRelevance(
    contextIsRelevant: boolean,
    averageScore: number,
    question: string
  ): void;
  logSimilarityScore(score: number): void;
  logGeneratedEmbeddings(embeddings: number[][] | number[]): void;
}
