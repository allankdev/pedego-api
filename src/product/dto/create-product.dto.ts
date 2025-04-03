import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 'Pizza Calabresa' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 29.90 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  price: number;

  @ApiProperty({ example: 'Pizza com calabresa, cebola e mussarela' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ default: true })
  @IsBoolean()
  @Type(() => Boolean)
  available: boolean;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  categoryId?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  storeId?: number;

  @ApiProperty({ default: false, description: 'Define se o produto deve ter controle de estoque' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hasStockControl?: boolean;
}
