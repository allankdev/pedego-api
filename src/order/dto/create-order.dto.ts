import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsEmail,
  ValidateNested,
  IsPhoneNumber,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../order.entity';

export class OrderItemDto {
  @ApiProperty({ example: 1, description: 'ID do produto' })
  @IsNumber()
  productId: number;

  @ApiProperty({ example: 2, description: 'Quantidade do produto' })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'João da Silva' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  customerEmail: string;

  @ApiProperty({ example: '+55 11999999999' })
  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @ApiProperty({ example: 'Rua Exemplo, 123 - Bairro Legal' })
  @IsString()
  @IsNotEmpty()
  customerAddress: string;

  @ApiProperty({
    example: 'entrega',
    enum: ['entrega', 'retirada'],
  })
  @IsEnum(['entrega', 'retirada'])
  deliveryType: 'entrega' | 'retirada';

  @ApiProperty({
    example: 'pix',
    enum: ['pix', 'dinheiro', 'cartao'],
  })
  @IsEnum(['pix', 'dinheiro', 'cartao'])
  paymentMethod: 'pix' | 'dinheiro' | 'cartao';

  @ApiProperty({
    type: [OrderItemDto],
    description: 'Lista de itens do pedido',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({
    example: 'pendente',
    enum: OrderStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
