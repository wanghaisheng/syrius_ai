import { Logger } from '@nestjs/common';
import { ChunkManagerService } from './chunk-manager.service';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { jest } from '@jest/globals';

jest.mock('@langchain/textsplitters');

describe('The ChunkManagerService class', () => {
  let chunkManager: ChunkManagerService;
  let textSplitter: jest.Mocked<RecursiveCharacterTextSplitter>;

  beforeEach(() => {
    chunkManager = new ChunkManagerService();
    textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: ChunkManagerService['CHUNK_SIZE'],
      chunkOverlap: ChunkManagerService['CHUNK_OVERLAP'],
    }) as jest.Mocked<RecursiveCharacterTextSplitter>;

    (RecursiveCharacterTextSplitter as unknown as jest.Mock).mockImplementation(
      () => textSplitter
    );

    jest.spyOn(Logger, 'log').mockImplementation((message: string) => {
      console.log(message);
    });

    jest.clearAllMocks();
  });

  describe('The chunkDocument method', () => {
    it('should split the document into chunks', async () => {
      const mockContent =
        'This is a test document that needs to be split into chunks.';
      const mockChunks = [
        'This is a test',
        'document that needs',
        'to be split into',
        'chunks.',
      ];

      textSplitter.splitText.mockResolvedValue(mockChunks);

      const result = await chunkManager.chunkDocument(mockContent);

      expect(result).toEqual(mockChunks);
      expect(textSplitter.splitText).toHaveBeenCalledWith(mockContent);
      expect(Logger.log).toHaveBeenCalledWith(
        `Chunks generated: ${mockChunks.length}`
      );
    });

    it('should log the correct number of chunks generated', async () => {
      const mockContent = 'Another test content that will also be split.';
      const mockChunks = [
        'Another test',
        'content that will',
        'also be split.',
      ];

      textSplitter.splitText.mockResolvedValue(mockChunks);

      await chunkManager.chunkDocument(mockContent);

      expect(Logger.log).toHaveBeenCalledWith(
        `Chunks generated: ${mockChunks.length}`
      );
    });
  });
});
