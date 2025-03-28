// src/category/dto/update-category.dto.ts
import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Sobremesas', description: 'Novo nome da categoria (opcional)' })
  @IsString()
  @IsOptional()
  name?: string;
}
