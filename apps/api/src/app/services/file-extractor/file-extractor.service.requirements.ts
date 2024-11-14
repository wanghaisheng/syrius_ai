export interface IFileExtractorService {
  extractContent(
    fileBuffer: Buffer,
    fileExtension: string
  ): Promise<string | null>;
}
