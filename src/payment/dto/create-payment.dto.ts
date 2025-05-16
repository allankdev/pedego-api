import { IsNotEmpty, IsNumber, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentMethod {
  PIX = 'PIX',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  CASH = 'CASH',
  STRIPE = 'STRIPE',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELED = 'CANCELED',
}

export enum PaymentType {
  ORDER = 'ORDER',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

export class CreatePaymentDto {
  @ApiProperty({ example: 49.9, description: 'Valor do pagamento' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    example: 'PIX',
    enum: PaymentMethod,
    description: 'Método de pagamento',
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @ApiProperty({
    example: 'ORDER',
    enum: PaymentType,
    description: 'Tipo de pagamento: pedido ou assinatura',
  })
  @IsEnum(PaymentType)
  @IsNotEmpty()
  type: PaymentType;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID do pedido (necessário se type for ORDER)',
  })
  @IsOptional()
  @IsNumber()
  orderId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID do usuário (necessário se type for SUBSCRIPTION)',
  })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiPropertyOptional({
    example: 'ch_1NG3k2H8dsM9k',
    description: 'ID da transação do Stripe (caso de assinatura)',
  })
  @IsOptional()
  @IsString()
  stripeTransactionId?: string;
}
