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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../order.entity';
import { PaymentMethod } from '../../payment/payment.entity';

export class OrderItemDto {
  @ApiProperty({ example: 1, description: 'ID do produto' })
  @IsNumber()
  productId: number;

  @ApiProperty({ example: 2, description: 'Quantidade do produto' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    example: [3, 5],
    description: 'IDs dos extras selecionados para este produto',
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  extraIds?: number[];
}

export class CreateOrderDto {
  @ApiProperty({ example: 'João da Silva' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ example: '+55 11999999999' })
  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @ApiPropertyOptional({
    example: 'Rua Exemplo, 123 - Bairro Legal',
    description: 'Endereço do cliente (obrigatório se entrega)',
  })
  @IsOptional()
  @IsString()
  customerAddress?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID do bairro (obrigatório se entrega)',
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
    example: PaymentMethod.PIX,
    enum: PaymentMethod,
    description: 'Método de pagamento (pix, dinheiro, cartao_credito, etc.)',
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    example: 'Sem cebola, tocar campainha',
    description: 'Observações adicionais do pedido',
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

  @ApiPropertyOptional({
    example: 'pendente',
    enum: OrderStatus,
    description: 'Status do pedido (opcional, default: pendente)',
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({
    example: 1,
    description: 'ID da loja que está recebendo o pedido',
  })
  @IsNumber()
  storeId: number;

  @ApiPropertyOptional({
    example: 2,
    description: 'ID do cupom aplicado ao pedido (opcional)',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  couponId?: number;
}
