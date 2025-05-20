import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Bebidas', description: 'Nome da categoria' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 0, description: 'Ordem de exibição da categoria' })
  @IsNumber()
  @IsOptional()
  position?: number;
}
