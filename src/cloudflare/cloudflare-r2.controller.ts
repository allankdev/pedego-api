import {
  Controller,
  Post,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { CloudflareR2Service } from './cloudflare-r2.service';

@ApiTags('Cloudflare R2')
@Controller('r2')
export class CloudflareR2Controller {
  constructor(private readonly r2Service: CloudflareR2Service) {}

  // Endpoint para upload de arquivo
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async upload(@UploadedFile() file: Express.Multer.File) {
    return this.r2Service.uploadFile(file);
  }

  // Endpoint para excluir arquivo
  @Delete('delete/:filename')
  async deleteFile(@Param('filename') filename: string) {
    const decodedFilename = decodeURIComponent(filename); // ✅ ESSENCIAL
    console.log(`Tentando excluir o arquivo: ${decodedFilename}`);
  
    try {
      await this.r2Service.deleteFile(decodedFilename);
      return { message: 'Arquivo excluído com sucesso!' };
    } catch (error) {
      console.error('Erro ao excluir arquivo no R2:', error);
      throw new Error('Erro ao excluir arquivo: ' + error.message);
    }
  }
  
}
