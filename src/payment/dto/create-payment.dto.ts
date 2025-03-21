import { IsNotEmpty, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentMethod {
  PIX = 'PIX',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  CASH = 'CASH',
}

export class CreatePaymentDto {
  @ApiProperty({ example: 49.9, description: 'Valor do pagamento' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 'PIX', enum: PaymentMethod, description: 'Método de pagamento' })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod; // 👈 mesmo nome da entidade

  @ApiProperty({ example: 1, description: 'ID do pedido relacionado ao pagamento' })
  @IsNumber()
  @IsNotEmpty()
  orderId: number;
}
