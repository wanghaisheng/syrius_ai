import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { IFileUploadService } from './file-upload.service.requirements';

@Injectable()
export class FileUploadService implements IFileUploadService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({ region: process.env.AWS_REGION });
    this.bucketName = process.env.S3_BUCKET_NAME;
  }

  public async uploadFile(
    fileBuffer: Buffer,
    fileName: string
  ): Promise<string> {
    const uploadParams = {
      Bucket: this.bucketName,
      Key: fileName,
      Body: fileBuffer,
      ContentType: 'application/pdf',
    };

    try {
      const command = new PutObjectCommand(uploadParams);
      await this.s3Client.send(command);
      Logger.log(`File successfully downloaded : ${fileName}`);

      return `https://${this.bucketName}.s3.amazonaws.com/${fileName}`;
    } catch (error) {
      Logger.error(`Error uploading to S3 : ${error.message}`);
      throw new Error(`Upload error : ${error.message}`);
    }
  }
}
