import { IsOptional, IsNumber, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../order.entity';

export class UpdateOrderDto {
  @ApiProperty({ example: 'Pizza Calabresa', required: false })
  @IsOptional()
  @IsString()
  product?: string;

  @ApiProperty({ example: 39.90, required: false })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({
    example: 'entregue',
    enum: OrderStatus,
    required: false,
    description: 'Novo status do pedido',
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
