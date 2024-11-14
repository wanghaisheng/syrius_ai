import { Inject, Injectable } from '@nestjs/common';
import { Pinecone, Index } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import { IEmbeddingRepository } from './embedding-repository.service.requirements';
import { IEmbeddingRepositoryLogger } from './embedding-repository-logger.requirements';

@Injectable()
export class EmbeddingRepository implements IEmbeddingRepository {
  private pineconeClient: Pinecone;
  private index: Index;
  private static readonly SIMILARITY_THRESHOLD = 0.6;

  constructor(
    @Inject('EmbeddingRepositoryLogger')
    private readonly logger: IEmbeddingRepositoryLogger
  ) {
    this.pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    this.index = this.pineconeClient.index('syrius-index');
  }

  public async saveChunks(chunks: string[]): Promise<void> {
    const embeddings = await this.embedChunks(chunks);
    const records = embeddings.map((values, i) => ({
      id: `vec${i + 1}`,
      values,
      metadata: { text: chunks[i] },
    }));

    this.logger.logStoringDocuments(
      records.map((record) => ({
        pageContent: record.metadata.text,
        metadata: record.metadata,
      }))
    );
    await this.index.namespace('syrius-index').upsert(records);
  }

  public async getRelevantContext(
    question: string
  ): Promise<{ context: string[]; contextIsRelevant: boolean }> {
    const queryEmbedding = await this.embedQuery(question);

    this.logger.logQueryingContext(question);
    const response = await this.index.namespace('syrius-index').query({
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
    this.logger.logAverageScore(averageScore);

    const contextIsRelevant =
      averageScore >= EmbeddingRepository.SIMILARITY_THRESHOLD;
    this.logger.logContextRelevance(contextIsRelevant, averageScore, question);
    const combinedContext = contextIsRelevant
      ? this.combineContext(relevantDocs)
      : [];

    return { context: combinedContext, contextIsRelevant };
  }

  private async embedChunks(chunks: string[]): Promise<number[][]> {
    const embeddingModel = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY || '',
    });
    const embeddings = await embeddingModel.embedDocuments(chunks);

    this.logger.logGeneratedEmbeddings(embeddings);

    return embeddings;
  }

  private async embedQuery(question: string): Promise<number[]> {
    const embeddingModel = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY || '',
    });
    const embedding = await embeddingModel.embedQuery(question);

    this.logger.logGeneratedEmbeddings(embedding);

    return embedding;
  }

  private calculateAverageScore(
    relevantDocs: Array<{ score: number }>
  ): number {
    const totalScore = relevantDocs.reduce((sum, doc) => sum + doc.score, 0);
    const averageScore = totalScore / relevantDocs.length;
    this.logger.logSimilarityScore(averageScore);
    return averageScore;
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
