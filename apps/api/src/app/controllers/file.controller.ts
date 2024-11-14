import {
  Body,
  Controller,
  Inject,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AskBody, AskResponse } from '../dtos/ask.dto';
import { File } from '../dtos/file.dto';
import { IChunkManagerService } from '../services/chunks/chunk-manager.service.requirements';
import { IEmbeddingRepository } from '../repositories/embedding/embedding-repository.service.requirements';
import { IFileExtractorService } from '../services/file-extractor/file-extractor.service.requirements';
import { IFileUploadService } from '../services/file-upload/file-upload.service.requirements';
import { ILLMServiceFactory } from '../factories/llm-service-factory.requirements';
import { LLMService } from '../services/llm/llm.service';

@Controller('rag')
export class FileController {
  constructor(
    @Inject('EmbeddingRepository')
    private readonly vectorDBEmbeddingRepository: IEmbeddingRepository,
    @Inject('IChunkManagerService')
    private readonly chunkManagerService: IChunkManagerService,
    @Inject('IFileExtractorService')
    private readonly fileExtractorService: IFileExtractorService,
    @Inject('IFileUploadService')
    private readonly fileUploadService: IFileUploadService,
    @Inject('ILLMServiceFactory')
    private readonly llmServiceFactory: ILLMServiceFactory
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  public async uploadFile(@UploadedFile() file: File): Promise<string> {
    try {
      if (!file) {
        throw new Error('No file uploaded');
      }

      const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
      if (!fileExtension) {
        throw new Error('Unable to determine file extension');
      }

      const fileUrl = await this.fileUploadService.uploadFile(
        file.buffer,
        file.originalname
      );

      const content = await this.fileExtractorService.extractContent(
        file.buffer,
        fileExtension
      );

      const chunks = await this.chunkManagerService.chunkDocument(
        content || ''
      );
      await this.vectorDBEmbeddingRepository.saveChunks(chunks);

      return `File uploaded successfully: ${fileUrl}`;
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  @Post('ask')
  public async ask(@Body() body: AskBody): Promise<AskResponse> {
    try {
      const { context, contextIsRelevant } =
        await this.vectorDBEmbeddingRepository.getRelevantContext(
          body.question
        );

      if (!contextIsRelevant) {
        return {
          answer: 'Unfortunately, no context-specific information was found.',
        };
      }

      const chatModel = this.llmServiceFactory.create(body.model);
      const llmService = new LLMService(chatModel);
      const answer = await llmService.askQuestion(
        body.question,
        context,
        contextIsRelevant
      );

      return { answer };
    } catch (error) {
      console.error('Error during ask operation:', error);
      throw error;
    }
  }
}
