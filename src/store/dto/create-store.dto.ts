import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateStoreDto {
  @ApiProperty({ example: 'Minha Loja' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Loja especializada em produtos artesanais',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'minhaloja',
    description: 'Subdomínio único da loja',
  })
  @IsString()
  @IsNotEmpty()
  subdomain: string;

  @ApiProperty({ example: 'contato@minhaloja.com', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: '+55 11999999999', required: false })
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiProperty({ example: 'Brasil', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({
    
    example: 'entrega',
    enum: ['entrega', 'retirada', 'ambos'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['entrega', 'retirada', 'ambos'])
  operationMode?: 'entrega' | 'retirada' | 'ambos';

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;

  @ApiProperty({ example: '30-45 min', required: false })
  @IsOptional()
  @IsString()
  deliveryTime?: string;

  @ApiProperty({ example: 30.0, required: false })
  @IsOptional()
  @IsNumber()
  minOrderValue?: number;

  @ApiProperty({ example: 'medium', required: false })
  @IsOptional()
  @IsString()
  printFontSize?: string;

  @ApiProperty({ example: '80mm', required: false })
  @IsOptional()
  @IsString()
  printPaperSize?: string;

  @IsOptional()
  @ApiProperty({
    example: ['pix', 'dinheiro', 'cartão de crédito'],
    description: 'Formas de pagamento aceitas',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()  // Garante que o array de formas de pagamento não esteja vazio
  @IsString({ each: true })
  paymentMethods?: string[];
}
