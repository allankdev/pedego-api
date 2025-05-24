import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsBoolean, IsArray, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

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

  // ✅ NOVOS CAMPOS PARA CONTROLE DE DIAS DA SEMANA
  @ApiPropertyOptional({ description: 'Controle por dias da semana' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  hasDayControl?: boolean;

  @ApiPropertyOptional({
    example: [1, 3, 5],
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
}