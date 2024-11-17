import { Injectable, Logger } from '@nestjs/common';
import { Document } from '@langchain/core/documents';
import { IEmbeddingServiceLogger } from './embedding-service-logger.requirements';
import { RelevantDocument } from '../document/document-processing.service.requirements';

@Injectable()
export class EmbeddingServiceLogger implements IEmbeddingServiceLogger {
  public logStoringDocuments(documents: Document[]): void {
    Logger.log(`Storing ${documents.length} documents`);
    if (documents.length > 0) {
      const storedContents = documents
        .map((doc) => doc.pageContent)
        .join('\n---\n');
      Logger.debug(`Stored document contents:\n${storedContents}`);
    }
  }

  public logQueryingContext(question: string): void {
    Logger.log(
      `Querying Pinecone for relevant context for question: "${question}"`
    );
  }

  public logNoMatchesFound(question: string): void {
    Logger.warn(`No matches found for question: "${question}"`);
  }

  public logRelevantDocuments(relevantDocs: RelevantDocument[]): void {
    Logger.debug(
      `Found ${
        relevantDocs.length
      } relevant documents. First few docs: ${JSON.stringify(relevantDocs)}`
    );
  }

  public logAverageScore(averageScore: number): void {
    Logger.log(`Average score for relevance: ${averageScore.toFixed(4)}`);
  }

  public logContextRelevance(
    contextIsRelevant: boolean,
    averageScore: number,
    question: string
  ): void {
    if (contextIsRelevant) {
      Logger.log(
        `Context relevant for question: "${question}". Average score: ${averageScore.toFixed(
          4
        )}`
      );
    } else {
      Logger.warn(
        `Question outside documented context: "${question}". Average score: ${averageScore.toFixed(
          4
        )}`
      );
    }
  }

  public logSimilarityScore(score: number): void {
    Logger.debug(`Calculated similarity score: ${score}`);
  }

  public logGeneratedEmbeddings(embeddings: number[][] | number[]): void {
    Logger.debug(`Generated embeddings: ${JSON.stringify(embeddings)}`);
  }
}
