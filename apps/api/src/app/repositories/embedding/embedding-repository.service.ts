import { Inject, Injectable } from '@nestjs/common';
import { PineconeRecord } from '@pinecone-database/pinecone';
import {
  IDocumentProcessingService,
  RelevantDocument,
} from '../../services/document/document-processing.service.requirements';
import { IEmbeddingService } from '../../services/embeddings/embeddings.service.requirements';
import { IEmbeddingServiceLogger } from '../../services/embeddings/embedding-service-logger.requirements';
import { IPineConeService } from '../../services/pinecone/pinecone.service.requirements';

@Injectable()
export class EmbeddingRepository {
  private static readonly SIMILARITY_THRESHOLD = 0.45;

  constructor(
    @Inject('IDocumentProcessingService')
    private readonly documentProcessingService: IDocumentProcessingService,
    @Inject('IEmbeddingService')
    private readonly embeddingService: IEmbeddingService,
    @Inject('IEmbeddingServiceLogger')
    private readonly logger: IEmbeddingServiceLogger,
    @Inject('IPineConeService')
    private readonly pineconeService: IPineConeService
  ) {}

  public async saveChunks(chunks: string[]): Promise<void> {
    const embeddings = await this.embeddingService.embedChunks(chunks);
    const records: PineconeRecord[] = embeddings.map((values, i) => ({
      id: `vec${i + 1}`,
      values,
      metadata: { text: chunks[i] },
    }));

    this.logger.logStoringDocuments(
      records.map((record) => ({
        pageContent: String(record.metadata.text),
        metadata: record.metadata,
      }))
    );

    await this.pineconeService.upsertDocuments('syrius-index', records);
  }

  public async getRelevantContext(
    question: string
  ): Promise<{ context: string[]; contextIsRelevant: boolean }> {
    const queryEmbedding = await this.embeddingService.embedQuery(question);

    this.logger.logQueryingContext(question);
    const response = await this.pineconeService.queryDocuments('syrius-index', {
      topK: 15,
      vector: queryEmbedding,
      includeMetadata: true,
    });

    if (response.matches.length === 0) {
      this.logger.logNoMatchesFound(question);
      return { context: [], contextIsRelevant: false };
    }

    const relevantDocs: RelevantDocument[] = response.matches
      .filter((match) => match.score >= 0.5)
      .map((match) => ({
        text: match.metadata?.text as string,
        score: match.score,
      }));

    this.logger.logRelevantDocuments(relevantDocs);

    const averageScore =
      this.documentProcessingService.calculateAverageScore(relevantDocs);
    this.logger.logAverageScore(averageScore);

    const contextIsRelevant = averageScore >= 0.8 && relevantDocs.length > 0;

    this.logger.logContextRelevance(contextIsRelevant, averageScore, question);

    const combinedContext = contextIsRelevant
      ? this.documentProcessingService.combineContext(relevantDocs)
      : [];

    return { context: combinedContext, contextIsRelevant };
  }
}
