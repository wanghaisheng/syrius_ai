import { Inject, Injectable } from '@nestjs/common';
import {
  Pinecone,
  Index,
  PineconeRecord,
  QueryOptions,
  QueryResponse,
  RecordMetadata,
} from '@pinecone-database/pinecone';
import { IThirdPartyAPIKeyService } from '../../config/third-party-api-key.config.requirements';
import { IPineConeService } from './pinecone.service.requirements';

@Injectable()
export class PineconeService implements IPineConeService {
  private pineconeClient: Pinecone;
  private index: Index;

  constructor(
    @Inject('IThirdPartyAPIKeyService')
    private readonly thirdPartyApiKeyService: IThirdPartyAPIKeyService
  ) {
    this.pineconeClient = new Pinecone({
      apiKey: this.thirdPartyApiKeyService.getPineconeApiKey(),
    });
    this.index = this.pineconeClient.index('syrius-index');
  }

  public async upsertDocuments(
    namespace: string,
    records: PineconeRecord[]
  ): Promise<void> {
    await this.index.namespace(namespace).upsert(records);
  }

  public async queryDocuments(
    namespace: string,
    query: QueryOptions
  ): Promise<QueryResponse<RecordMetadata>> {
    return await this.index.namespace(namespace).query(query);
  }
}
