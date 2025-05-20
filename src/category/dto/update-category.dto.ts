import { PartialType } from '@nestjs/swagger'
import { CreateCategoryDto } from './create-category.dto'
import { IsNumber, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @ApiPropertyOptional({ example: 0, description: 'Nova posição da categoria' })
  @IsNumber()
  @IsOptional()
  position?: number
}
