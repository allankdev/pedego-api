import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { CreateStockDto } from './create-stock.dto';

export class UpdateStockDto extends PartialType(CreateStockDto) {
  @ApiPropertyOptional({ example: 200, description: 'Nova quantidade em estoque' })
  @IsOptional()
  @IsNumber()
  quantity?: number;
}
