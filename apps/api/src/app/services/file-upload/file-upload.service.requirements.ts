export interface IFileUploadService {
  uploadFile(fileBuffer: Buffer, fileName: string): Promise<string>;
}
