import { PartialType } from '@nestjs/mapped-types';
import { CreateProductExtraDto } from './create-product-extra.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductExtraDto extends PartialType(CreateProductExtraDto) {
  @ApiPropertyOptional({ description: 'ID do extra' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  id?: number;
}
