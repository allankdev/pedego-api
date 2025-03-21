import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDeliveryDto {
  @ApiProperty({ example: 'Rua das Palmeiras, 45' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ example: '2025-03-22T14:00:00Z' })
  @IsNotEmpty()
  @IsDateString()
  deliveryDate: string;

  @ApiProperty({ example: 'pendente', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ example: 1, description: 'ID do pedido relacionado à entrega' })
  @IsNotEmpty()
  orderId: number;
}
