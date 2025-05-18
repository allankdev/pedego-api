import { IsNotEmpty, IsNumber, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus, PaymentType } from '../payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ example: 49.9, description: 'Valor do pagamento' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    example: 'pix',
    enum: PaymentMethod,
    description: 'Método de pagamento (pix, dinheiro, cartao_credito, etc.)',
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @ApiProperty({
    example: 'ORDER',
    enum: PaymentType,
    description: 'Tipo de pagamento: pedido (ORDER) ou assinatura (SUBSCRIPTION)',
  })
  @IsEnum(PaymentType)
  @IsNotEmpty()
  type: PaymentType;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID do pedido (obrigatório se type for ORDER)',
  })
  @IsOptional()
  @IsNumber()
  orderId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID do usuário (obrigatório se type for SUBSCRIPTION)',
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
