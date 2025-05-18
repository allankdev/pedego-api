import { IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '../payment.entity';

export class UpdatePaymentDto {
  @ApiPropertyOptional({ example: 49.9, description: 'Novo valor do pagamento' })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({
    example: 'cartao_credito',
    enum: PaymentMethod,
    description: 'Novo método de pagamento (pix, dinheiro, cartao_credito, etc.)',
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
    example: 'cancelled',
    enum: PaymentStatus,
    description: 'Novo status do pagamento (pending, paid, failed, cancelled)',
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}
