// src/order/dto/create-order.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
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

  @ApiProperty({
    example: [3, 5],
    description: 'IDs dos extras selecionados para este produto',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  extraIds?: number[];
}

export class CreateOrderDto {
  @ApiProperty({ example: 'Joao da Silva' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ example: '+55 11999999999' })
  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @ApiProperty({
    example: 'Rua Exemplo, 123 - Bairro Legal',
    required: false,
  })
  @IsString()
  @IsOptional()
  customerAddress?: string;

  @ApiProperty({
    example: 1,
    description: 'ID do bairro (obrigatório se entrega)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  neighborhoodId?: number;

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
    example: 'Sem cebola, tocar campainha',
    required: false,
    description: 'Observacoes adicionais do pedido',
  })
  @IsOptional()
  @IsString()
  observations?: string;

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

  @ApiProperty({
    example: 1,
    description: 'ID da loja que esta recebendo o pedido',
  })
  @IsNumber()
  storeId: number;
}
