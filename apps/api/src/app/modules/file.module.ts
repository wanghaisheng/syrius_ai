import { Module } from '@nestjs/common';
import { ChunkManagerService } from '../services/chunks/chunk-manager.service';
import { EmbeddingRepository } from '../repositories/embedding/embedding-repository.service';
import { EmbeddingRepositoryLogger } from '../repositories/embedding/embedding-repository-logger.service';
import { FileController } from '../controllers/file.controller';
import { FileExtractorService } from '../services/file-extractor/file-extractor.service';
import { FileUploadService } from '../services/file-upload/file-upload.service';
import { LLMServiceFactory } from '../factories/llm-service-factory';

@Module({
  controllers: [FileController],
  providers: [
    { provide: 'EmbeddingRepository', useClass: EmbeddingRepository },
    {
      provide: 'EmbeddingRepositoryLogger',
      useClass: EmbeddingRepositoryLogger,
    },
    { provide: 'IChunkManagerService', useClass: ChunkManagerService },
    { provide: 'IFileExtractorService', useClass: FileExtractorService },
    { provide: 'IFileUploadService', useClass: FileUploadService },
    { provide: 'ILLMServiceFactory', useClass: LLMServiceFactory },
  ],
})
export class FileModule {}
