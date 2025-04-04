import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({ description: 'ID da categoria (opcional)' })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({ description: 'Disponibilidade do produto' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  available?: boolean;

  @ApiPropertyOptional({ description: 'Controle de estoque' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  hasStockControl?: boolean;
}
