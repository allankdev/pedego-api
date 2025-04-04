import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
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
