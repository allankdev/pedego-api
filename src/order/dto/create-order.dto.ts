import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../order.entity';

export class CreateOrderDto {
  @ApiProperty({
    example: 'Hambúrguer Artesanal',
    description: 'Produto do pedido',
  })
  @IsString()
  @IsNotEmpty()
  product: string;

  @ApiProperty({
    example: 29.99,
    description: 'Preço do pedido',
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  // ❌ REMOVIDO: O userId vem do backend (req.user.id)
  // userId: number;

  @ApiProperty({
    example: 'pendente',
    enum: OrderStatus,
    required: false,
    description: 'Status do pedido (opcional, padrão é "pendente")',
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
