import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private s3: S3Client;
  private bucket: string;
  private readonly logger = new Logger(StorageService.name);

  constructor(private configService: ConfigService) {
    this.bucket = configService.get<string>('app.aws.s3Bucket', 'airix-ai-storage');
    this.s3 = new S3Client({
      region: configService.get<string>('app.aws.region', 'ap-south-1'),
      credentials: {
        accessKeyId: configService.get<string>('app.aws.accessKeyId', ''),
        secretAccessKey: configService.get<string>('app.aws.secretAccessKey', ''),
      },
    });
  }

  async uploadFile(file: Buffer, mimeType: string, folder = 'uploads'): Promise<string> {
    const key = `${folder}/${uuidv4()}`;
    await this.s3.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: file, ContentType: mimeType }));
    return key;
  }

  async getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    return getSignedUrl(this.s3, new GetObjectCommand({ Bucket: this.bucket, Key: key }), { expiresIn });
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  getPublicUrl(key: string): string {
    return `https://${this.bucket}.s3.${this.configService.get('app.aws.region', 'ap-south-1')}.amazonaws.com/${key}`;
  }
}
