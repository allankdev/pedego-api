import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CloudflareR2Service {
  private readonly s3: S3Client;
  private readonly bucket = process.env.R2_BUCKET;
  private readonly publicBaseUrl = 'https://pub-89335a236e764dca827836a2c27c4115.r2.dev'; // R2.dev URL pública

  constructor() {
    this.s3 = new S3Client({
      region: process.env.R2_REGION,
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY,
        secretAccessKey: process.env.R2_SECRET_KEY,
      },
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<{ url: string }> {
    const filename = `${uuidv4()}-${file.originalname.replace(/\s/g, '_')}`;

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: filename,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      const url = `${this.publicBaseUrl}/${filename}`;
      return { url };
    } catch (error) {
      console.error('Erro ao fazer upload no R2:', error);
      throw new InternalServerErrorException('Erro ao enviar imagem para o R2');
    }
  }
}
