import { Logger } from '@nestjs/common';
import { IFileExtractorService } from './file-extractor.service.requirements';
import pdf from 'pdf-parse';
import markdownToTxt from 'markdown-to-txt';

export class FileExtractorService implements IFileExtractorService {
  public async extractContent(
    fileBuffer: Buffer,
    fileExtension: string
  ): Promise<string | null> {
    switch (fileExtension.toLowerCase()) {
      case 'pdf':
        return this.extractTextFromPDF(fileBuffer);
      case 'md':
        return this.extractTextFromMarkdown(fileBuffer);
      default:
        Logger.warn(`Unsupported file type: ${fileExtension}`);
        this.fileNotSupported(fileExtension);
        return null;
    }
  }

  private async extractTextFromPDF(fileBuffer: Buffer): Promise<string> {
    const { text } = await pdf(fileBuffer);
    Logger.log(`PDF extracted text length: ${text.length}`);
    return text;
  }

  private async extractTextFromMarkdown(fileBuffer: Buffer): Promise<string> {
    const text = markdownToTxt(fileBuffer.toString('utf-8'));
    Logger.log(`Markdown extracted text length: ${text.length}`);
    return text;
  }

  private fileNotSupported(fileExtension: string): void {
    throw new Error(`Unsupported file type: ${fileExtension}`);
  }
}
