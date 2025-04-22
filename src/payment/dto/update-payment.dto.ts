import { IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from './create-payment.dto';

export class UpdatePaymentDto {
  @ApiPropertyOptional({ example: 49.9, description: 'Novo valor do pagamento' })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({
    example: 'CREDIT_CARD',
    enum: PaymentMethod,
    description: 'Novo método de pagamento',
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    example: 1,
    description: 'Novo ID do pedido vinculado',
  })
  @IsOptional()
  @IsNumber()
  orderId?: number;

  @ApiPropertyOptional({
    example: 'CANCELED',
    enum: PaymentStatus,
    description: 'Status do pagamento',
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}
