import {
  PineconeRecord,
  QueryOptions,
  QueryResponse,
  RecordMetadata,
} from '@pinecone-database/pinecone';

export interface IPineConeService {
  upsertDocuments(namespace: string, records: PineconeRecord[]): Promise<void>;
  queryDocuments(
    namespace: string,
    query: QueryOptions
  ): Promise<QueryResponse<RecordMetadata>>;
}
