import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateStockDto {
  @ApiProperty({ example: 1, description: 'ID do produto' })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ example: 1, description: 'ID da loja' })
  @IsNumber()
  @IsNotEmpty()
  storeId: number;

  @ApiProperty({ example: 100, description: 'Quantidade em estoque' })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
