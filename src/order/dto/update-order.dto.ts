import {
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  ValidateNested,
  IsEmail,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../order.entity';

class UpdateOrderItemDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;
}

export class UpdateOrderDto {
  @ApiProperty({ example: 'João da Silva', required: false })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiProperty({ example: 'joao@email.com', required: false })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiProperty({ example: '+55 11999999999', required: false })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiProperty({ example: 'Rua Nova, 456', required: false })
  @IsOptional()
  @IsString()
  customerAddress?: string;

  @ApiProperty({
    example: 'entrega',
    enum: ['entrega', 'retirada'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['entrega', 'retirada'])
  deliveryType?: 'entrega' | 'retirada';

  @ApiProperty({
    example: 'cartao',
    enum: ['pix', 'dinheiro', 'cartao'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['pix', 'dinheiro', 'cartao'])
  paymentMethod?: 'pix' | 'dinheiro' | 'cartao';

  @ApiProperty({
    type: [UpdateOrderItemDto],
    required: false,
    description: 'Itens atualizados do pedido',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  items?: UpdateOrderItemDto[];

  @ApiProperty({
    example: 'entregue',
    enum: OrderStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
