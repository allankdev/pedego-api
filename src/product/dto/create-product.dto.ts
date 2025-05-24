import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateProductExtraGroupDto } from '../../product-extra/dto/create-product-extra-group.dto';

export class CreateProductDto {
  @ApiProperty({ example: 'Pizza Calabresa', description: 'Nome do produto' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 29.9, description: 'Preço do produto' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  price: number;

  @ApiProperty({ example: 'Pizza com calabresa, cebola e mussarela', description: 'Descrição do produto' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ default: true, description: 'Se o produto está disponível' })
  @IsBoolean()
  @Type(() => Boolean)
  available: boolean;

  @ApiProperty({ example: 1, required: false, description: 'ID da categoria (opcional)' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  categoryId?: number;

  @ApiProperty({ example: 1, required: false, description: 'ID da loja' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  storeId?: number;

  @ApiProperty({
    default: false,
    description: 'Define se o produto deve ter controle de estoque',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hasStockControl?: boolean;

  // ✅ NOVOS CAMPOS PARA CONTROLE DE DIAS DA SEMANA
  @ApiProperty({
    default: false,
    description: 'Define se o produto tem controle por dias da semana',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hasDayControl?: boolean;

  @ApiProperty({
    example: [1, 3, 5],
    required: false,
    description: 'Dias da semana em que o produto está disponível (0=Domingo, 1=Segunda, ..., 6=Sábado)',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  @Type(() => Number)
  availableDays?: number[];

  @ApiProperty({
    required: false,
    description: 'Grupos de extras associados ao produto',
    type: [CreateProductExtraGroupDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductExtraGroupDto)
  extraGroups?: CreateProductExtraGroupDto[];
}