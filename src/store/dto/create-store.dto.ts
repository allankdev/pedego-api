import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateStoreDto {
  @ApiProperty({ example: 'Minha Loja', description: 'Nome da loja' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Loja especializada em produtos artesanais', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'minhaloja', description: 'Subdomínio único da loja' })
  @IsString()
  @IsNotEmpty()
  subdomain: string;
}
