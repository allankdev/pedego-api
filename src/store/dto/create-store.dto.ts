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

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  manualOverride?: boolean;

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

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  autoPrint?: boolean;

  @ApiProperty({
    example: ['pix', 'dinheiro', 'cartão de crédito'],
    description: 'Formas de pagamento aceitas',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  paymentMethods?: string[];

  @ApiProperty({ example: 'avatar_image_id', required: false })
  @IsOptional()
  @IsString()
  avatarImageId?: string;

  @ApiProperty({ example: 'cover_image_id', required: false })
  @IsOptional()
  @IsString()
  coverImageId?: string;

  // --- NOVOS CAMPOS DE ENDEREÇO ---

  @ApiProperty({ example: 'Rua das Flores', required: false })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiProperty({ example: '123', required: false })
  @IsOptional()
  @IsString()
  number?: string;

  @ApiProperty({ example: 'Sala 4', required: false })
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiProperty({ example: 'Centro', required: false })
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiProperty({ example: 'São Paulo', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'SP', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: '01000-000', required: false })
  @IsOptional()
  @IsString()
  zipCode?: string;

  // -----------------------------------
}
