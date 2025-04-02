// src/product/dto/create-product.dto.ts
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
  @Type(() => Number) // 👈 importante!
  price: number;

  @ApiProperty({ example: 'Pizza com calabresa, cebola e mussarela' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ default: true })
  @IsBoolean()
  @Type(() => Boolean) // 👈 importante!
  available: boolean;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number) // 👈 importante!
  categoryId?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number) // 👈 importante!
  storeId?: number;
}
