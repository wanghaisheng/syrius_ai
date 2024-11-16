import { Inject, Injectable } from '@nestjs/common';
import { OpenAIEmbeddings } from '@langchain/openai';
import { IEmbeddingServiceLogger } from './embedding-service-logger.requirements';
import { IThirdPartyAPIKeyService } from '../../config/third-party-api-key.config.requirements';
import { IEmbeddingService } from './embeddings.service.requirements';

@Injectable()
export class EmbeddingService implements IEmbeddingService {
  constructor(
    @Inject('IThirdPartyAPIKeyService')
    private readonly thirdPartyApiKeyService: IThirdPartyAPIKeyService,
    @Inject('IEmbeddingServiceLogger')
    private readonly logger: IEmbeddingServiceLogger
  ) {}

  public async embedChunks(chunks: string[]): Promise<number[][]> {
    const embeddingModel = new OpenAIEmbeddings({
      openAIApiKey: this.thirdPartyApiKeyService.getOpenAIApiKey(),
    });
    const embeddings = await embeddingModel.embedDocuments(chunks);
    this.logger.logGeneratedEmbeddings(embeddings);
    return embeddings;
  }

  public async embedQuery(question: string): Promise<number[]> {
    const embeddingModel = new OpenAIEmbeddings({
      openAIApiKey: this.thirdPartyApiKeyService.getOpenAIApiKey(),
    });
    const embedding = await embeddingModel.embedQuery(question);
    this.logger.logGeneratedEmbeddings(embedding);
    return embedding;
  }
}
