import { Inject, Injectable } from '@nestjs/common';
import { PineconeRecord } from '@pinecone-database/pinecone';
import { IEmbeddingService } from '../../services/embeddings/embeddings.service.requirements';
import { IEmbeddingServiceLogger } from '../../services/embeddings/embedding-service-logger.requirements';
import { IPineConeService } from '../../services/pinecone/pinecone.service.requirements';
import { IEmbeddingRepository } from './embedding-repository.service.requirements';

@Injectable()
export class EmbeddingRepository implements IEmbeddingRepository {
  private static readonly MIN_SCORE_THRESHOLD = 0.5; // ROP: Threshold for document matching
  private static readonly CONTEXT_RELEVANT_THRESHOLD = 0.6; // ROP: Threshold for determining whether the context is relevant

  constructor(
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

    const relevantDocs = response.matches
      .filter((match) => match.score >= EmbeddingRepository.MIN_SCORE_THRESHOLD)
      .map((match) => ({
        text: match.metadata?.text as string,
        score: match.score,
      }));

    this.logger.logRelevantDocuments(relevantDocs);

    const averageScore =
      relevantDocs.reduce((acc, doc) => acc + doc.score, 0) /
      relevantDocs.length;
    this.logger.logAverageScore(averageScore);

    const contextIsRelevant =
      averageScore >= EmbeddingRepository.CONTEXT_RELEVANT_THRESHOLD &&
      relevantDocs.length > 0;
    this.logger.logContextRelevance(contextIsRelevant, averageScore, question);

    const combinedContext = contextIsRelevant
      ? relevantDocs.map((doc) => doc.text)
      : [];
    return { context: combinedContext, contextIsRelevant };
  }
}
