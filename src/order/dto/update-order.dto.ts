import {
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../order.entity';
import { PaymentMethod } from '../../payment/payment.entity'; // Puxando do enum real oficial

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
    example: 'pix',
    enum: PaymentMethod,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

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
