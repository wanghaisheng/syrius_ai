import { Inject, Injectable } from '@nestjs/common';
import { IEmbeddingServiceLogger } from '../../services/embeddings/embedding-service-logger.requirements';
import { IEmbeddingService } from '../../services/embeddings/embeddings.service.requirements';
import { IPineConeService } from '../../services/pinecone/pinecone.service.requirements';
import { PineconeRecord } from '@pinecone-database/pinecone';

@Injectable()
export class EmbeddingRepository {
  private static readonly SIMILARITY_THRESHOLD = 0.6;

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
    }

    const relevantDocs = response.matches.map((match) => ({
      text: match.metadata?.text as string,
      score: match.score,
    }));

    relevantDocs.forEach((doc, index) => {
      this.logger.logRelevantDoc(index, doc.score, doc.text);
    });

    const averageScore = this.calculateAverageScore(relevantDocs);
    this.logger.logSimilarityScore(averageScore);

    const contextIsRelevant =
      averageScore >= EmbeddingRepository.SIMILARITY_THRESHOLD;
    this.logger.logContextRelevance(contextIsRelevant, averageScore, question);
    const combinedContext = contextIsRelevant
      ? this.combineContext(relevantDocs)
      : [];

    return { context: combinedContext, contextIsRelevant };
  }

  private calculateAverageScore(
    relevantDocs: Array<{ score: number }>
  ): number {
    const totalScore = relevantDocs.reduce((sum, doc) => sum + doc.score, 0);
    return totalScore / relevantDocs.length;
  }

  private combineContext(
    relevantDocs: Array<{ text: string; score: number }>
  ): string[] {
    const uniqueDocs = Array.from(
      new Set(
        relevantDocs.filter((doc) => doc.score >= 0.86).map((doc) => doc.text)
      )
    );
    return uniqueDocs.join('\n\n').split('\n\n');
  }
}
