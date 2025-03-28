// src/product/dto/create-product.dto.ts
import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Pizza Calabresa' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 29.90 })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({ example: 'Pizza com calabresa, cebola e mussarela' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ default: true })
  @IsBoolean()
  available: boolean;

  @ApiProperty({ example: 1, required: false, description: 'ID da categoria' })
  @IsOptional()
  @IsNumber()
  categoryId?: number;
}
