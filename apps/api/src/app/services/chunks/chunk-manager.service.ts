import { Logger } from '@nestjs/common';
import { IChunkManagerService } from './chunk-manager.service.requirements';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

export class ChunkManagerService implements IChunkManagerService {
  private static readonly CHUNK_SIZE = 450;
  private static readonly CHUNK_OVERLAP = 150;

  public async chunkDocument(content: string): Promise<string[]> {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: ChunkManagerService.CHUNK_SIZE,
      chunkOverlap: ChunkManagerService.CHUNK_OVERLAP,
    });
    const chunks = await textSplitter.splitText(content);
    Logger.log(`Chunks generated: ${chunks.length}`);
    return chunks.filter((chunk) => chunk.length > 5);
  }
}
