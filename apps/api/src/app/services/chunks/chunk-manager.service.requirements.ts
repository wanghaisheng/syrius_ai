export interface IChunkManagerService {
  chunkDocument(content: string): Promise<string[]>;
}
